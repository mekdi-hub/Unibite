import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { Button } from './ui'
import axios from 'axios'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      await axios.post(`${backendUrl}/api/contact`, formData)
      
      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
      
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl" style={{ filter: 'brightness(0) invert(1)' }}>🚴‍♀️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">UniBite</h1>
                <p className="text-xs text-gray-600">Contact Us</p>
              </div>
            </Link>
            <Link 
              to="/"
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Info Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FaEnvelope className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">Send us an email anytime</p>
              <a href="mailto:support@unibite.com" className="text-orange-600 hover:text-orange-700 font-semibold">
                support@unibite.com
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FaPhone className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">Mon-Fri from 8am to 6pm</p>
              <a href="tel:+251911234567" className="text-orange-600 hover:text-orange-700 font-semibold">
                +251 911 234 567
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FaMapMarkerAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-4">Come say hello at our office</p>
              <p className="text-orange-600 font-semibold">
                Addis Ababa, Ethiopia<br />
                Campus Area
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-800 font-semibold">✓ Message sent successfully! We'll get back to you soon.</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 font-semibold">✗ {error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="+251 911 234 567"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  fullWidth
                  size="lg"
                  icon={!loading && <FaPaperPlane />}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* FAQ Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">📦 How long does delivery take?</h4>
                    <p className="text-gray-600">Most deliveries arrive within 30-45 minutes to campus dormitories.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">💳 What payment methods do you accept?</h4>
                    <p className="text-gray-600">We accept all major payment methods including Chapa, mobile money, and cash on delivery.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">🏪 How can I register my restaurant?</h4>
                    <p className="text-gray-600">Click on "Partner with Us" on the homepage to start the registration process.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">🚴 How do I become a delivery rider?</h4>
                    <p className="text-gray-600">Contact us directly and we'll guide you through the rider onboarding process.</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Follow Us</h3>
                <p className="mb-6 text-white/90">Stay connected on social media for updates and special offers</p>
                <div className="flex space-x-4">
                  <a href="#" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110">
                    <FaFacebook className="text-2xl" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110">
                    <FaTwitter className="text-2xl" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110">
                    <FaInstagram className="text-2xl" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110">
                    <FaLinkedin className="text-2xl" />
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Monday - Friday</span>
                    <span className="text-orange-600 font-bold">8:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Saturday</span>
                    <span className="text-orange-600 font-bold">9:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Sunday</span>
                    <span className="text-orange-600 font-bold">10:00 AM - 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2026 UniBite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default ContactUs
