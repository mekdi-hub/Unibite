import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'
import axios from 'axios'

const PaymentCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, failed
  const [message, setMessage] = useState('Verifying your payment...')
  const hasRunRef = useRef(false) // Use ref to persist across React Strict Mode remounts

  useEffect(() => {
    // Prevent double execution in React Strict Mode using ref
    if (hasRunRef.current) {
      console.log('⏭️ Skipping duplicate execution (React Strict Mode)')
      return
    }
    
    hasRunRef.current = true
    
    const verifyPayment = async () => {
      // Try multiple parameter names that Chapa might use
      const txRef = searchParams.get('trx_ref') || 
                    searchParams.get('tx_ref') || 
                    searchParams.get('reference') ||
                    searchParams.get('transaction_ref')
      const chapaStatus = searchParams.get('status')

      console.log('=== PAYMENT CALLBACK DEBUG ===')
      console.log('Transaction reference:', txRef)
      console.log('Chapa status:', chapaStatus)
      console.log('All URL params:', Object.fromEntries(searchParams))
      console.log('Current URL:', window.location.href)
      console.log('Full search string:', window.location.search)

      // Check for checkout ID in URL params FIRST (most reliable), then localStorage
      let checkoutId = searchParams.get('checkout_id') || localStorage.getItem('checkout_id')
      const token = localStorage.getItem('token')

      console.log('Checkout ID from URL params:', searchParams.get('checkout_id'))
      console.log('Checkout ID from localStorage:', localStorage.getItem('checkout_id'))
      console.log('Final checkout ID:', checkoutId)
      console.log('Token exists:', !!token)

      // If Chapa says failed/cancelled, show error immediately
      if (chapaStatus === 'failed' || chapaStatus === 'cancelled') {
        console.log('⚠️ Chapa returned failed/cancelled status')
        setStatus('failed')
        setMessage('Payment was cancelled or failed. You can try again from the checkout page.')
        // Clear checkout ID
        localStorage.removeItem('checkout_id')
        return
      }

      // If we don't have checkout_id but we have tx_ref, try to get checkout_id from backend
      if (!checkoutId && txRef && token) {
        console.log('🔍 No checkout_id found, trying to retrieve from tx_ref:', txRef)
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
          const response = await axios.get(
            `${backendUrl}/orders/checkout-from-txref/${txRef}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              },
              timeout: 10000
            }
          )
          
          if (response.data.data?.checkout_id) {
            checkoutId = response.data.data.checkout_id
            console.log('✅ Retrieved checkout_id from tx_ref:', checkoutId)
            // Store it in localStorage for consistency
            localStorage.setItem('checkout_id', checkoutId)
          }
        } catch (error) {
          console.error('❌ Failed to retrieve checkout_id from tx_ref:', error)
        }
      }

      // If we have a checkout ID, proceed with order creation
      // This handles both test mode (no params) and real payments (with params)
      if (checkoutId) {
        console.log('✅ Checkout session found, proceeding with order creation')
        
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'

          if (!token) {
            console.error('❌ No authentication token found!')
            setStatus('failed')
            setMessage('Session expired. Please login again.')
            setTimeout(() => navigate('/login'), 3000)
            return
          }

          console.log('Creating order with checkout ID:', checkoutId)
          console.log('Transaction reference:', txRef || 'TEST-' + Date.now())
          console.log('Backend URL:', backendUrl)
          console.log('Making request to:', `${backendUrl}/orders/create-after-payment`)
          
          // First, do a quick health check to see if backend is reachable
          try {
            console.log('🏥 Checking backend health...')
            await axios.get(`${backendUrl}/health`, { timeout: 5000 })
            console.log('✅ Backend is reachable')
          } catch (healthError) {
            console.error('❌ Backend health check failed:', healthError.message)
            setStatus('failed')
            setMessage('Cannot connect to backend server. Please make sure the Laravel backend is running on https://unibite-sxc9.onrender.com/api with: php artisan serve --host=0.0.0.0 --port=8000')
            return
          }
          
          const response = await axios.post(
            `${backendUrl}/orders/create-after-payment`,
            { 
              checkout_id: checkoutId,
              payment_reference: txRef || ('TEST-' + Date.now()) // Use test reference if no txRef
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              timeout: 60000 // 60 seconds timeout for order creation
            }
          )

          console.log('✅✅✅ ORDER CREATED SUCCESSFULLY')
          console.log('Response:', response.data)
          
          setStatus('success')
          setMessage('Payment successful! Your order has been created.')
          
          // Clear checkout ID from localStorage
          localStorage.removeItem('checkout_id')
          return
        } catch (error) {
          console.error('❌ Error creating order:', error)
          console.error('Error details:', error.response?.data)
          
          // Check if it's a timeout error
          if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            setStatus('failed')
            setMessage('Request timed out. The backend server might be slow or not responding. Please check your orders page to see if the order was created, or contact support.')
            return
          }
          
          // Check if it's a network error
          if (error.message === 'Network Error' || !error.response) {
            setStatus('failed')
            setMessage('Cannot connect to backend server. Please check if the Laravel backend is running on https://unibite-sxc9.onrender.com/api')
            return
          }
          
          setStatus('failed')
          setMessage(error.response?.data?.message || error.message || 'Failed to create order')
          return
        }
      }

      // If no checkout session at all, show error
      console.error('❌ No checkout session found and could not retrieve from tx_ref')
      console.error('❌ No transaction reference and no checkout session')
      setStatus('failed')
      setMessage('Invalid payment callback. Please try placing your order again.')
    }

    console.log('🚀 Payment callback page loaded')
    verifyPayment()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <FaSpinner className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Payment</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <FaCheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6 text-lg">{message}</p>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-700 font-medium">✓ Your order has been confirmed</p>
              <p className="text-green-600 text-sm mt-1">Take your time to review the details</p>
              <p className="text-green-500 text-xs mt-2">Click the button below when ready to continue</p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
            >
              View My Orders
            </button>
            <p className="text-gray-500 text-sm mt-4">
              This page will stay open until you click the button above
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTimesCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-6 text-lg">{message}</p>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-medium">✕ Payment could not be completed</p>
              <p className="text-red-600 text-sm mt-1">You can try placing your order again</p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl mb-3"
            >
              Go to Orders
            </button>
            <button
              onClick={() => navigate('/restaurants')}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Browse Restaurants
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback
