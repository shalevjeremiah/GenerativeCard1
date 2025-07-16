class WaveformVisualizer {
    constructor() {
        this.canvas = null;
        this.canvasCtx = null;
        this.analyser = null;
        this.dataArray = null;
        this.audioContext = null;
        this.container = null;
        this.animationId = null;
        this.isRecording = false;
        this.DEBUG = false;
        
        // Recording properties
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordingCanvas = null;
        this.recordingCtx = null;
        this.currentBlendMode = 'multiply';

        this.init();
    }

    createBlendModeDebug() {
        this.blendModePanel = document.createElement('div');
        this.blendModePanel.className = 'blend-mode-debug';
        
        const title = document.createElement('h3');
        title.textContent = 'Blend Mode Debug';
        this.blendModePanel.appendChild(title);
        
        const blendModes = [
            'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
            'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference',
            'exclusion', 'hue', 'saturation', 'color', 'luminosity'
        ];
        
        blendModes.forEach(mode => {
            const option = document.createElement('div');
            option.className = 'blend-mode-option';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'blendMode';
            radio.value = mode;
            radio.id = `blend-${mode}`;
            radio.checked = mode === this.currentBlendMode;
            
            const label = document.createElement('label');
            label.htmlFor = `blend-${mode}`;
            label.textContent = mode;
            
            option.appendChild(radio);
            option.appendChild(label);
            
            radio.addEventListener('change', () => {
                this.currentBlendMode = mode;
                this.blendModePanel.querySelectorAll('label').forEach(l => l.classList.remove('active'));
                label.classList.add('active');
                
                // Force redraw when blend mode changes
                if (this.isRecording) {
                    this.draw();
                }
            });
            
            this.blendModePanel.appendChild(option);
        });
        
        document.body.appendChild(this.blendModePanel);
    }

    createVisualElements() {
        const placeholder = document.querySelector('.waves-image');
        if (!placeholder) {
            console.error('Could not find waves-image placeholder');
            return;
        }

        this.container = document.createElement('div');
        this.container.style.cssText = `
            width: ${placeholder.offsetWidth}px;
            height: 20px;
            position: relative;
            background: rgba(255, 255, 255, 0.1);
        `;

        this.recordingCanvas = document.createElement('canvas');
        this.recordingCanvas.width = placeholder.offsetWidth;
        this.recordingCanvas.height = 20;
        this.recordingCanvas.style.cssText = `
            display: block;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            background: rgba(255, 255, 255, 0.1);
        `;
        
        this.recordingCtx = this.recordingCanvas.getContext('2d', {
            alpha: true,
            willReadFrequently: true
        });
        
        if (this.DEBUG) {
            this.debugInfo = document.createElement('div');
            this.debugInfo.style.cssText = 'display: none;';
            this.container.appendChild(this.debugInfo);
        }

        this.container.appendChild(this.recordingCanvas);
        placeholder.parentNode.replaceChild(this.container, placeholder);
    }

    init() {
        if (this.DEBUG) console.log('Initializing visualizer...');
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.minDecibels = -90;
            this.analyser.maxDecibels = -10;
            this.analyser.smoothingTimeConstant = 0.85;
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            this.createVisualElements();
        } catch (error) {
            console.error('Error initializing visualizer:', error);
        }
    }

    start(stream) {
        if (this.DEBUG) console.log('Starting visualizer with stream:', stream);
        
        try {
            this.isRecording = true;
            this.recordedChunks = [];
            
            const existingVideo = this.container.querySelector('video');
            if (existingVideo) {
                existingVideo.pause();
                existingVideo.remove();
            }
            
            this.recordingCanvas.style.display = 'block';
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);

            const stream2 = this.recordingCanvas.captureStream(60);
            this.mediaRecorder = new MediaRecorder(stream2, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000
            });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.start(100);
            this.draw();
            
            if (this.DEBUG) console.log('Visualizer and recording started successfully');
        } catch (error) {
            console.error('Error starting visualizer:', error);
        }
    }

    draw() {
        try {
            if (!this.isRecording) return;

            this.animationId = requestAnimationFrame(() => this.draw());
            
            this.analyser.getByteFrequencyData(this.dataArray);
            
            const width = this.recordingCanvas.width;
            const height = this.recordingCanvas.height;
            const halfHeight = height / 2;
            const bufferLength = this.dataArray.length;
            const barWidth = width / bufferLength * 2;
            
            // Clear canvas with white background
            this.recordingCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.recordingCtx.fillRect(0, 0, width, height);
            
            // Draw waveform
            this.recordingCtx.globalCompositeOperation = 'source-over';
            this.recordingCtx.fillStyle = '#000000';
            this.recordingCtx.strokeStyle = '#000000';
            this.recordingCtx.lineWidth = 1;
            this.recordingCtx.globalAlpha = 0.2;

            const maxValue = Math.max(...this.dataArray);
            const minScaleFactor = 0.8;
            const scaleFactor = Math.max(minScaleFactor, 255 / maxValue);

            // Draw top bars
            for (let i = 0; i < bufferLength; i++) {
                let normalizedValue = (this.dataArray[i] * scaleFactor) / 255;
                normalizedValue = Math.min(normalizedValue, 1.0);
                normalizedValue = Math.max(normalizedValue, 0.1);
                
                const barHeight = normalizedValue * halfHeight;
                const x = i * barWidth;
                const y = halfHeight - barHeight;
                
                this.recordingCtx.fillRect(x, y, barWidth - 1, barHeight);
                this.recordingCtx.strokeRect(x, y, barWidth - 1, barHeight);
            }

            // Draw bottom bars (mirrored)
            for (let i = 0; i < bufferLength; i++) {
                let normalizedValue = (this.dataArray[i] * scaleFactor) / 255;
                normalizedValue = Math.min(normalizedValue, 1.0);
                normalizedValue = Math.max(normalizedValue, 0.1);
                
                const barHeight = normalizedValue * halfHeight;
                const x = i * barWidth;
                const y = halfHeight;
                
                this.recordingCtx.fillRect(x, y, barWidth - 1, barHeight);
                this.recordingCtx.strokeRect(x, y, barWidth - 1, barHeight);
            }
            
        } catch (error) {
            console.error('Error in draw loop:', error);
        }
    }

    stop() {
        if (this.DEBUG) console.log('Stopping visualizer');
        
        this.isRecording = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm;codecs=vp9' });
                
                const existingVideos = this.container.querySelectorAll('video');
                existingVideos.forEach(video => {
                    video.pause();
                    video.remove();
                });
                
                const video = document.createElement('video');
                video.style.cssText = `
                    display: block;
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    mix-blend-mode: source-over;
                    background: rgba(255, 255, 255, 0.1);
                    opacity: 0.1;
                `;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                video.src = URL.createObjectURL(blob);
                video.play();

                this.recordingCanvas.style.display = 'none';
                this.container.appendChild(video);
            };
        }
    }

    updateDebugInfo(message) {
        if (this.DEBUG && this.debugInfo) {
            this.debugInfo.textContent = message;
        }
    }
} 