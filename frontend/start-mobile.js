#!/usr/bin/env node

// Script to start the dev server and show mobile access instructions

const os = require('os');
const { execSync } = require('child_process');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const port = 3000;

console.log('\n🚀 Starting UniBite Mobile Development Server...\n');
console.log('━'.repeat(60));
console.log('\n📱 Access from your mobile device:\n');
console.log(`   Local:    http://localhost:${port}`);
console.log(`   Network:  http://${localIP}:${port}`);
console.log('\n━'.repeat(60));
console.log('\n📋 Instructions:\n');
console.log('   1. Make sure your phone is on the same WiFi network');
console.log(`   2. Open your phone's browser`);
console.log(`   3. Go to: http://${localIP}:${port}`);
console.log('   4. Install the app to your home screen!\n');
console.log('━'.repeat(60));
console.log('\n💡 Tips:\n');
console.log('   • Use Chrome on Android for best PWA support');
console.log('   • Use Safari on iOS for installation');
console.log('   • Check firewall if connection fails\n');
console.log('━'.repeat(60));
console.log('\n⏳ Starting server...\n');

// Start the dev server
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('\n❌ Failed to start server:', error.message);
  process.exit(1);
}