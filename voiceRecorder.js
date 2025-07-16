class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.stream = null;

        // DOM elements
        this.recordButton = document.getElementById('recordButton');
        this.recordingStatus = document.getElementById('recordingStatus');
        this.sentenceInput = document.getElementById('sentenceInput');
        this.analyzeButton = document.getElementById('analyzeSentenceBtn');

        // Initialize visualizer
        this.visualizer = new WaveformVisualizer();

        // Bind methods
        this.toggleRecording = this.toggleRecording.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.processTranscript = this.processTranscript.bind(this);

        // Initialize
        this.init();
    }

    init() {
        // Add event listener to record button
        this.recordButton.addEventListener('click', this.toggleRecording);

        // Check if browser supports speech recognition
        if (!('webkitSpeechRecognition' in window)) {
            this.recordButton.style.display = 'none';
            console.warn('Speech recognition not supported in this browser');
            return;
        }
    }

    async toggleRecording() {
        if (!this.isRecording) {
            await this.startRecording();
        } else {
            await this.stopRecording();
        }
    }

    async startRecording() {
        try {
            console.log('Starting recording...');
            
            // Request microphone access with specific constraints
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Got audio stream:', this.stream);
            
            // Start visualizer first with the raw stream
            this.visualizer.start(this.stream);
            
            // Create speech recognition instance
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            
            // Configure recognition
            this.recognition.lang = 'en-US';
            
            // Handle recognition results
            this.recognition.onresult = (event) => {
                const results = Array.from(event.results);
                let finalTranscript = '';
                let interimTranscript = '';

                for (let result of results) {
                    const transcript = result[0].transcript;
                    if (result.isFinal) {
                        finalTranscript += this.processTranscript(transcript);
                    } else {
                        interimTranscript = transcript;
                    }
                }

                // Update input with transcribed text
                this.sentenceInput.value = finalTranscript + interimTranscript;
            };
            
            // Handle recognition end
            this.recognition.onend = () => {
                if (this.isRecording) {
                    this.recognition.start();
                }
            };

            // Handle errors
            this.recognition.onerror = (event) => {
                console.error('Recognition error:', event.error);
                this.recordingStatus.textContent = `Error: ${event.error}`;
            };
            
            // Start recording
            this.recognition.start();
            this.isRecording = true;
            
            // Update UI
            this.recordButton.classList.add('recording');
            this.recordingStatus.textContent = 'Recording... (click again to stop and analyze)';
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.recordingStatus.textContent = 'Error: Could not start recording';
        }
    }

    async stopRecording() {
        if (!this.isRecording) return;

        console.log('Stopping recording...');

        // Stop recognition
        if (this.recognition) {
            this.recognition.stop();
        }

        // Stop visualizer
        this.visualizer.stop();

        // Stop all tracks in the stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
        }

        // Reset state
        this.isRecording = false;
        this.stream = null;
        
        // Update UI
        this.recordButton.classList.remove('recording');

        // Process final text and trigger analysis
        if (this.sentenceInput.value.trim()) {
            // Add final punctuation if needed
            let finalText = this.sentenceInput.value.trim();
            if (!finalText.match(/[.!?]$/)) {
                finalText += '.';
            }
            this.sentenceInput.value = finalText;
            
            // Automatically trigger analysis
            setTimeout(() => {
                this.recordingStatus.textContent = 'Analyzing...';
                this.analyzeButton.click();
            }, 500); // Small delay to ensure the UI updates are visible
        }
    }

    processTranscript(transcript) {
        // Common commands for punctuation
        const punctuationCommands = {
            'period': '.',
            'full stop': '.',
            'comma': ',',
            'question mark': '?',
            'exclamation mark': '!',
            'exclamation point': '!',
            'new line': '\n',
            'new paragraph': '\n\n'
        };

        let processedText = transcript;

        // Replace punctuation commands with actual punctuation
        for (const [command, punctuation] of Object.entries(punctuationCommands)) {
            const regex = new RegExp(`\\b${command}\\b`, 'gi');
            processedText = processedText.replace(regex, punctuation);
        }

        // Add spaces after punctuation if missing
        processedText = processedText.replace(/([.!?,])(\w)/g, '$1 $2');

        // Capitalize first letter of sentences
        processedText = processedText.replace(/(^\w|\.\s+\w|\?\s+\w|\!\s+\w)/g, 
            letter => letter.toUpperCase());

        // Add question marks for questions
        if (processedText.toLowerCase().startsWith('who') || 
            processedText.toLowerCase().startsWith('what') ||
            processedText.toLowerCase().startsWith('where') ||
            processedText.toLowerCase().startsWith('when') ||
            processedText.toLowerCase().startsWith('why') ||
            processedText.toLowerCase().startsWith('how')) {
            if (!processedText.endsWith('?')) {
                processedText = processedText.replace(/[.!]$/, '?');
                if (!processedText.endsWith('?')) {
                    processedText += '?';
                }
            }
        }

        return processedText;
    }
}

// Initialize voice recorder when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Temporarily disabled to test new recording system
    // new VoiceRecorder();
}); 