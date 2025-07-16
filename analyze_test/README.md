# Voice-to-Text Art Generator

This is a complete voice recording and emotion analysis art generator that converts speech to beautiful visual art based on emotional content.

## 🎤 **Main Features**

### Voice Recording & Analysis
- **Real-time Speech Recognition**: Record voice messages using Web Speech API
- **Emotion Detection**: Analyzes text for emotions (joy, sadness, anger, fear, disgust)
- **Text Input Alternative**: Type messages directly for analysis
- **Waveform Visualization**: Live audio waveform display during recording

### Art Generation
- **Emotion-based Colors**: Different emotions trigger different color palettes
- **Particle Systems**: Dynamic particle animations based on emotional content
- **WebGL Glass Effects**: Advanced displacement mapping for glass-like distortions
- **Real-time Updates**: Art regenerates automatically when parameters change

### Interactive Controls
- **Voice Recording Button**: Click to start/stop voice recording
- **Text Input**: Enter text manually for analysis
- **Analysis Button**: Process text and generate art
- **Visual Effects**: Canvas blur and glass displacement effects

## 📁 **File Structure**

```
analyze_test/
├── index.html              - Main application page
├── style.css              - Complete UI styling and animations
├── voiceRecorder.js       - Voice recording and speech recognition
├── artGenerator.js        - Main art generation logic
├── sketch.js              - Particle system and visual effects
├── waveformVisualizer.js  - Real-time audio visualization
├── webgl_displacement.js  - WebGL displacement effects
├── glassEffect.js         - Glass distortion utilities
├── test_waves.png         - Audio waveform graphic asset
├── test_image.png         - Background image asset
├── Assets/
│   └── Glass.png          - High-quality displacement texture (7.6MB)
└── README.md              - This documentation
```

## 🚀 **How to Use**

### 1. Voice Recording Mode
1. **Click the microphone button** to start recording
2. **Speak your message** (speech will be converted to text automatically)
3. **Click again to stop** recording
4. **Art generates automatically** based on detected emotions

### 2. Text Input Mode
1. **Type your message** in the text input field
2. **Click "Analyze"** to process the text
3. **Art generates automatically** based on text content

### 3. Visual Effects
- **Background blur**: Creates depth and focus effects
- **Glass displacement**: WebGL-powered realistic glass distortion
- **Particle animations**: Emotion-driven particle movement and colors
- **Dynamic layouts**: Content adapts to different text lengths

## 🎨 **Emotion-Color Mapping**

- **Joy**: Golden yellows, warm oranges, bright colors
- **Sadness**: Deep blues, cool tones, gentle movements
- **Anger**: Intense reds, sharp oranges, fast movements
- **Fear**: Dark purples, mysterious indigos, erratic patterns
- **Disgust**: Olive greens, muted tones, constrained movement

## 🔧 **Technical Features**

### Browser Compatibility
- **Chrome/Edge**: Full functionality with voice recognition
- **Firefox/Safari**: Text input mode (voice may have limitations)
- **Mobile**: Touch-optimized interface

### Protocol Support
- **HTTPS/HTTP**: Full Glass.png texture loading
- **File Protocol**: Enhanced procedural glass displacement fallback
- **GitHub Pages**: Optimized for web hosting

### Performance
- **WebGL Acceleration**: Hardware-accelerated graphics
- **Optimized Particles**: Efficient particle system rendering
- **Responsive Design**: Adapts to different screen sizes

## 🌐 **Deployment**

### GitHub Pages Setup
1. **Upload all files** to a GitHub repository
2. **Enable GitHub Pages** in repository settings
3. **Access via**: `https://yourusername.github.io/repositoryname/`

### Local Testing
```bash
# Serve via HTTP (recommended)
python3 -m http.server 8000
# Then open: http://localhost:8000

# Or open index.html directly (limited WebGL features)
```

## 🎯 **Expected Behavior**

### Successful Operation
- ✅ **Voice recording works** (in supported browsers)
- ✅ **Text analysis produces emotion scores**
- ✅ **Art generates with appropriate colors/effects**
- ✅ **Glass displacement effects visible**
- ✅ **Responsive UI updates in real-time**

### Console Output
- `✅ Voice recording initialized successfully`
- `✅ WebGL displacement effect initialized successfully`
- `🎨 Art generated with emotions: [emotion data]`
- `📊 Glass effect quality: High-resolution with realistic patterns`

## 🛠 **Troubleshooting**

### Voice Recording Issues
- **Microphone permission**: Ensure browser has microphone access
- **Browser support**: Use Chrome/Edge for best voice recognition
- **Network connection**: Speech recognition requires internet

### WebGL Issues
- **Graphics support**: Ensure browser supports WebGL
- **File protocol limitations**: Use HTTP server for full features
- **Performance**: Some effects may be slower on older hardware

### General Issues
- **Console errors**: Check browser developer tools (F12)
- **Missing files**: Verify all files uploaded correctly
- **Styling issues**: Clear browser cache and refresh

## 🔮 **Advanced Features**

### Customization
- **Emotion thresholds**: Modify sensitivity in JavaScript
- **Color palettes**: Adjust emotion-color mappings
- **Particle behavior**: Tune physics and movement parameters
- **Glass effects**: Modify displacement strength and patterns

### Extensions
- **Additional emotions**: Add new emotion categories
- **Sound analysis**: Integrate audio frequency analysis
- **Export features**: Save generated art as images
- **Social sharing**: Add sharing capabilities

---

**Note**: This is a complete, self-contained voice-to-text art generator that works both locally and on GitHub Pages with intelligent fallback mechanisms for maximum compatibility. 