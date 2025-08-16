# PWA (Progressive Web App) Installation Feature

This document explains the PWA installation functionality added to Pockito.

## What is PWA?

A Progressive Web App (PWA) is a web application that can be installed on a user's device (desktop or mobile) and accessed like a native app. It provides:

- **Installation**: Users can add the app to their home screen
- **Offline functionality**: Basic caching and offline access
- **Native-like experience**: App-like interface and behavior

## Features Implemented

### 1. Automatic Install Prompt Detection
- Detects when the app can be installed
- Shows a toast notification after 3 seconds
- Appears at the bottom of the screen with action buttons

### 2. Install Toast Component
- **Location**: Bottom center of the screen
- **Content**: Install prompt with "Install" and "Maybe Later" buttons
- **Auto-dismiss**: Automatically disappears after 30 seconds
- **Styling**: Blue theme with proper accessibility

### 3. PWA Service
- Handles the `beforeinstallprompt` event
- Manages installation state
- Integrates with the notification system

### 4. Web App Manifest
- App name and description
- Icons for different sizes
- Theme colors
- Display mode (standalone)
- App shortcuts

### 5. Service Worker
- Basic caching functionality
- Offline support
- Automatic updates

## How to Test

### Prerequisites
1. Build and serve the Angular app
2. Use a modern browser (Chrome, Edge, Firefox)
3. Access via HTTPS or localhost (PWA features require secure context)

### Testing Steps

1. **Start the app**:
   ```bash
   npm start
   ```

2. **Open in browser**:
   - Navigate to `http://localhost:4200`
   - Open Developer Tools (F12)

3. **Check PWA readiness**:
   - In DevTools, go to Application tab
   - Look for "Manifest" and "Service Workers" sections
   - Verify manifest is loaded correctly

4. **Test install prompt**:
   - The install toast should appear after 3 seconds
   - Click "Install" to trigger native browser install prompt
   - Or click "Maybe Later" to dismiss

5. **Manual install**:
   - Look for the install icon in the browser address bar
   - Or use the install button on the home page

### Browser Behavior

- **Chrome/Edge**: Shows install icon in address bar
- **Firefox**: Shows install button in menu
- **Safari**: Shows "Add to Home Screen" option
- **Mobile**: Shows "Add to Home Screen" in browser menu

## Files Added/Modified

### New Files
- `src/app/core/pwa-install.service.ts` - PWA installation logic
- `src/app/shared/pwa-install-toast/pwa-install-toast.component.ts` - Install prompt UI
- `src/manifest.webmanifest` - Web app manifest
- `src/ngsw-worker.js` - Service worker

### Modified Files
- `src/app/app.component.ts` - Added PWA install toast
- `src/app/features/home/home.component.ts` - Added install button
- `src/index.html` - Added manifest and PWA meta tags
- `src/main.ts` - Added service worker registration
- `angular.json` - Added manifest and service worker to assets

## Configuration

### Manifest Customization
Edit `src/manifest.webmanifest` to customize:
- App name and description
- Colors and theme
- Icons and shortcuts
- Display mode

### Service Worker Customization
Edit `src/ngsw-worker.js` to customize:
- Cache strategies
- Offline behavior
- Update handling

## Troubleshooting

### Install Prompt Not Showing
1. Check if running on HTTPS or localhost
2. Verify manifest is loaded in DevTools
3. Check browser console for errors
4. Ensure service worker is registered

### Icons Not Loading
1. Verify icon paths in manifest
2. Check if icons exist in assets folder
3. Ensure proper icon formats (SVG, PNG)

### Service Worker Issues
1. Check browser console for registration errors
2. Verify service worker file path
3. Clear browser cache and reload

## Future Enhancements

- **Advanced caching**: Implement more sophisticated cache strategies
- **Push notifications**: Add notification capabilities
- **Background sync**: Enable offline data synchronization
- **App updates**: Handle app updates and versioning
- **Analytics**: Track PWA installation and usage metrics

## Browser Support

- **Chrome**: Full support
- **Edge**: Full support
- **Firefox**: Full support
- **Safari**: Limited support (iOS 11.3+)
- **Mobile browsers**: Varies by platform

## Resources

- [MDN Web Docs - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA Guide](https://web.dev/progressive-web-apps/)
- [Chrome DevTools - PWA](https://developers.google.com/web/tools/chrome-devtools/progressive-web-apps)
