// Chrome Equalizer Visualizer - Isolated Edition with Live Audio
class ChromeEqualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 468.48;
        this.height = 216.96;
        this.isRunning = false;
        this.animationId = null;
        this.bars = [];
        this.time = 0;
        
        // Mouse interaction properties
        this.mouseX = -1;
        this.mouseY = -1;
        this.isMouseOver = false;
        this.hoverRadius = 80; // Radius of influence for hover effect
        this.maxWidthMultiplier = 2.5; // Maximum width expansion
        
        // Audio recording properties
        this.isRecording = false;
        this.isPlayingRecording = false;
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.recordedData = [];
        this.playbackIndex = 0;
        this.mode = 'simulation'; // 'simulation', 'live', 'playback'
        
        // Specifications: exactly 15 bars, no gaps, 4 equalizers (2x2 grid) or single mode
        this.barCount = 15;
        this.singleMode = false; // Toggle between single and quad mode
        this.updateDimensions();
        
        this.initializeBars();
        this.setupMouseEvents();
    }
    
    updateDimensions() {
        if (this.singleMode) {
            // Single equalizer mode - use full canvas
            this.barWidth = this.width / this.barCount;
            this.equalizerWidth = this.width;
            this.equalizerHeight = this.height;
            this.maxBarHeight = this.equalizerHeight * 0.8;
            this.minBarHeight = 12;
        } else {
            // Quad mode - 2x2 grid
            this.barWidth = (this.width / 2) / this.barCount; // Each equalizer takes half the width
            this.equalizerWidth = this.width / 2; // Each equalizer takes half the canvas width
            this.equalizerHeight = this.height / 2; // Each equalizer takes half the canvas height
            this.maxBarHeight = this.equalizerHeight * 0.7;
            this.minBarHeight = 8;
        }
        
        // Update base widths and positions for existing bars
        if (this.bars && this.bars.length > 0) {
            for (let i = 0; i < this.bars.length; i++) {
                this.bars[i].x = i * this.barWidth;
                this.bars[i].baseX = i * this.barWidth;
                this.bars[i].targetX = i * this.barWidth;
                this.bars[i].baseWidth = this.barWidth;
                this.bars[i].currentWidth = this.barWidth;
                this.bars[i].targetWidth = this.barWidth;
            }
        }
    }
    
    initializeBars() {
        this.bars = [];
        for (let i = 0; i < this.barCount; i++) {
            this.bars.push({
                height: this.minBarHeight,
                targetHeight: this.minBarHeight,
                x: i * this.barWidth,
                baseX: i * this.barWidth,
                targetX: i * this.barWidth,
                frequency: Math.random() * 0.08 + 0.03, // Natural frequency range for smooth movement
                phase: Math.random() * Math.PI * 2,
                baseWidth: this.barWidth,
                currentWidth: this.barWidth,
                targetWidth: this.barWidth
            });
        }
    }
    
    setupMouseEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.isMouseOver = true;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseOver = false;
            this.mouseX = -1;
            this.mouseY = -1;
        });
        
        this.canvas.addEventListener('mouseenter', () => {
            this.isMouseOver = true;
        });
    }
    
    calculateHoverEffect() {
        if (!this.isMouseOver) {
            // Reset all bars to normal width when not hovering
            for (let i = 0; i < this.bars.length; i++) {
                this.bars[i].targetWidth = this.bars[i].baseWidth;
                this.bars[i].targetX = this.bars[i].baseX;
            }
            return;
        }
        
        // First pass: calculate raw influence for each bar
        const influences = [];
        let totalInfluence = 0;
        
        for (let i = 0; i < this.bars.length; i++) {
            const bar = this.bars[i];
            
            // Calculate distance from mouse to bar center
            let barCenterX, barCenterY;
            
            if (this.singleMode) {
                // Single mode - bars are centered
                barCenterX = bar.baseX + this.barWidth / 2;
                barCenterY = this.height / 2;
            } else {
                // Quad mode - calculate for all 4 positions, use closest
                const positions = [
                    { x: bar.baseX + this.barWidth / 2, y: this.equalizerHeight / 2 }, // Top-left
                    { x: (this.equalizerWidth - bar.baseX - this.barWidth) + this.equalizerWidth - 1 + this.barWidth / 2, y: this.equalizerHeight / 2 }, // Top-right
                    { x: bar.baseX + this.barWidth / 2, y: this.equalizerHeight + this.equalizerHeight / 2 }, // Bottom-left
                    { x: (this.equalizerWidth - bar.baseX - this.barWidth) + this.equalizerWidth - 1 + this.barWidth / 2, y: this.equalizerHeight + this.equalizerHeight / 2 } // Bottom-right
                ];
                
                // Find closest position to mouse
                let minDistance = Infinity;
                for (const pos of positions) {
                    const distance = Math.sqrt(Math.pow(this.mouseX - pos.x, 2) + Math.pow(this.mouseY - pos.y, 2));
                    if (distance < minDistance) {
                        minDistance = distance;
                        barCenterX = pos.x;
                        barCenterY = pos.y;
                    }
                }
            }
            
            // Use only horizontal distance for hover influence
            const distance = Math.abs(this.mouseX - barCenterX);
            
            // Calculate influence based on distance
            let influence = 0;
            if (distance <= this.hoverRadius) {
                // Smooth falloff using cosine interpolation
                const normalizedDistance = distance / this.hoverRadius;
                influence = (Math.cos(normalizedDistance * Math.PI) + 1) / 2; // 0 to 1
            }
            
            influences[i] = influence;
            totalInfluence += influence;
        }
        
        // Second pass: calculate width changes while preserving total space
        const totalAvailableWidth = this.singleMode ? this.width : this.equalizerWidth;
        
        if (totalInfluence > 0) {
            // Calculate how much each bar wants to expand
            const desiredWidths = [];
            let totalDesiredWidth = 0;
            
            for (let i = 0; i < this.bars.length; i++) {
                const influence = influences[i];
                const expansion = influence * this.barWidth * (this.maxWidthMultiplier - 1);
                const desiredWidth = this.bars[i].baseWidth + expansion;
                desiredWidths[i] = desiredWidth;
                totalDesiredWidth += desiredWidth;
            }
            
            // Scale all widths proportionally to fit available space
            const scaleFactor = totalAvailableWidth / totalDesiredWidth;
            
            for (let i = 0; i < this.bars.length; i++) {
                this.bars[i].targetWidth = Math.max(
                    desiredWidths[i] * scaleFactor,
                    this.bars[i].baseWidth * 0.3 // Minimum 30% of original width
                );
            }
        } else {
            // No hover influence, reset to base widths
            for (let i = 0; i < this.bars.length; i++) {
                this.bars[i].targetWidth = this.bars[i].baseWidth;
            }
        }
        
        // Third pass: calculate new positions to maintain no gaps
        let currentX = 0;
        for (let i = 0; i < this.bars.length; i++) {
            this.bars[i].targetX = currentX;
            currentX += this.bars[i].targetWidth;
        }
    }
    
    updateBarWidths() {
        // Smooth interpolation for width and position changes
        for (let i = 0; i < this.bars.length; i++) {
            const bar = this.bars[i];
            const smoothing = 0.15; // Smooth transitions
            bar.currentWidth += (bar.targetWidth - bar.currentWidth) * smoothing;
            bar.x += (bar.targetX - bar.x) * smoothing;
        }
    }
    
    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
                                this.analyser.fftSize = 128; // Increased FFT for better frequency resolution
            this.analyser.smoothingTimeConstant = 0.7; // More smoothing for fluid movement
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            console.log('Audio context initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            return false;
        }
    }
    
    async startRecording() {
        try {
            if (!this.audioContext) {
                const success = await this.initializeAudio();
                if (!success) return false;
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            
            this.isRecording = true;
            this.mode = 'live';
            this.recordedData = [];
            console.log('Recording started');
            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            return false;
        }
    }
    
    stopRecording() {
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
        this.isRecording = false;
        this.mode = 'simulation';
        console.log('Recording stopped, captured', this.recordedData.length, 'frames');
    }
    
    startPlayback() {
        if (this.recordedData.length === 0) {
            console.log('No recorded data to play back');
            return;
        }
        
        this.mode = 'playback';
        this.playbackIndex = 0;
        this.isPlayingRecording = true;
        console.log('Starting playback of', this.recordedData.length, 'frames');
    }
    
    stopPlayback() {
        this.mode = 'simulation';
        this.isPlayingRecording = false;
        this.playbackIndex = 0;
    }
    
    updateAudioData() {
        if (this.mode === 'live' && this.analyser) {
            // Get live audio data
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // Record the data for later playback
            if (this.isRecording) {
                this.recordedData.push([...this.dataArray]);
            }
            
            // Map frequency data to bars
            this.mapFrequencyDataToBars(this.dataArray);
            
        } else if (this.mode === 'playback' && this.recordedData.length > 0) {
            // Play back recorded data
            const currentFrame = this.recordedData[this.playbackIndex];
            this.mapFrequencyDataToBars(currentFrame);
            
            // Loop the playback
            this.playbackIndex = (this.playbackIndex + 1) % this.recordedData.length;
            
        } else {
            // Fallback to simulation
            this.simulateAudioData();
        }
    }
    
    mapFrequencyDataToBars(frequencyData) {
        // Map the frequency data to our 15 bars
        const dataPerBar = Math.floor(frequencyData.length / this.barCount);
        
        for (let i = 0; i < this.barCount; i++) {
            const startIndex = i * dataPerBar;
            const endIndex = Math.min(startIndex + dataPerBar, frequencyData.length);
            
            // Average the frequency data for this bar
            let sum = 0;
            for (let j = startIndex; j < endIndex; j++) {
                sum += frequencyData[j];
            }
            const average = sum / (endIndex - startIndex);
            
            // Convert to bar height with increased sensitivity
            // Apply exponential scaling for more dramatic movement
            const normalizedValue = Math.pow(average / 255, 0.6); // Power curve for more sensitivity
            const sensitivityMultiplier = 2.5; // Increased overall sensitivity
            const targetHeight = this.minBarHeight + (normalizedValue * (this.maxBarHeight - this.minBarHeight) * sensitivityMultiplier);
            
            // Enhanced bass boost and frequency-specific amplification
            let frequencyBoost = 1.0;
            if (i < 3) frequencyBoost = 2.2; // Strong bass boost
            else if (i < 6) frequencyBoost = 1.8; // Mid-bass boost
            else if (i < 10) frequencyBoost = 1.4; // Mid-range boost
            else frequencyBoost = 1.6; // Treble boost
            
            this.bars[i].targetHeight = Math.min(targetHeight * frequencyBoost, this.maxBarHeight * 1.2);
            
            // Smoother, more natural interpolation
            const smoothing = 0.08; // Much slower, more fluid response
            this.bars[i].height += (this.bars[i].targetHeight - this.bars[i].height) * smoothing;
        }
    }
    
    simulateAudioData() {
        this.time += 0.08; // Slower, more natural time progression
        
        for (let i = 0; i < this.bars.length; i++) {
            const bar = this.bars[i];
            
            // Create smooth, natural audio-like movement with organic flow
            const baseFreq = Math.sin(this.time * bar.frequency + bar.phase);
            const harmonic1 = Math.sin(this.time * bar.frequency * 2.1 + bar.phase) * 0.5;
            const harmonic2 = Math.sin(this.time * bar.frequency * 3.7 + bar.phase) * 0.3;
            const harmonic3 = Math.sin(this.time * bar.frequency * 5.3 + bar.phase) * 0.2;
            
            // Reduced noise for smoother movement
            const noise = (Math.random() - 0.5) * 0.15; // Much less chaotic noise
            
            // Gentle global pulse effect
            const pulse = Math.sin(this.time * 0.2) * 0.2;
            
            // Smooth breathing effect that affects all bars
            const breathe = Math.sin(this.time * 0.1) * 0.15;
            
            // Enhanced frequency-specific boosts with smoother transitions
            let frequencyBoost = 1.0;
            if (i < 3) frequencyBoost = 1.8; // Moderate bass boost
            else if (i < 6) frequencyBoost = 1.4; // Mid-bass
            else if (i < 10) frequencyBoost = 1.2; // Mid-range
            else frequencyBoost = 1.3; // Treble
            
            // Combine all elements for natural movement
            const amplitude = (baseFreq + harmonic1 + harmonic2 + harmonic3 + noise + pulse + breathe) * 0.35 + 0.65;
            const sensitivityMultiplier = 1.5; // Moderate sensitivity for smoother movement
            bar.targetHeight = this.minBarHeight + (amplitude * (this.maxBarHeight - this.minBarHeight) * frequencyBoost * sensitivityMultiplier);
            
            // Smooth, consistent interpolation with slight variation for organic feel
            const baseSmoothing = 0.06; // Base smooth movement
            const variation = Math.sin(this.time * 0.5 + i * 0.3) * 0.02; // Gentle variation
            const smoothing = baseSmoothing + variation;
            bar.height += (bar.targetHeight - bar.height) * smoothing;
        }
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.clear();
    }
    
    toggleMode() {
        this.singleMode = !this.singleMode;
        this.updateDimensions();
        this.initializeBars();
        console.log('Switched to', this.singleMode ? 'single' : 'quad', 'mode');
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        // Draw black background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.updateAudioData();
        this.calculateHoverEffect();
        this.updateBarWidths();
        this.renderChrome();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    renderChrome() {
        this.clear();
        
        if (this.singleMode) {
            // Single equalizer mode - centered, full canvas
            for (let i = 0; i < this.bars.length; i++) {
                const bar = this.bars[i];
                const barX = bar.x; // Use dynamic position
                const barY = (this.height - bar.height) / 2; // Center vertically
                
                // Create gradient for single equalizer
                const gradient = this.ctx.createLinearGradient(barX, 0, barX + bar.currentWidth, 0);
                gradient.addColorStop(0, '#000000');
                gradient.addColorStop(1, '#ffffff');
                
                // Draw single centered equalizer with dynamic width
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(barX, barY, bar.currentWidth, bar.height);
            }
        } else {
            // Quad mode - 4 equalizers in a 2x2 grid with right side mirrored
            for (let i = 0; i < this.bars.length; i++) {
                const bar = this.bars[i];
                const barX = bar.x; // Use dynamic position
                
                // Calculate mirrored position for right side (flip horizontally)
                // For mirroring, we need to calculate based on the total width used by all bars
                let totalCurrentWidth = 0;
                for (let j = 0; j < this.bars.length; j++) {
                    totalCurrentWidth += this.bars[j].currentWidth;
                }
                
                // Calculate mirrored position
                let mirroredBarX = this.equalizerWidth - bar.x - bar.currentWidth;
                
                // Adjust for the difference in total width vs equalizer width
                const widthDifference = this.equalizerWidth - totalCurrentWidth;
                mirroredBarX += widthDifference;
                
                // Calculate positions for 4 equalizers (eliminate gaps with -1 offset)
                // Top-left equalizer
                const topLeftX = barX;
                const topLeftY = this.equalizerHeight - bar.height;
                
                // Top-right equalizer (mirrored horizontally)
                const topRightX = mirroredBarX + this.equalizerWidth - 1; // -1 to eliminate gap
                const topRightY = this.equalizerHeight - bar.height;
                
                // Bottom-left equalizer
                const bottomLeftX = barX;
                const bottomLeftY = this.equalizerHeight;
                
                // Bottom-right equalizer (mirrored horizontally)
                const bottomRightX = mirroredBarX + this.equalizerWidth - 1; // -1 to eliminate gap
                const bottomRightY = this.equalizerHeight;
                
                // Create gradient for each position with dynamic width
                // Top-left gradient (normal)
                const gradientTL = this.ctx.createLinearGradient(topLeftX, 0, topLeftX + bar.currentWidth, 0);
                gradientTL.addColorStop(0, '#000000');
                gradientTL.addColorStop(1, '#ffffff');
                
                // Top-right gradient (mirrored - white to black)
                const gradientTR = this.ctx.createLinearGradient(topRightX, 0, topRightX + bar.currentWidth, 0);
                gradientTR.addColorStop(0, '#ffffff');  // Flipped: white first
                gradientTR.addColorStop(1, '#000000');  // Flipped: black last
                
                // Bottom-left gradient (normal)
                const gradientBL = this.ctx.createLinearGradient(bottomLeftX, 0, bottomLeftX + bar.currentWidth, 0);
                gradientBL.addColorStop(0, '#000000');
                gradientBL.addColorStop(1, '#ffffff');
                
                // Bottom-right gradient (mirrored - white to black)
                const gradientBR = this.ctx.createLinearGradient(bottomRightX, 0, bottomRightX + bar.currentWidth, 0);
                gradientBR.addColorStop(0, '#ffffff');  // Flipped: white first
                gradientBR.addColorStop(1, '#000000');  // Flipped: black last
                
                // Draw top-left equalizer (grows upward) with dynamic width
                this.ctx.fillStyle = gradientTL;
                this.ctx.fillRect(topLeftX, topLeftY, bar.currentWidth, bar.height);
                
                // Draw top-right equalizer (grows upward, mirrored) with dynamic width
                this.ctx.fillStyle = gradientTR;
                this.ctx.fillRect(topRightX, topRightY, bar.currentWidth, bar.height);
                
                // Draw bottom-left equalizer (grows downward) with dynamic width
                this.ctx.fillStyle = gradientBL;
                this.ctx.fillRect(bottomLeftX, bottomLeftY, bar.currentWidth, bar.height);
                
                // Draw bottom-right equalizer (grows downward, mirrored) with dynamic width
                this.ctx.fillStyle = gradientBR;
                this.ctx.fillRect(bottomRightX, bottomRightY, bar.currentWidth, bar.height);
            }
        }
    }
    
    randomize() {
        // Randomize all bar frequencies and phases for variety
        for (let i = 0; i < this.bars.length; i++) {
            this.bars[i].frequency = Math.random() * 0.12 + 0.02;
            this.bars[i].phase = Math.random() * Math.PI * 2;
        }
    }
}

// Global equalizer instance
let chromeEqualizer;

// Initialize equalizer when page loads
document.addEventListener('DOMContentLoaded', () => {
    chromeEqualizer = new ChromeEqualizer('chromeEq');
});

// Control functions
function startEqualizer() {
    if (chromeEqualizer) {
        chromeEqualizer.start();
    }
}

function stopEqualizer() {
    if (chromeEqualizer) {
        chromeEqualizer.stop();
    }
}

function randomize() {
    if (chromeEqualizer) {
        chromeEqualizer.randomize();
    }
}

async function startRecording() {
    if (chromeEqualizer) {
        const success = await chromeEqualizer.startRecording();
        if (success) {
            chromeEqualizer.start();
            updateRecordingStatus('🔴 Recording Live Audio...');
        } else {
            updateRecordingStatus('❌ Failed to start recording');
        }
    }
}

function stopRecording() {
    if (chromeEqualizer) {
        chromeEqualizer.stopRecording();
        updateRecordingStatus('⏹️ Recording stopped');
    }
}

function playRecording() {
    if (chromeEqualizer) {
        chromeEqualizer.startPlayback();
        chromeEqualizer.start();
        updateRecordingStatus('🔄 Playing recorded audio in loop...');
    }
}

function stopPlayback() {
    if (chromeEqualizer) {
        chromeEqualizer.stopPlayback();
        updateRecordingStatus('⏹️ Playback stopped');
    }
}

function toggleEqualizerMode() {
    if (chromeEqualizer) {
        chromeEqualizer.toggleMode();
        
        // Update button text
        const button = document.getElementById('modeToggle');
        if (button) {
            button.textContent = chromeEqualizer.singleMode ? '🔲 Quad Mode' : '📱 Single Mode';
        }
    }
}

function updateRecordingStatus(message) {
    const statusElement = document.getElementById('recordingStatus');
    if (statusElement) {
        statusElement.textContent = message;
    }
} 