import { useState, useEffect } from 'react'

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed === 'true') {
      return // Don't set up the listener if already dismissed
    }

    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show the install prompt
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      // Remember that user installed the app
      localStorage.setItem('pwa-prompt-dismissed', 'true')
    } else {
      console.log('User dismissed the install prompt')
      // Remember that user dismissed it
      localStorage.setItem('pwa-prompt-dismissed', 'true')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Remember user dismissed it - won't show again
    localStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-6 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
      
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
          <span style={{ filter: 'brightness(0) invert(1)' }}>🚴‍♀️</span>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Install UniBite App
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Add UniBite to your home screen for quick access and a better experience!
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <span className="flex items-center">
            <span className="mr-1">⚡</span> Fast
          </span>
          <span className="flex items-center">
            <span className="mr-1">📱</span> Mobile-friendly
          </span>
          <span className="flex items-center">
            <span className="mr-1">🔔</span> Notifications
          </span>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
