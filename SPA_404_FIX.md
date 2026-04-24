# Fix 404 Error on Hard Refresh (Ctrl+Shift+R)

## Problem
When you press Ctrl+Shift+R (hard refresh) or directly navigate to a route like `/restaurants` or `/orders`, you get a 404 error.

## Root Cause
This is a common issue with Single Page Applications (SPAs) like React apps. Here's what happens:

1. When you navigate within the app (clicking links), React Router handles routing on the client side
2. When you hard refresh or directly visit a URL, the browser asks the server for that specific path
3. The server (Vercel) doesn't have a file at `/restaurants` or `/orders`, so it returns 404
4. The server needs to be told to serve `index.html` for ALL routes, letting React Router handle the routing

## Solution Applied

### 1. Updated `vercel.json` ✅
Added rewrite rules to redirect all routes to `index.html`:

```json
{
  "buildCommand": "npm ci && npm run build",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This tells Vercel: "For any route requested, serve the index.html file and let React Router handle it."

### 2. Created `frontend/public/_redirects` ✅
Added a fallback redirect file:

```
/*    /index.html   200
```

This is a backup solution that works with various hosting platforms.

## How It Works Now

1. User visits `https://unibite-gray.vercel.app/restaurants` directly
2. Vercel receives the request for `/restaurants`
3. Instead of looking for a `/restaurants` file, Vercel serves `index.html` (thanks to our rewrite rule)
4. React app loads
5. React Router sees the URL is `/restaurants` and renders the Restaurants component
6. ✅ Page loads correctly!

## Testing

After deploying these changes:

1. Visit your app: `https://unibite-gray.vercel.app`
2. Navigate to any page (e.g., Restaurants, Orders, etc.)
3. Press `Ctrl+Shift+R` (hard refresh)
4. ✅ Page should reload correctly without 404 error
5. Try directly visiting: `https://unibite-gray.vercel.app/orders`
6. ✅ Should load the Orders page directly

## Deployment

To apply these fixes:

```bash
# Commit the changes
git add vercel.json frontend/public/_redirects
git commit -m "Fix 404 error on hard refresh - add SPA rewrites"

# Push to trigger Vercel deployment
git push
```

Vercel will automatically detect the changes and redeploy your app with the new configuration.

## Alternative Solutions (If Above Doesn't Work)

### Option 1: Update vercel.json with more specific config
```json
{
  "buildCommand": "npm ci && npm run build",
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ]
}
```

### Option 2: Add to vite.config.js
Ensure your Vite config has the correct base:

```javascript
export default defineConfig({
  base: '/',
  // ... rest of config
})
```

## Why This Happens

SPAs work differently from traditional multi-page apps:

**Traditional App:**
- `/about` → server has `about.html` file
- `/contact` → server has `contact.html` file

**SPA (React):**
- `/about` → only `index.html` exists, React Router handles `/about`
- `/contact` → only `index.html` exists, React Router handles `/contact`

The server needs to be configured to always serve `index.html` and let the client-side router handle the routing.

## Files Modified

1. `vercel.json` - Added rewrite rules
2. `frontend/public/_redirects` - NEW FILE - Fallback redirect rules

---

## Status: ✅ FIXED

The 404 error on hard refresh should now be resolved. Deploy the changes and test!
