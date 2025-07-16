# Visual Test - Art Generator

This folder contains all the files needed to test the art generator with WebGL displacement effects on GitHub Pages.

## Files Included

- `index.html` - Main test page (renamed from test.html)
- `webgl_displacement.js` - WebGL displacement effect implementation
- `glassEffect.js` - Glass effect utilities
- `artGenerator.js` - Main art generation logic
- `Assets/Glass.png` - Displacement texture for glass effects

## Features

### 🎨 Art Generation Controls
- **Recording Length**: Simulates voice recording duration (1-5 seconds)
- **Word Count**: Number of words in the message (1-15)
- **Name**: Author name input
- **Emotions**: Joy, Sadness, Anger, Fear, Disgust (0-100% each)

### 🔧 Visual Effects
- **Blur Controls**: Toggle and adjust blur amount (0-20px)
- **Displacement Effects**: WebGL-powered glass displacement
- **Real-time Updates**: Changes automatically update the art

### 🧪 Testing Buttons
- **Generate Art**: Manually trigger art generation
- **Test Displacement**: Test displacement effect manually
- **Test HIGH Displacement**: Test with extreme displacement values
- **Debug Status**: View debugging information in console
- **Test Simple WebGL**: Basic WebGL functionality test

## How It Works

### Protocol Detection
The system automatically detects whether it's running on:
- **GitHub Pages (HTTPS)**: Uses real Glass.png texture
- **Local File (file://)**: Uses enhanced procedural glass displacement

### WebGL Displacement
- **Real Glass.png**: 7.6MB high-quality displacement texture
- **Procedural Fallback**: 512x512 mathematically generated glass patterns
- **No CORS Issues**: Smart protocol detection prevents loading errors

## Testing on GitHub

1. **Upload to GitHub**: Copy all files to a new repository
2. **Enable GitHub Pages**: Go to Settings > Pages > Source: Deploy from branch
3. **Access**: Visit `https://yourusername.github.io/repositoryname/`

## Expected Behavior

✅ **Should Work**: Art generation, WebGL effects, displacement mapping
✅ **No Errors**: Clean console output, no CORS issues  
✅ **Real-time**: Immediate updates when adjusting controls
✅ **Glass Effects**: Beautiful displacement effects regardless of protocol

## Console Output

Look for these messages:
- `✅ WebGL displacement effect initialized successfully` (with Glass.png)
- `📁 File protocol detected - using enhanced procedural glass displacement` (fallback)
- `✅ Enhanced procedural glass displacement map created: 512 x 512`

## Troubleshooting

If you see errors:
1. Check browser console (F12)
2. Verify all files uploaded correctly  
3. Ensure GitHub Pages is enabled
4. Try the debug buttons for diagnostics

---

**Note**: This is a self-contained test environment that works both locally and on GitHub Pages thanks to intelligent protocol detection and fallback mechanisms. 