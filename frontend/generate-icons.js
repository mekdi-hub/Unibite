import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create gradient background (red gradient like login page)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#ef4444'); // Red-500
  gradient.addColorStop(1, '#dc2626'); // Red-600
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Add rounded corners
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // Draw bicycle delivery emoji (matching login page)
  ctx.font = `${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw the emoji normally (it will show in color)
  ctx.fillText('🚴‍♀️', size / 2, size / 2);

  // Add text "UniBite"
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.12}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UniBite', size / 2, size * 0.85);

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(__dirname, 'public', `pwa-${size}x${size}.png`);
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Generated: pwa-${size}x${size}.png`);
}

// Generate both icon sizes
console.log('🎨 Generating PWA icons with UniBite branding...\n');
generateIcon(192);
generateIcon(512);
console.log('\n✨ Done! Icons saved in frontend/public/');
console.log('📱 Icons now match the login page design (bicycle delivery + red gradient)');
