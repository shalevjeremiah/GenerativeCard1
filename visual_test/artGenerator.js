console.log('Art Generator script loaded');

class ArtGenerator {
    constructor(canvas) {
        console.log('Initializing ArtGenerator');
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Create offscreen canvas
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = canvas.width;
        this.offscreenCanvas.height = canvas.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        
        // Initialize WebGL displacement effect using Glass.png
        console.log('Initializing WebGL displacement effect...');
        const displacementCanvas = document.getElementById('displacementCanvas');
        if (displacementCanvas) {
            // Use relative path to work with both file:// and http:// protocols
            this.webglDisplacement = new WebGLDisplacementEffect(displacementCanvas, 'Assets/Glass.png');
            console.log('WebGL displacement effect created');
        } else {
            console.error('Displacement canvas not found');
        }
        
        // Remove any existing glass effect overlays
        this.removeExistingGlassOverlays();
        
        // Define core emotional colors - using more distinct colors for better blending
        this.emotionColors = {
            joy: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4'],
            sadness: ['#4682B4', '#6495ED', '#87CEEB', '#B0E0E6'],
            anger: ['#FF0000', '#DC143C', '#8B0000', '#FF4500'],
            fear: ['#800080', '#663399', '#483D8B', '#4B0082'],
            surprise: ['#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB'],
            disgust: ['#556B2F', '#6B8E23', '#808000', '#698B22'],
            neutral: ['#A9A9A9', '#808080', '#696969', '#778899']
        };
        
        // Animation properties
        this.time = 0;
        this.particles = [];
        this.flowField = [];
        this.lastFrameTime = 0;
        this.noiseZ = 0;
        
        // Flow field properties
        this.flowFieldSize = 20;
        this.cols = Math.ceil(this.canvas.width / this.flowFieldSize);
        this.rows = Math.ceil(this.canvas.height / this.flowFieldSize);
        
        // Parameters that influence the art
        this.recordingLength = 3;
        this.wordCount = 20;
        this.emotions = {
            joy: 0.5,
            sadness: 0.2,
            anger: 0.1,
            fear: 0,
            disgust: 0
        };
        this.nameLength = 8;
        this.dateHash = 0;
        
        // Canvas blur properties
        this.canvasBlurEnabled = false;
        this.blurAmount = 5;
        this.pulsePhase = 0;
        
        // Initialize noise
        this.noise = new SimplexNoise();
        this.noiseScale = 0.004;
        this.timeScale = 0.0002;
        
        // Animation running flag
        this.animationRunning = false;
        
        // Glass displacement timing
        this.lastDisplacementTime = 0;
        this.displacementInterval = 1000 / 30; // Apply displacement at 30 FPS instead of 60 FPS
        this.frameCount = 0;
        
        // Bind animation method
        this.animate = this.animate.bind(this);
        
        console.log('Art Generator initialized with canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
    }

    removeExistingGlassOverlays() {
        // Remove any existing glass effect DOM elements
        const parent = this.canvas.parentElement;
        console.log('Checking for existing glass overlays in parent:', parent);
        
        // Remove all divs that might be glass overlays
        const allDivs = parent.querySelectorAll('div');
        let removedCount = 0;
        allDivs.forEach(div => {
            const style = div.style;
            if (style.position === 'absolute' && (style.zIndex || style.mixBlendMode)) {
                console.log('Removing glass overlay div:', div);
                div.remove();
                removedCount++;
            }
        });
        
        console.log('Removed', removedCount, 'glass overlay elements');
    }

    generateArt(params) {
        console.log('Generating art with params:', params);
        
        // Update parameters
        this.recordingLength = params.recordingLength || 3;
        this.wordCount = params.wordCount || 20;
        this.nameLength = params.authorName ? params.authorName.length : 8;
        this.emotions = params.emotions || this.emotions;
        this.dateHash = this.hashDate(params.date);
        
        // Clear existing particles
        this.particles = [];
        
        // Initialize new particles
        this.initializeParticles();
        console.log('Particles initialized:', this.particles.length);
        
        // Start animation if not running
        if (!this.animationRunning) {
            console.log('Starting animation');
            this.animationRunning = true;
            requestAnimationFrame(this.animate);
        }
    }

    hashDate(date) {
        return date.getTime() % 1000;
    }

    getEmotionBasedProperties() {
        const props = {
            particleSpeed: 1,
            wobbleFrequency: 1,
            spiralTightness: 1,
            colors: []
        };

        // Joy properties - warm, uplifting colors with more yellow/orange
        if (this.emotions.joy > 0) {
            props.particleSpeed *= 1 + this.emotions.joy * 0.08; // Drastically reduced speed multiplier
            props.wobbleFrequency *= 1 + this.emotions.joy * 0.15; // Reduced wobble frequency
            props.colors.push(
                'rgba(255, 223, 0, 0.8)',    // Golden yellow
                'rgba(255, 190, 0, 0.8)',    // Pure yellow
                'rgba(255, 170, 0, 0.8)',    // Orange-yellow
                'rgba(255, 140, 0, 0.8)',    // Dark orange
                'rgba(255, 200, 70, 0.8)',   // Light orange
                'rgba(255, 215, 0, 0.8)'     // Gold
            );
        }

        // Sadness properties - less horizontal movement
        if (this.emotions.sadness > 0) {
            props.particleSpeed *= 1 - this.emotions.sadness * 0.3;
            props.wobbleFrequency *= 0.2; // Reduced side-to-side movement
            props.colors.push(
                'rgba(0, 102, 204, 0.6)',     // Deep blue
                'rgba(51, 153, 255, 0.6)',    // Light blue
                'rgba(0, 128, 255, 0.6)',     // Sky blue
                'rgba(65, 105, 225, 0.6)',    // Royal blue
                'rgba(100, 149, 237, 0.6)',   // Cornflower blue
                'rgba(0, 150, 255, 0.5)'      // Bright blue
            );
        }

        // Anger properties - intense reds and oranges
        if (this.emotions.anger > 0) {
            props.particleSpeed *= 1 + this.emotions.anger;
            props.wobbleFrequency *= 1 + this.emotions.anger * 1.5;
            props.spiralTightness *= 1 + this.emotions.anger;
            props.colors.push(
                'rgba(255, 0, 0, 0.8)',      // Pure red
                'rgba(204, 0, 0, 0.8)',      // Dark red
                'rgba(255, 51, 0, 0.8)',     // Orange-red
                'rgba(220, 20, 60, 0.8)',    // Crimson
                'rgba(178, 34, 34, 0.8)',    // Firebrick
                'rgba(255, 69, 0, 0.8)'      // Red-orange
            );
        }

        // Fear properties - dark purples and blues
        if (this.emotions.fear > 0) {
            props.particleSpeed *= 0.7 + this.emotions.fear * 0.5;
            props.wobbleFrequency *= 2 + this.emotions.fear * 2;
            props.colors.push(
                'rgba(147, 0, 211, 0.7)',    // Purple
                'rgba(75, 0, 130, 0.7)',     // Indigo
                'rgba(128, 0, 128, 0.7)',    // Dark purple
                'rgba(138, 43, 226, 0.7)',   // Blue violet
                'rgba(148, 0, 211, 0.7)',    // Dark violet
                'rgba(153, 50, 204, 0.7)'    // Dark orchid
            );
        }

        // Disgust properties - new olive-based color scheme
        if (this.emotions.disgust > 0) {
            props.particleSpeed *= 0.8 + this.emotions.disgust * 0.4;
            props.wobbleFrequency *= 0.5 + this.emotions.disgust * 1.5;
            props.spiralTightness *= 0.7 + this.emotions.disgust * 0.6;
            props.colors.push(
                'rgba(116, 118, 78, 0.8)',    // Base color #74764E
                'rgba(106, 108, 68, 0.8)',    // Darker variant
                'rgba(126, 128, 88, 0.8)',    // Lighter variant
                'rgba(116, 118, 68, 0.8)',    // More saturated
                'rgba(106, 108, 78, 0.8)',    // Less saturated
                'rgba(126, 128, 78, 0.8)'     // Brighter variant
            );
        }

        // Default colors if no emotions are present
        if (props.colors.length === 0) {
            props.colors.push(
                'rgba(200, 200, 200, 0.8)',
                'rgba(150, 150, 150, 0.8)',
                'rgba(100, 100, 100, 0.8)'
            );
        }

        return props;
    }

    createParticle(x, y) {
        const emotionProps = this.getEmotionBasedProperties();
        
        // Create varied size distribution with larger bubbles overall
        let baseRadius;
        const sizeRoll = Math.random();
        if (sizeRoll > 0.95) {
            // Extra large bubbles (5% chance)
            baseRadius = 35 + Math.random() * 45;
        } else if (sizeRoll > 0.8) {
            // Large bubbles (15% chance)
            baseRadius = 25 + Math.random() * 30;
        } else {
            // Regular bubbles (80% chance)
            baseRadius = 15 + Math.random() * 20;
        }
        
        return {
            x: x || Math.random() * this.canvas.width,
            y: y || Math.random() * this.canvas.height,
            radius: baseRadius,
            baseRadius: baseRadius,
            color: this.getRandomEmotionColor(),
            opacity: 0,
            targetOpacity: sizeRoll > 0.8 ? 0.6 : 0.8, // Lower opacity for larger bubbles
            age: 0,
            lifespan: 8 + Math.random() * 15,
            fadeOutStart: 6 + Math.random() * 12,
            fadeInDuration: 0.5,
            timeOffset: Math.random() * 1000,
            phase: Math.random() * Math.PI * 2,
            frequency: 0.2 + Math.random() * 0.3,
            amplitude: 0.2 + Math.random() * 0.3,
            speed: (0.5 + Math.random() * 1.0) * emotionProps.particleSpeed * (sizeRoll > 0.8 ? 0.7 : 1), // Slower speed for larger bubbles
            noiseOffset: {
                x: Math.random() * 1000,
                y: Math.random() * 1000
            }
        };
    }

    getRandomEmotionColor() {
        const props = this.getEmotionBasedProperties();
        if (props.colors.length === 0) return 'rgba(200, 200, 200, 0.8)';
        return props.colors[Math.floor(Math.random() * props.colors.length)];
    }

    initializeParticles() {
        // Scale particle count based on both word count and name length
        const baseParticleCount = 30;
        const wordCountFactor = Math.floor(this.wordCount * 0.5);
        const nameLengthFactor = Math.floor(this.nameLength * 0.5);
        const particleCount = baseParticleCount + wordCountFactor + nameLengthFactor;
        
        console.log('Creating particles:', particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    getCurlNoise(x, y, z) {
        const eps = 0.0001;
        
        let n1 = this.noise.noise3D(x, y + eps, z);
        let n2 = this.noise.noise3D(x, y - eps, z);
        const curl = {
            x: (n1 - n2) / (2 * eps)
        };
        
        n1 = this.noise.noise3D(x + eps, y, z);
        n2 = this.noise.noise3D(x - eps, y, z);
        curl.y = (n1 - n2) / (2 * eps);
        
        return curl;
    }

    updateParticle(particle, deltaTime) {
        const dt = deltaTime * 0.001;
        particle.age += dt;

        // Update opacity based on particle lifecycle
        if (particle.age < particle.fadeInDuration) {
            particle.opacity = (particle.age / particle.fadeInDuration) * particle.targetOpacity;
        } else if (particle.age > particle.fadeOutStart) {
            const fadeOutDuration = particle.lifespan - particle.fadeOutStart;
            const fadeOutTime = particle.age - particle.fadeOutStart;
            particle.opacity = particle.targetOpacity * (1 - (fadeOutTime / fadeOutDuration));
        } else {
            particle.opacity = particle.targetOpacity;
        }

        // Get noise values for organic movement
        const noiseScale = 0.002;
        const nx = particle.noiseOffset.x + particle.x * noiseScale;
        const ny = particle.noiseOffset.y + particle.y * noiseScale;
        const noiseVal = this.noise.noise2D(nx, ny);

        // Base movement variables
        const time = (this.time + particle.timeOffset) * 0.001;
        const wobble = Math.sin(time * particle.frequency * 2 * Math.PI) * particle.amplitude;

        // Initialize movement
        let dx = 0;
        let dy = 0;

        // Joy - more spontaneous movement with further reduced speed
        if (this.emotions.joy > 0) {
            const spontaneity = Math.sin(time * 1.2 + particle.phase) * Math.cos(time * 0.8); // Slower oscillation
            dx += (wobble * 15 + spontaneity * 8) * this.emotions.joy; // Reduced movement amplitudes
            dy -= particle.speed * (0.25 + noiseVal * 0.15) * this.emotions.joy; // Much slower upward movement
        }

        // Sadness - more focused downward movement
        if (this.emotions.sadness > 0) {
            const rainSpeed = particle.speed * (1.2 + noiseVal * 0.1);
            dy += rainSpeed * this.emotions.sadness;
            dx += wobble * 5 * this.emotions.sadness; // Reduced horizontal movement
        }

        // Anger - erratic movement
        if (this.emotions.anger > 0) {
            const angle = noiseVal * Math.PI * 2;
            dx += Math.cos(angle) * particle.speed * this.emotions.anger * 2;
            dy += Math.sin(angle) * particle.speed * this.emotions.anger * 2;
        }

        // Fear - shaky nervous movement
        if (this.emotions.fear > 0) {
            const fearShake = Math.sin(time * 20) * 2 * this.emotions.fear;
            const fearJitter = (Math.random() - 0.5) * 4 * this.emotions.fear;
            dx += fearShake + fearJitter;
            dy += fearShake + fearJitter;
        }

        // Disgust - unstable spiral-like movement
        if (this.emotions.disgust > 0) {
            const disgustedMotion = Math.sin(time * 3) * Math.cos(time * 2);
            dx += disgustedMotion * particle.speed * this.emotions.disgust * 2;
            dy += Math.sin(time * 4) * particle.speed * this.emotions.disgust;
        }

        // Scale movement based on recording length
        const speedScale = Math.max(0.5, Math.min(2.0, this.recordingLength / 3));
        dx *= speedScale;
        dy *= speedScale;

        // Apply movement
        particle.x += dx * dt * 60;
        particle.y += dy * dt * 60;

        // Wrap around edges
        if (particle.x < -particle.radius) particle.x = this.canvas.width + particle.radius;
        if (particle.x > this.canvas.width + particle.radius) particle.x = -particle.radius;
        if (particle.y < -particle.radius) particle.y = this.canvas.height + particle.radius;
        if (particle.y > this.canvas.height + particle.radius) particle.y = -particle.radius;

        // Update radius with wobble effect
        const radiusWobble = Math.sin(time * 4 + particle.phase) * 2;
        particle.radius = particle.baseRadius + radiusWobble;

        return particle.age < particle.lifespan;
    }

    getDominantEmotion() {
        const emotions = [
            { name: 'joy', value: this.emotions.joy },
            { name: 'sadness', value: this.emotions.sadness },
            { name: 'anger', value: this.emotions.anger },
            { name: 'fear', value: this.emotions.fear },
            { name: 'disgust', value: this.emotions.disgust }
        ];
        
        return emotions.reduce((prev, current) => 
            (current.value > prev.value) ? current : prev
        );
    }

    getEmotionalBackground() {
        const dominantEmotion = this.getDominantEmotion();
        
        // Define emotional background colors
        const backgrounds = {
            joy: {
                start: 'rgba(135, 206, 235, 1)',      // Sky blue
                middle: 'rgba(176, 226, 255, 1)',     // Light sky blue
                end: 'rgba(135, 206, 235, 1)'         // Sky blue
            },
            sadness: {
                start: 'rgba(0, 15, 35, 1)',      // Dark blue
                middle: 'rgba(5, 20, 40, 1)',     // Navy blue
                end: 'rgba(0, 10, 30, 1)'         // Deep blue
            },
            anger: {
                start: 'rgba(90, 10, 10, 1)',       // Deeper red
                middle: 'rgba(120, 20, 20, 1)',     // Medium red
                end: 'rgba(80, 15, 15, 1)'         // Dark red
            },
            fear: {
                start: 'rgba(20, 0, 30, 1)',      // Dark purple
                middle: 'rgba(25, 5, 35, 1)',     // Deep violet
                end: 'rgba(15, 0, 25, 1)'         // Dark indigo
            },
            disgust: {
                start: 'rgba(15, 25, 0, 1)',      // Dark olive
                middle: 'rgba(20, 30, 5, 1)',     // Deep moss
                end: 'rgba(10, 20, 0, 1)'         // Dark green
            }
        };

        // Default dark background if no dominant emotion
        if (dominantEmotion.value < 0.1) {
            return {
                start: 'rgba(15, 15, 25, 1)',
                middle: 'rgba(20, 15, 35, 1)',
                end: 'rgba(15, 15, 25, 1)'
            };
        }

        return backgrounds[dominantEmotion.name];
    }

    animate(currentTime) {
        if (!this.animationRunning) return;
        
        if (!this.lastFrameTime) {
            this.lastFrameTime = currentTime;
            console.log('Animation started');
        }
        
        // Calculate delta time
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        this.time = currentTime;
        
        // Clear both canvases
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Get emotional background colors
        const bgColors = this.getEmotionalBackground();
        
        // Create emotion-based gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, bgColors.start);
        gradient.addColorStop(0.5, bgColors.middle);
        gradient.addColorStop(1, bgColors.end);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add subtle noise pattern to background with emotional tint
        const noiseScale = 0.01;
        const noiseOpacity = 0.03;
        const dominantEmotion = this.getDominantEmotion();
        
        for (let x = 0; x < this.canvas.width; x += 4) {
            for (let y = 0; y < this.canvas.height; y += 4) {
                const noise = this.noise.noise2D(x * noiseScale, y * noiseScale);
                const color = Math.floor((noise + 1) * 128);
                
                // Add slight color tint to noise based on emotion
                let r = color, g = color, b = color;
                if (dominantEmotion.value >= 0.1) {
                    switch (dominantEmotion.name) {
                        case 'joy':
                            r = color + 10;
                            g = color + 5;
                            break;
                        case 'sadness':
                            b = color + 10;
                            break;
                        case 'anger':
                            r = color + 10;
                            break;
                        case 'fear':
                            r = color + 5;
                            b = color + 10;
                            break;
                        case 'disgust':
                            g = color + 10;
                            break;
                    }
                }
                
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${noiseOpacity})`;
                this.ctx.fillRect(x, y, 4, 4);
            }
        }

        // Add slight fade effect with emotional tint
        this.ctx.fillStyle = bgColors.start.replace('1)', '0.1)');
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and filter particles
        this.particles = this.particles.filter(particle => this.updateParticle(particle, deltaTime));

        // Add new particles if needed
        while (this.particles.length < 30) {
            this.particles.push(this.createParticle());
        }

        // Draw particles
        this.drawParticles();
        
        // Copy to main canvas
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        
        // Apply WebGL displacement effect at controlled intervals
        this.frameCount++;
        if (this.webglDisplacement && this.webglDisplacement.initialized) {
            const timeSinceLastDisplacement = currentTime - this.lastDisplacementTime;
            if (timeSinceLastDisplacement >= this.displacementInterval) {
                const scale = this.displacementScale || 20;
                this.webglDisplacement.apply(this.canvas, scale);
                this.lastDisplacementTime = currentTime;
            }
        }
        
        // Request next frame
        requestAnimationFrame(this.animate);
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.offscreenCtx.beginPath();
            this.offscreenCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.offscreenCtx.fillStyle = particle.color;
            this.offscreenCtx.globalAlpha = particle.opacity;
            this.offscreenCtx.fill();
            this.offscreenCtx.globalAlpha = 1;
        });
    }

    toggleCanvasBlur() {
        this.canvasBlurEnabled = !this.canvasBlurEnabled;
    }

    setBlurAmount(amount) {
        this.blurAmount = amount;
    }

    setGlassStrength(strength) {
        if (this.webglDisplacement) {
            // Store the displacement scale for use in apply method
            this.displacementScale = Math.max(5, Math.min(50, strength * 2 + 5));
        }
    }
}

// Export for use in other files
window.ArtGenerator = ArtGenerator; 