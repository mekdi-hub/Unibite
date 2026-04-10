import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Modern Google Maps-like marker icons
const createModernIcon = (iconUrl, size = [32, 32]) => {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
  })
}

// Modern marker icons (Google Maps style)
const riderIcon = createModernIcon('https://cdn-icons-png.flaticon.com/512/3448/3448339.png', [40, 40])
const restaurantIcon = createModernIcon('https://cdn-icons-png.flaticon.com/512/685/685352.png', [35, 35])
const customerIcon = createModernIcon('https://cdn-icons-png.flaticon.com/512/684/684908.png', [35, 35])

// Component to handle map updates and animations
const MapController = ({ center, zoom, animateToLocation }) => {
  const map = useMap()
  
  useEffect(() => {
    if (center && animateToLocation) {
      map.flyTo(center, zoom || map.getZoom(), {
        duration: 1.5,
        easeLinearity: 0.25
      })
    } else if (center) {
      map.setView(center, zoom || map.getZoom())
    }
  }, [center, zoom, map, animateToLocation])
  
  return null
}

// Animated marker component for delivery tracking
const AnimatedMarker = ({ position, icon, children, animate = false }) => {
  const [currentPosition, setCurrentPosition] = useState(position)
  const markerRef = useRef()

  useEffect(() => {
    if (animate && position) {
      // Smooth animation to new position
      const animateToPosition = () => {
        setCurrentPosition(position)
      }
      
      const timer = setTimeout(animateToPosition, 100)
      return () => clearTimeout(timer)
    } else {
      setCurrentPosition(position)
    }
  }, [position, animate])

  return (
    <Marker 
      position={currentPosition} 
      icon={icon}
      ref={markerRef}
    >
      {children}
    </Marker>
  )
}

