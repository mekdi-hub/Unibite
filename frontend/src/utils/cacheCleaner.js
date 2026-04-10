// Cache Cleaner Utility
// This utility helps clear old cached files

export const clearAllCaches = async () => {
  try {
    // Clear all browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('Found caches:', cacheNames);
      
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
      
      console.log('✅ All caches cleared successfully!');
    }

    // Tell service worker to clear its caches too
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE'
      });
    }

    // Clear localStorage version flag to force reload
    localStorage.removeItem('app_version');
    
    return true;
  } catch (error) {
    console.error('Error clearing caches:', error);
    return false;
  }
};

export const checkAndClearOldCache = () => {
  const CURRENT_VERSION = '2.0.0'; // Match the service worker version
  const storedVersion = localStorage.getItem('app_version');
  
  if (storedVersion !== CURRENT_VERSION) {
    console.log('New version detected, clearing old caches...');
    clearAllCaches().then(() => {
      localStorage.setItem('app_version', CURRENT_VERSION);
      console.log('Cache cleared, version updated to:', CURRENT_VERSION);
    });
  }
};

// Force reload without cache
export const hardReload = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    }).then(() => {
      clearAllCaches().then(() => {
        window.location.reload(true);
      });
    });
  } else {
    clearAllCaches().then(() => {
      window.location.reload(true);
    });
  }
};
