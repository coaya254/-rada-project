# 📱 Mobile Development Guide for rada.ke

## Real-time Mobile Simulation in VSCode

### Option 1: Browser DevTools (Recommended)
1. **Open your app**: http://localhost:3003
2. **Press F12** to open DevTools 
3. **Click the mobile icon** (📱) in the toolbar
4. **Select device**: iPhone SE, iPhone 12 Pro, Samsung Galaxy S20, etc.
5. **Toggle responsive mode** to test different screen sizes

### Option 2: VSCode Browser Preview Extension
1. **Install extension**: "Browser Preview" by Microsoft
2. **Open Command Palette** (Ctrl+Shift+P)
3. **Run**: `Browser Preview: Open Preview`
4. **Navigate to**: http://localhost:3003
5. **Use mobile presets** in the preview panel

### Option 3: Chrome DevTools Mobile Simulation
1. **Open Chrome**: Navigate to http://localhost:3003
2. **DevTools** → **Device Toolbar** (Ctrl+Shift+M)
3. **Choose device** from dropdown
4. **Features available**:
   - Touch simulation
   - Network throttling
   - GPS simulation
   - Orientation changes

## Real-time Development Workflow

### Hot Reload Setup
- ✅ **React Hot Reload**: Already configured
- ✅ **CSS Changes**: Instant updates
- ✅ **JavaScript Changes**: Automatic refresh

### Mobile-First Development
```javascript
// Use CSS-in-JS media queries
const MobileFirst = styled.div`
  // Mobile first (default)
  padding: 16px;
  
  // Tablet and up
  @media (min-width: 768px) {
    padding: 24px;
  }
  
  // Desktop and up  
  @media (min-width: 1024px) {
    padding: 32px;
  }
`;
```

### Touch-Friendly Components
```javascript
const TouchButton = styled.button`
  min-height: 44px; // iOS minimum touch target
  min-width: 44px;
  padding: 12px 16px;
  border-radius: 8px;
  
  // Active state for mobile
  &:active {
    transform: scale(0.95);
    background: rgba(0,0,0,0.1);
  }
`;
```

## Testing Different Devices

### iPhone Simulation
- **iPhone SE**: 375x667 (Small screen testing)
- **iPhone 12**: 390x844 (Modern iPhone)
- **iPhone 12 Pro Max**: 428x926 (Large iPhone)

### Android Simulation
- **Samsung Galaxy S20**: 360x800
- **Google Pixel 5**: 393x851
- **Samsung Galaxy A51**: 412x914

## PWA Testing

### Install as PWA
1. **Chrome Mobile**: Visit site → Menu → "Add to Home Screen"
2. **Chrome Desktop**: Address bar → Install icon
3. **Test offline**: Disable network in DevTools

### PWA Features to Test
- ✅ Home screen icon
- ✅ Splash screen
- ✅ Offline functionality  
- ✅ Push notifications (if implemented)

## Performance Testing

### Mobile Performance
```bash
# Lighthouse audit
npm run build
npx serve -s build
# Open Chrome DevTools → Lighthouse → Mobile audit
```

### Network Conditions
- **Slow 3G**: 1.6 Mbps down, 750 Kbps up
- **Fast 3G**: 1.6 Mbps down, 750 Kbps up  
- **4G**: 4 Mbps down, 3 Mbps up

## Common Mobile Issues to Check

### Touch & Gestures
- [ ] Buttons are at least 44px tall
- [ ] Swipe gestures work smoothly
- [ ] No accidental clicks on small targets
- [ ] Form inputs are properly sized

### Layout & Spacing
- [ ] Text is readable at 16px minimum
- [ ] Adequate spacing between clickable elements
- [ ] Content fits without horizontal scroll
- [ ] Navigation is thumb-accessible

### Performance
- [ ] Fast loading on slow networks
- [ ] Smooth animations (60fps)
- [ ] Minimal battery drain
- [ ] Efficient image loading

## Debug Mobile Issues

### Common Problems
```javascript
// Fix viewport issues
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

// Prevent zoom on input focus
input {
  font-size: 16px; // Prevents zoom on iOS
}

// Fix touch delays
button {
  touch-action: manipulation;
}
```

### Remote Debugging
1. **Chrome**: chrome://inspect → Connect device
2. **Safari**: Develop menu → Device name
3. **Firefox**: about:debugging → Connect device

## Live Development Tips

1. **Keep DevTools open** while coding
2. **Use mobile-first breakpoints** in CSS
3. **Test touch interactions** regularly  
4. **Monitor network requests** for efficiency
5. **Check console for errors** on mobile

---

**🚀 Start developing**: Open http://localhost:3003 in Chrome, press F12, click mobile icon, and start coding!