# 🎨 Emotional Message Generator

A real-time voice-responsive art generator that creates personalized visual cards based on your spoken emotions and messages. Uses advanced emotion analysis and generative art techniques to transform your voice into unique visual experiences.

## ✨ Features

### 🎤 Voice-to-Art Generation
- **Real-time voice recording** with Web Audio API
- **Emotion analysis** of spoken content using natural language processing
- **Dynamic art generation** based on emotional content and tone
- **Audio-reactive brightness** effects that respond to voice volume

### 🎨 Multiple Art Layouts
- **Layout 1**: Particle-based generative art with emotional color palettes
- **Layout 2**: Detailed emotion breakdown with percentages and tone analysis
- **Layout 3**: Typography-focused design with voice-to-text transcription

### 🔊 Audio-Reactive Features
- **Real-time brightness overlay** that pulses with voice volume during recording
- **Continuous pulse animation** after card generation
- **WebGL displacement effects** with audio responsiveness
- **Waveform visualization** during recording

### 🎨 Visual Effects
- **Glass morphism effects** with CSS backdrop filters
- **Particle systems** with physics-based animations
- **WebGL shaders** for advanced visual effects
- **Smooth animations** and transitions throughout the interface

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Audio**: Web Audio API, MediaRecorder API
- **Graphics**: Canvas API, WebGL
- **Server**: Node.js with Express.js
- **Styling**: Custom CSS with glass morphism and modern UI design
- **Fonts**: Variable fonts (Roboto Flex, SF Pro)

## 📋 Requirements

- **Chrome browser** (required for optimal Web Audio API support)
- **Microphone access** for voice recording
- **Node.js** (v14+ recommended)
- **Modern computer** with WebGL support

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/emotional-message-generator.git
   cd emotional-message-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the local server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🎯 How to Use

1. **Allow microphone permissions** when prompted by your browser
2. **Click the record button** or microphone icon to start recording
3. **Speak your message** - say whatever you want! Be yourself: polite, friendly, aggressive, or even curse
4. **Watch the real-time effects** as the brightness responds to your voice volume
5. **Wait for analysis** as the app processes your emotions
6. **View your generated card** with personalized art based on your emotional content

**Chrome browser is required!**

## 📁 Project Structure

```
emotional-message-generator/
├── index.html                 # Main application interface
├── style.css                  # Comprehensive styling with glass effects
├── sketch.js                  # Main application logic and layout generation
├── recording.js               # Voice recording and audio processing
├── artGenerator.js            # Generative art creation algorithms
├── emotionAnalyzer.js         # Emotion analysis and processing
├── waveformVisualizer.js      # Real-time audio visualization
├── webgl_displacement.js      # WebGL effects and shaders
├── glassEffect.js             # Glass morphism visual effects
├── server.js                  # Express.js local development server
├── package.json               # Node.js dependencies and scripts
├── Assets/                    # Images, fonts, and static resources
│   ├── favicon.png           # Site favicon
│   ├── Glass.png             # Glass texture overlay
│   ├── logo.svg              # Application logo
│   └── *.ttf, *.woff2        # Custom fonts
├── analyze_test/             # Testing environment for analysis features
├── visual_test/              # Visual effects testing
├── text_test/                # Typography and font testing
└── dm_test/                  # Additional testing modules
```

## 🎨 Art Generation Process

1. **Voice Capture**: Records audio using Web Audio API with real-time volume monitoring
2. **Emotion Analysis**: Processes speech content to identify emotional tones and sentiment
3. **Color Mapping**: Maps emotions to specific color palettes and visual themes
4. **Art Creation**: Generates unique visual compositions using:
   - Particle systems with physics simulation
   - Procedural geometric patterns
   - Typography with variable font effects
   - WebGL shaders for advanced effects

## 🔧 Development Features

- **Real-time debugging** with visual feedback
- **Modular architecture** with separate files for different functionalities
- **Responsive design** that works across different screen sizes
- **Performance optimized** with efficient animation loops
- **Error handling** for microphone permissions and browser compatibility

## 🎭 Emotion Analysis

The app analyzes various emotional dimensions:
- **Primary emotions**: Joy, Sadness, Anger, Fear, Surprise, Disgust
- **Sentiment analysis**: Positive, Negative, Neutral
- **Intensity levels**: Emotional strength and confidence
- **Tone normalization**: Ensures emotion percentages total 100%

## 🌟 Visual Themes

Different emotional states trigger unique visual responses:
- **Joy/Happiness**: Warm colors, upward particle movement, bright effects
- **Sadness**: Cool blues, downward flow, subdued tones
- **Anger**: Intense reds, aggressive particle behavior, sharp contrasts
- **Calm/Peaceful**: Soft gradients, gentle animations, balanced compositions

## 🔄 Audio-Reactive System

- **Real-time RMS calculation** for voice volume detection
- **Brightness overlay** with radial gradient effects
- **Dual-mode operation**: Recording mode (reactive) vs. Loop mode (automated)
- **Smooth transitions** between audio states

## 🐛 Troubleshooting

- **Microphone not working**: Ensure Chrome browser and microphone permissions are granted
- **No audio effects**: Check that you're using Chrome (other browsers have limited Web Audio API support)
- **Slow performance**: Ensure WebGL is enabled and you have sufficient hardware acceleration

## 🚀 Future Enhancements

- Integration with additional emotion analysis APIs
- Export functionality for generated art pieces
- Social sharing capabilities
- Additional art layout options
- Mobile browser optimization

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ using generative art and emotion analysis** 