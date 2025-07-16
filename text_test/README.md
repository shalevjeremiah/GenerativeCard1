# Text Emotion Analyzer

A web application that performs emotion analysis on text using the Hugging Face Transformers API. The app provides both sentence-level and word-level emotion analysis, with visual representation of emotions through color-coding and tooltips.

## Features

- Sentence-level emotion analysis
- Word-level emotion analysis with color coding
- Emotion score tooltips on word hover
- Text-to-speech functionality
- Fallback emotion detection when API is unavailable
- Modern, responsive UI

## Setup

1. Clone this repository:
```bash
git clone <your-repo-url>
cd <repo-name>
```

2. Get a Hugging Face API Token:
   - Go to [Hugging Face](https://huggingface.co/)
   - Create an account or sign in
   - Go to your profile settings
   - Generate a new API token
   - Copy the token

3. Replace the API token in `script.js`:
```javascript
const HF_API_TOKEN = "YOUR_TOKEN_HERE";  // Replace with your actual token
```

4. Serve the application:
   - You can use any static file server. For example, with Python:
```bash
python -m http.server 8000
```
   - Or with Node.js's `http-server`:
```bash
npx http-server
```

5. Open the application in your browser:
   - Navigate to `http://localhost:8000` (or whatever port your server is using)

## Usage

1. Enter or paste your text in the textarea
2. Click "Analyze" to process the text
3. View the emotion summary at the top
4. See word-by-word emotion analysis below
5. Hover over words to see detailed emotion scores
6. Use the "Play Text as Speech" button to hear the text

## Technical Details

- Uses the `j-hartmann/emotion-english-distilroberta-base` model from Hugging Face
- Emotions detected: joy, sadness, anger, surprise, fear, disgust, neutral
- Threshold for significant emotions: 20%
- Threshold for dominant emotion: 50%
- Mixed emotions are detected when top scores are within 10% of each other
- Includes fallback keyword-based analysis when API is unavailable

## Security Note

For production deployment, you should never expose your Hugging Face API token in client-side JavaScript. Instead:
1. Set up a backend server
2. Store the API token securely (e.g., in environment variables)
3. Proxy the Hugging Face API calls through your server

## License

MIT License - feel free to use and modify as needed. 