const RiderMap = () => {
  // State management
  const [currentLocation, setCurrentLocation] = useState([9.0192, 38.7525]) // Addis Ababa default
  const [activeDelivery, setActiveDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState([9.0192, 38.7525])
  const [mapZoom, setMapZoom] = useState(13)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showBottomCard, setShowBottomCard] = useState(false)
  const [animateToLocation, setAnimateToLocation] = useState(false)
  const [deliveryRoute, setDeliveryRoute] = useState([])
  const [isTracking, setIsTracking] = useState(false)

  // Refs
  const mapRef = useRef()

  useEffect(() => {
    getCurrentLocation()
    fetchActiveDelivery()
    
    // Simulate delivery tracking
    if (isTracking) {
      simulateDeliveryMovement()
    }
  }, [isTracking])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude]
          setCurrentLocation(location)
          setMapCenter(location)
          setLoading(false)
        },
        (error) => {
          console.error('Location error:', error)
          console.log('Unable to get your location. Using default location.')
          setLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      console.log('Geolocation not supported.')
      setLoading(false)
    }
  }

  const fetchActiveDelivery = async () => {
    // Mock delivery data with route
    const mockDelivery = {
      id: 1,
      order_id: 1023,
      restaurant: {
        name: 'Uni Cafe',
        address: 'Campus Block A, Addis Ababa University',
        location: [9.0200, 38.7530],
        rating: 4.5,
        phone: '+251911234567'
      },
      customer: {
        name: 'John Doe',
        address: 'Dormitory 3, Room 205, AAU Campus',
        location: [9.0180, 38.7520],
        phone: '+251987654321'
      },
      status: 'going_to_restaurant',
      estimatedTime: '15 mins',
      distance: '2.3 km'
    }
    
    setActiveDelivery(mockDelivery)
    
    // Generate route points
    const route = generateRoute(currentLocation, mockDelivery.restaurant.location, mockDelivery.customer.location)
    setDeliveryRoute(route)
  }

  const generateRoute = (start, restaurant, customer) => {
    // Simple route generation (in real app, use routing service)
    const route = []
    
    // Route from rider to restaurant
    const steps1 = 10
    for (let i = 0; i <= steps1; i++) {
      const lat = start[0] + (restaurant[0] - start[0]) * (i / steps1)
      const lng = start[1] + (restaurant[1] - start[1]) * (i / steps1)
      route.push([lat, lng])
    }
    
    // Route from restaurant to customer
    const steps2 = 8
    for (let i = 1; i <= steps2; i++) {
      const lat = restaurant[0] + (customer[0] - restaurant[0]) * (i / steps2)
      const lng = restaurant[1] + (customer[1] - restaurant[1]) * (i / steps2)
      route.push([lat, lng])
    }
    
    return route
  }

  const simulateDeliveryMovement = () => {
    let routeIndex = 0
    const moveInterval = setInterval(() => {
      if (routeIndex < deliveryRoute.length) {
        setCurrentLocation(deliveryRoute[routeIndex])
        routeIndex++
      } else {
        clearInterval(moveInterval)
        setIsTracking(false)
      }
    }, 2000) // Move every 2 seconds
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Mock search result
      const mockResult = {
        name: searchQuery,
        address: 'Addis Ababa, Ethiopia',
        location: [9.0192 + (Math.random() - 0.5) * 0.01, 38.7525 + (Math.random() - 0.5) * 0.01],
        rating: 4.2,
        type: 'Restaurant'
      }
      
      setSelectedPlace(mockResult)
      setMapCenter(mockResult.location)
      setMapZoom(16)
      setAnimateToLocation(true)
      setShowBottomCard(true)
      
      setTimeout(() => setAnimateToLocation(false), 2000)
    }
  }

  const centerOnLocation = (location, zoom = 16) => {
    setMapCenter(location)
    setMapZoom(zoom)
    setAnimateToLocation(true)
    setTimeout(() => setAnimateToLocation(false), 2000)
  }

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 18))
  }

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Google Maps-like Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-11/12 max-w-md">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for places..."
            className="w-full px-6 py-4 text-gray-700 bg-white rounded-full shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            style={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              fontSize: '16px'
            }}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Main Map Container */}
      <div className="w-full h-full">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          ref={mapRef}
          className="z-0"
        >
          {/* Google Maps-like tiles (Carto Light) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />
          
          <MapController 
            center={mapCenter} 
            zoom={mapZoom} 
            animateToLocation={animateToLocation}
          />
          
          {/* Delivery Route */}
          {deliveryRoute.length > 0 && (
            <Polyline
              positions={deliveryRoute}
              color="#4285F4"
              weight={4}
              opacity={0.8}
              dashArray="10, 10"
            />
          )}
          
          {/* Animated Rider Marker */}
          <AnimatedMarker 
            position={currentLocation} 
            icon={riderIcon}
            animate={isTracking}
          >
            <Popup className="custom-popup">
              <div className="p-2 text-center">
                <h3 className="font-bold text-blue-600 mb-1">Your Location</h3>
                <p className="text-sm text-gray-600">Delivery Rider</p>
                <p className="text-xs text-gray-500 mt-1">Real-time tracking active</p>
              </div>
            </Popup>
          </AnimatedMarker>

          {/* Restaurant Marker */}
          {activeDelivery?.restaurant?.location && (
            <Marker position={activeDelivery.restaurant.location} icon={restaurantIcon}>
              <Popup className="custom-popup">
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-red-600 mb-2">{activeDelivery.restaurant.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{activeDelivery.restaurant.address}</p>
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span className="text-sm font-medium">{activeDelivery.restaurant.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">� {activeDelivery.restaurant.phone}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Customer Marker */}
          {activeDelivery?.customer?.location && (
            <Marker position={activeDelivery.customer.location} icon={customerIcon}>
              <Popup className="custom-popup">
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-green-600 mb-2">{activeDelivery.customer.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{activeDelivery.customer.address}</p>
                  <p className="text-xs text-gray-500">📞 {activeDelivery.customer.phone}</p>
                  <p className="text-xs text-blue-500 mt-1">Delivery destination</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Search Result Marker */}
          {selectedPlace && (
            <Marker position={selectedPlace.location} icon={customerIcon}>
              <Popup className="custom-popup">
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-blue-600 mb-2">{selectedPlace.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedPlace.address}</p>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span className="text-sm font-medium">{selectedPlace.rating}</span>
                    <span className="text-xs text-gray-500 ml-2">{selectedPlace.type}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Custom Zoom Controls (Google Maps style) */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="p-3 hover:bg-gray-50 transition-colors border-b border-gray-200"
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Current Location Button */}
      <div className="absolute bottom-24 right-4 z-[1000]">
        <button
          onClick={() => centerOnLocation(currentLocation)}
          className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
        >
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Delivery Tracking Controls */}
      <div className="absolute top-20 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isTracking 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isTracking ? '⏹️ Stop Tracking' : '▶️ Start Tracking'}
        </button>
      </div>

      {/* Google Maps-like Bottom Card */}
      {(showBottomCard && selectedPlace) || activeDelivery ? (
        <div 
          className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300"
          style={{
            boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            maxHeight: '40vh',
            overflowY: 'auto'
          }}
        >
          <div className="p-6">
            {/* Handle bar */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            
            {selectedPlace ? (
              // Search result details
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedPlace.name}</h2>
                    <p className="text-gray-600 mb-2">{selectedPlace.address}</p>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">⭐</span>
                      <span className="font-medium mr-2">{selectedPlace.rating}</span>
                      <span className="text-gray-500 text-sm">{selectedPlace.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBottomCard(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                    Directions
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Call
                  </button>
                </div>
              </div>
            ) : (
              // Active delivery details
              activeDelivery && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Active Delivery</h2>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Order #{activeDelivery.order_id}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-lg">🏪</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activeDelivery.restaurant.name}</p>
                          <p className="text-sm text-gray-600">Pickup location</p>
                        </div>
                      </div>
                      <button
                        onClick={() => centerOnLocation(activeDelivery.restaurant.location)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Show
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-lg">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activeDelivery.customer.name}</p>
                          <p className="text-sm text-gray-600">Delivery destination</p>
                        </div>
                      </div>
                      <button
                        onClick={() => centerOnLocation(activeDelivery.customer.location)}
                        className="text-green-600 hover:text-green-800 font-medium text-sm"
                      >
                        Show
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">ETA</p>
                          <p className="font-bold text-blue-600">{activeDelivery.estimatedTime}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Distance</p>
                          <p className="font-bold text-blue-600">{activeDelivery.distance}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-bold text-orange-600">In Progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ) : null}

      {/* Custom CSS for Google Maps-like styling */}
      <style jsx>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .leaflet-popup-tip {
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        
        .leaflet-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 4px;
          font-size: 10px;
        }
      `}</style>
    </div>
  )
}

export default RiderMap