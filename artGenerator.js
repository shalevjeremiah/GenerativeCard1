class ArtGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Create offscreen canvas
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = canvas.width;
        this.offscreenCanvas.height = canvas.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        
        // Create separate overlay canvas for noise texture (won't be affected by WebGL)
        this.noiseOverlayCanvas = document.createElement('canvas');
        this.noiseOverlayCanvas.width = canvas.width;
        this.noiseOverlayCanvas.height = canvas.height;
        this.noiseOverlayCanvas.style.position = 'absolute';
        this.noiseOverlayCanvas.style.top = '0';
        this.noiseOverlayCanvas.style.left = '0';
        this.noiseOverlayCanvas.style.width = '100%';
        this.noiseOverlayCanvas.style.height = '100%';
        this.noiseOverlayCanvas.style.pointerEvents = 'none';
        this.noiseOverlayCanvas.style.zIndex = '15';
        this.noiseOverlayCanvas.style.mixBlendMode = 'overlay';
        this.noiseOverlayCanvas.style.opacity = '0.48';
        this.noiseOverlayCanvas.style.borderRadius = '5px';
        this.noiseOverlayCtx = this.noiseOverlayCanvas.getContext('2d');
        
        // Insert noise overlay after main canvas
        if (canvas.parentNode) {
            canvas.parentNode.insertBefore(this.noiseOverlayCanvas, canvas.nextSibling);
        }
        
        // Initialize noise animation properties
        this.noiseAnimationSpeed = 1; // 1 frame between updates = ~60 fps
        this.noiseFrameCounter = 0;
        
        // Generate procedural noise texture immediately
        setTimeout(() => {
            this.updateNoiseOverlay();
        }, 100); // Small delay to ensure canvas is properly initialized
        
        // Initialize properties
        this.particles = [];
        this.frameCount = 0;
        this.lastTime = 0;
        
        // Displacement settings
        this.displacementScale = 50;
        
        // Emotional state
        this.emotionalState = {
            joy: 0,
            sadness: 0,
            anger: 0,
            fear: 0,
            surprise: 0,
            disgust: 0,
            love: 0
        };
        
        // Default parameters (will be updated by setParameters)
        this.recordingLength = 30;
        this.wordCount = 10;
        this.nameLength = 8;
        
        // Initialize WebGL displacement effect using Glass.png
        const displacementCanvas = document.getElementById('displacementCanvas');
        if (displacementCanvas) {
            this.webglDisplacement = new WebGLDisplacementEffect(displacementCanvas, 'Assets/Glass.png');
        }
        
        // Initialize SimplexNoise for procedural generation
        this.noise = new SimplexNoise();
        
        // Animation properties
        this.time = 0;
        this.animationRunning = false;
        
        // Define emotions object
        this.emotions = {
            joy: 0,
            sadness: 0,
            anger: 0,
            fear: 0,
            disgust: 0,
            love: 0
        };
        
        /* -------------------------------------------------------------
         *  Reusable color palettes for emotion-specific particles
         * -------------------------------------------------------------*/
        this.neutralColors = [
            { r: 200, g: 200, b: 200, a: 0.8 },
            { r: 150, g: 150, b: 150, a: 0.8 },
            { r: 100, g: 100, b: 100, a: 0.8 }
        ];

        this.emotionalColors = {
            joy: [
                { r: 255, g: 223, b: 0, a: 0.8 },
                { r: 255, g: 190, b: 0, a: 0.8 },
                { r: 255, g: 170, b: 0, a: 0.8 },
                { r: 255, g: 140, b: 0, a: 0.8 },
                { r: 255, g: 200, b: 70, a: 0.8 },
                { r: 255, g: 215, b: 0, a: 0.8 }
            ],
            sadness: [
                { r: 0, g: 102, b: 204, a: 0.6 },
                { r: 51, g: 153, b: 255, a: 0.6 },
                { r: 0, g: 128, b: 255, a: 0.6 },
                { r: 65, g: 105, b: 225, a: 0.6 },
                { r: 100, g: 149, b: 237, a: 0.6 },
                { r: 0, g: 150, b: 255, a: 0.5 }
            ],
            anger: [
                { r: 255, g: 0, b: 0, a: 0.8 },
                { r: 204, g: 0, b: 0, a: 0.8 },
                { r: 255, g: 51, b: 0, a: 0.8 },
                { r: 220, g: 20, b: 60, a: 0.8 },
                { r: 178, g: 34, b: 34, a: 0.8 },
                { r: 255, g: 69, b: 0, a: 0.8 }
            ],
            fear: [
                { r: 147, g: 0, b: 211, a: 0.7 },
                { r: 75, g: 0, b: 130, a: 0.7 },
                { r: 128, g: 0, b: 128, a: 0.7 },
                { r: 138, g: 43, b: 226, a: 0.7 },
                { r: 148, g: 0, b: 211, a: 0.7 },
                { r: 153, g: 50, b: 204, a: 0.7 }
            ],
            disgust: [
                { r: 116, g: 118, b: 78, a: 0.8 },
                { r: 106, g: 108, b: 68, a: 0.8 },
                { r: 126, g: 128, b: 88, a: 0.8 },
                { r: 116, g: 118, b: 68, a: 0.8 },
                { r: 106, g: 108, b: 78, a: 0.8 },
                { r: 126, g: 128, b: 78, a: 0.8 }
            ],
            love: [
                { r: 255, g: 105, b: 180, a: 0.75 },  /* Hot pink */
                { r: 255, g: 160, b: 200, a: 0.75 },  /* Light pink */
                { r: 255, g: 120, b: 190, a: 0.75 },  /* Medium pink */
                { r: 255, g: 182, b: 193, a: 0.75 },  /* LightPink */
                { r: 255, g: 192, b: 203, a: 0.75 },  /* Pink */
                { r: 219, g: 112, b: 147, a: 0.75 }   /* PaleVioletRed */
            ]
        };
        
        // Bind animation method
        this.animate = this.animate.bind(this);
    }

    removeExistingGlassOverlays() {
        // Remove any existing glass effect DOM elements
        const parent = this.canvas.parentElement;
        
        // Remove all divs that might be glass overlays
        const allDivs = parent.querySelectorAll('div');
        let removedCount = 0;
        allDivs.forEach(div => {
            const style = div.style;
            if (style.position === 'absolute' && (style.zIndex || style.mixBlendMode)) {
                div.remove();
                removedCount++;
            }
        });
    }

    generateArt(params) {
        // Update parameters
        this.recordingLength = params.recordingLength || 3;
        this.wordCount = params.wordCount || 20;
        this.nameLength = params.authorName ? params.authorName.length : (params.author ? params.author.length : 8);
        this.emotions = params.emotions || this.emotions;
        this.dateHash = this.hashDate(params.date);
        
        // Clear existing particles
        this.particles = [];
        
        // Initialize new particles
        this.initializeParticles();
        
        // Start animation if not running
        if (!this.animationRunning) {
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

        // Helper function to blend colors
        const blendColor = (color1, color2, intensity) => {
            return {
                r: Math.round(color1.r + (color2.r - color1.r) * intensity),
                g: Math.round(color1.g + (color2.g - color1.g) * intensity),
                b: Math.round(color1.b + (color2.b - color1.b) * intensity),
                a: color1.a + (color2.a - color1.a) * intensity
            };
        };

        // Calculate total emotion intensity to determine neutral blend ratio
        const totalEmotionIntensity = Object.values(this.emotions).reduce((sum, val) => sum + val, 0);
        const neutralRatio = Math.max(0, 1 - totalEmotionIntensity);

        // Create blended color palette
        let blendedColors = [];

        // Start with neutral colors weighted by neutral ratio
        this.neutralColors.forEach(neutralColor => {
            let blendedColor = { ...neutralColor };
            
            // Blend each emotion into this neutral color
            Object.keys(this.emotions).forEach(emotion => {
                const intensity = this.emotions[emotion];
                if (intensity > 0 && this.emotionalColors[emotion]) {
                    // Pick a random emotional color for this blend
                    const emotionColor = this.emotionalColors[emotion][Math.floor(Math.random() * this.emotionalColors[emotion].length)];
                    blendedColor = blendColor(blendedColor, emotionColor, intensity);
                }
            });
            
            blendedColors.push(`rgba(${blendedColor.r}, ${blendedColor.g}, ${blendedColor.b}, ${blendedColor.a})`);
        });

        // Add some pure emotional colors based on their intensity
        Object.keys(this.emotions).forEach(emotion => {
            const intensity = this.emotions[emotion];
            if (intensity > 0 && this.emotionalColors[emotion]) {
                const numColorsToAdd = Math.ceil(intensity * this.emotionalColors[emotion].length);
                for (let i = 0; i < numColorsToAdd; i++) {
                    const emotionColor = this.emotionalColors[emotion][i % this.emotionalColors[emotion].length];
                    blendedColors.push(`rgba(${emotionColor.r}, ${emotionColor.g}, ${emotionColor.b}, ${emotionColor.a})`);
                }
            }
        });

        props.colors = blendedColors;

        // Apply emotional effects to movement properties
        if (this.emotions.joy > 0) {
            props.particleSpeed *= 1 + this.emotions.joy * 0.08;
            props.wobbleFrequency *= 1 + this.emotions.joy * 0.15;
        }

        if (this.emotions.sadness > 0) {
            props.particleSpeed *= 1 - this.emotions.sadness * 0.3;
            props.wobbleFrequency *= 0.2;
        }

        if (this.emotions.anger > 0) {
            props.particleSpeed *= 1 + this.emotions.anger;
            props.wobbleFrequency *= 1 + this.emotions.anger * 1.5;
            props.spiralTightness *= 1 + this.emotions.anger;
        }

        if (this.emotions.fear > 0) {
            props.particleSpeed *= 0.7 + this.emotions.fear * 0.5;
            props.wobbleFrequency *= 2 + this.emotions.fear * 2;
        }

        if (this.emotions.disgust > 0) {
            props.particleSpeed *= 0.8 + this.emotions.disgust * 0.4;
            props.wobbleFrequency *= 0.5 + this.emotions.disgust * 1.5;
            props.spiralTightness *= 0.7 + this.emotions.disgust * 0.6;
        }

        if (this.emotions.love > 0) {
            props.particleSpeed *= 0.9; // slightly slower dreamy drift
            props.wobbleFrequency *= 0.8; // gentle
            props.spiralTightness *= 1 + this.emotions.love * 0.4; // subtle spiral
        }

        return props;
    }

    createParticle(x, y) {
        const emotionProps = this.getEmotionBasedProperties();
        
        // -----------------------------------------------------------
        //  Select a dominant emotion for this particle based on the
        //  current emotion intensity weights (supports mixed &
        //  transitioning emotion states)
        // -----------------------------------------------------------
        const emotion = this.getWeightedRandomEmotion();

        // Pick a colour from that emotion's dedicated palette (or
        // neutral greys if no emotion)
        const color = this.getColorForEmotion(emotion);
        
        // Author Name Length Effects - affect particle size directly
        // Shorter names = shorter/smaller particles, Longer names = wider/bigger particles
        const nameBasedSizeFactor = Math.max(0.3, Math.min(3.0, this.nameLength / 6)); // Scale 0.3-3.0 based on name length
        
        // Create varied size distribution
        let baseRadius;
        const sizeRoll = Math.random();
        if (sizeRoll > 0.95) {
            baseRadius = (25 + Math.random() * 35) * nameBasedSizeFactor; // Large particles
        } else if (sizeRoll > 0.8) {
            baseRadius = (18 + Math.random() * 25) * nameBasedSizeFactor; // Medium particles
        } else {
            baseRadius = (10 + Math.random() * 15) * nameBasedSizeFactor; // Small particles
        }
        
        // Name length affects movement patterns and amplitude
        const nameAmplitude = Math.max(0.8, Math.min(1.5, this.nameLength / 8)); // Amplitude multiplier
        const nameFrequencyMultiplier = Math.max(0.5, Math.min(2.0, this.nameLength / 6));
        const namePhaseComplexity = this.nameLength > 8 ? Math.PI * 4 : Math.PI * 2;
        
        return {
            x: x || Math.random() * this.canvas.width,
            y: y || Math.random() * this.canvas.height,
            radius: baseRadius,
            baseRadius: baseRadius,
            color: color,
            emotion: emotion,
            opacity: 0,
            targetOpacity: sizeRoll > 0.8 ? 0.6 : 0.8, // Lower opacity for larger bubbles
            age: 0,
            lifespan: 8 + Math.random() * 15,
            fadeOutStart: 6 + Math.random() * 12,
            fadeInDuration: 0.5,
            timeOffset: Math.random() * 1000,
            phase: Math.random() * namePhaseComplexity, // Name length affects phase complexity
            frequency: (0.2 + Math.random() * 0.3) * nameFrequencyMultiplier, // Name length affects frequency
            amplitude: (0.2 + Math.random() * 0.3) * nameAmplitude, // Name length affects amplitude
            speed: (0.5 + Math.random() * 1.0) * emotionProps.particleSpeed * (sizeRoll > 0.8 ? 0.7 : 1), // Slower speed for larger bubbles
            noiseOffset: {
                x: Math.random() * 1000,
                y: Math.random() * 1000
            },
            // Additional properties for enhanced emotion behaviors
            nameAmplitude: nameAmplitude,
            spiralTightness: Math.max(0.5, Math.min(2.0, this.nameLength / 12)), // Longer names = tighter spirals
            
            // New properties for advanced emotion behaviors
            explosionVector: { // For anger - explosion direction
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            explosionSpeed: 0, // For anger - explosion intensity
            shakeMagnitude: 0, // For fear - shake intensity
            shakePhase: Math.random() * Math.PI * 2, // For fear - shake timing
            loveTarget: null, // For love - merging target
            loveMergeProgress: 0, // For love - merging animation
            disgustOffset: { // For disgust - uncomfortable movement
                x: Math.random() * 100,
                y: Math.random() * 100
            },
            joyExpansionPhase: Math.random() * Math.PI * 2, // For joy - expansion rhythm
            originalRadius: baseRadius // Store original radius for joy expansion
        };
    }

    getWeightedRandomEmotion() {
        const weights = this.emotions;
        const total = Object.values(weights).reduce((s, v) => s + v, 0);

        if (total === 0) return 'neutral';

        let r = Math.random() * total;
        for (const key of Object.keys(weights)) {
            r -= weights[key];
            if (r <= 0) return key;
        }
        return 'neutral';
    }

    getColorForEmotion(emotion) {
        const palette = emotion && this.emotionalColors[emotion]
            ? this.emotionalColors[emotion]
            : this.neutralColors;

        const c = palette[Math.floor(Math.random() * palette.length)];
        return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
    }

    initializeParticles() {
        // Base particle count
        const baseParticleCount = 20;
        
        // Message length (word count) affects particle count - more words = more particles
        const messageBasedParticles = Math.floor(this.wordCount * 2.5); // Each word adds ~2.5 particles
        
        // Calculate total particle count based primarily on message length
        const particleCount = Math.min(150, baseParticleCount + messageBasedParticles); // Cap at 150 particles
        
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
        // --- Restore per-particle dominant emotion mapping ---
        const originalEmotions = this.emotions;
        const particleEmotions = { joy: 0, sadness: 0, anger: 0, fear: 0, disgust: 0, love: 0 };
        if (particle.emotion && particleEmotions.hasOwnProperty(particle.emotion)) {
            // Use the global intensity value for this particle's dominant emotion
            particleEmotions[particle.emotion] = originalEmotions[particle.emotion] || 1;
        }
        this.emotions = particleEmotions;

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

        // Calculate emotion blending weights for smooth transitions
        const totalEmotionIntensity = Object.values(this.emotions).reduce((sum, val) => sum + val, 0);
        const neutralWeight = Math.max(0, 1 - totalEmotionIntensity);

        // NEUTRAL BEHAVIOR - Slow floating (base behavior)
        if (neutralWeight > 0 || totalEmotionIntensity === 0) {
            const neutralDrift = 0.3;
            dx += Math.sin(time * 0.5 + particle.phase) * neutralDrift * neutralWeight;
            dy += Math.cos(time * 0.3 + particle.phase) * neutralDrift * 0.5 * neutralWeight;
        }

        // JOY - Particles expand in all directions without changing size
        if (this.emotions.joy > 0) {
            const joyIntensity = this.emotions.joy;
            
            // True expansion movement - particles move outward from center in all directions
            // Use the joyExpansionPhase as the fixed direction for this particle
            const expansionX = Math.cos(particle.joyExpansionPhase) * joyIntensity * 1.5;
            const expansionY = Math.sin(particle.joyExpansionPhase) * joyIntensity * 1.5;
            
            dx += expansionX;
            dy += expansionY;
            
            // Add some gentle upward celebration movement (only for joy, not sadness)
            if (this.emotions.sadness === 0) {
                dy -= 0.5 * joyIntensity;
            }
            
            // Add slight randomness for more natural movement
            dx += Math.sin(time * 2 + particle.phase) * 0.8 * joyIntensity;
        }

        // SADNESS - Particles fall down like rain (ALWAYS DOWNWARD)
        if (this.emotions.sadness > 0) {
            const sadnessIntensity = this.emotions.sadness;
            
            // STRONG downward movement like rain - POSITIVE dy moves DOWN
            const rainSpeed = 3.0 * sadnessIntensity; // Stronger downward force
            dy += rainSpeed; // This moves particles DOWN
            
            // Additional gravity-like effect for sadness
            dy += 1.5 * sadnessIntensity; // Extra downward force
            
            // Slight horizontal drift like wind
            dx += Math.sin(time * 0.8 + particle.phase) * 0.6 * sadnessIntensity;
            
            // Name length affects how heavy the "rain" feels
            if (particle.nameAmplitude > 1.2) {
                dy += particle.nameAmplitude * sadnessIntensity * 0.8; // More downward
            }
            
            // Override any upward movement for sadness particles
            if (dy < 0) {
                dy = Math.abs(dy); // Convert any upward movement to downward
        }

            // After computing sadness movement, reverse direction as requested
            dx *= -1;
            dy *= -1;
        }

        // ANGER - Particles explode rapidly in all directions
        if (this.emotions.anger > 0) {
            const angerIntensity = this.emotions.anger;
            
            // Set constant explosion speed (not increasing over time)
            if (particle.explosionSpeed === 0) {
                particle.explosionSpeed = 3.5 + Math.random() * 2; // Constant fast speed
            }
            
            // Explosive movement in the particle's explosion vector with constant speed
            const explosionForce = particle.explosionSpeed * angerIntensity;
            dx += particle.explosionVector.x * explosionForce;
            dy += particle.explosionVector.y * explosionForce;
            
            // Add moderate chaotic jitter (not too much)
            const jitterX = (Math.random() - 0.5) * 3 * angerIntensity;
            const jitterY = (Math.random() - 0.5) * 3 * angerIntensity;
            dx += jitterX;
            dy += jitterY;
        }

        // FEAR - Particles shake and wiggle side to side (terrified)
        if (this.emotions.fear > 0) {
            const fearIntensity = this.emotions.fear;
            
            // Update shake magnitude
            particle.shakeMagnitude = 8 * fearIntensity;
            
            // High-frequency shaking movement
            const fearFreq = 25; // Very fast shaking
            const fearShakeX = Math.sin(time * fearFreq + particle.shakePhase) * particle.shakeMagnitude;
            const fearShakeY = Math.sin(time * (fearFreq * 0.7) + particle.shakePhase * 1.3) * particle.shakeMagnitude * 0.6;
            
            dx += fearShakeX;
            dy += fearShakeY;
            
            // Additional jittery movement
            const jitterX = (Math.random() - 0.5) * 4 * fearIntensity;
            const jitterY = (Math.random() - 0.5) * 3 * fearIntensity;
            dx += jitterX;
            dy += jitterY;
            
            // Name length amplifies fear (longer names = more trembling)
            if (particle.nameAmplitude > 1.1) {
                const fearAmplification = particle.nameAmplitude * fearIntensity;
                dx += (Math.random() - 0.5) * fearAmplification * 4;
                dy += (Math.random() - 0.5) * fearAmplification * 3;
            }
        }

        // DISGUST - Particles are not stable, moving uncomfortably
        if (this.emotions.disgust > 0) {
            const disgustIntensity = this.emotions.disgust;
            
            // Uncomfortable, irregular movement patterns
            const disgustWave1 = Math.sin(time * 4.3 + particle.disgustOffset.x) * 3;
            const disgustWave2 = Math.cos(time * 3.7 + particle.disgustOffset.y) * 2.5;
            const disgustWave3 = Math.sin(time * 5.1 + particle.phase) * 1.8;
            
            dx += (disgustWave1 + disgustWave3) * disgustIntensity;
            dy += (disgustWave2 + disgustWave1 * 0.6) * disgustIntensity;
            
            // Add uncomfortable jitter
            const uncomfortableJitter = Math.sin(time * 8 + particle.disgustOffset.x) * 2 * disgustIntensity;
            dx += uncomfortableJitter;
            dy += uncomfortableJitter * 0.8;
            
            // Spiral-like discomfort if tight spirals from name length
            if (particle.spiralTightness > 1.0) {
                const disgustSpiral = Math.sin(time * particle.spiralTightness * 3) * disgustIntensity * 3;
                dx += disgustSpiral;
                dy += Math.cos(time * particle.spiralTightness * 2.5) * disgustIntensity * 2.5;
            }
        }

        // LOVE - Particles float upward and swing side to side, some merge
        if (this.emotions.love > 0) {
            const loveIntensity = this.emotions.love;
            
            // Gentle upward floating
            dy -= 1.2 * loveIntensity;
            
            // Sweet side-to-side swinging like being in love
            const loveSwing = Math.sin(time * 1.5 + particle.phase) * 4 * loveIntensity;
            dx += loveSwing;
            
            // Additional gentle swaying
            const gentleSway = Math.cos(time * 0.8 + particle.phase * 2) * 2 * loveIntensity;
            dx += gentleSway;
            dy += Math.sin(time * 1.2 + particle.phase) * 1.5 * loveIntensity;
            
            // Particle merging behavior (find nearby particles to merge with)
            if (Math.random() < 0.01 * loveIntensity) { // Low chance to prevent overwhelming merging
                const nearbyParticles = this.particles.filter(other => {
                    if (other === particle) return false;
                    const dist = Math.sqrt((other.x - particle.x) ** 2 + (other.y - particle.y) ** 2);
                    return dist < 60 && other.emotion === 'love';
                });
                
                if (nearbyParticles.length > 0 && !particle.loveTarget) {
                    particle.loveTarget = nearbyParticles[0];
                    particle.loveMergeProgress = 0;
                }
            }
            
            // If merging, move toward target
            if (particle.loveTarget && particle.loveTarget.age < particle.loveTarget.lifespan) {
                const targetDx = particle.loveTarget.x - particle.x;
                const targetDy = particle.loveTarget.y - particle.y;
                const mergeForce = 0.02 * loveIntensity;
                
                dx += targetDx * mergeForce;
                dy += targetDy * mergeForce;
                
                particle.loveMergeProgress += dt;
            } else {
                particle.loveTarget = null;
                particle.loveMergeProgress = 0;
            }
        }

        // Apply movement with smooth blending
        particle.x += dx * dt * 60;
        particle.y += dy * dt * 60;

        // Wrap around edges
        if (particle.x < -particle.radius) particle.x = this.canvas.width + particle.radius;
        if (particle.x > this.canvas.width + particle.radius) particle.x = -particle.radius;
        if (particle.y < -particle.radius) particle.y = this.canvas.height + particle.radius;
        if (particle.y > this.canvas.height + particle.radius) particle.y = -particle.radius;

        // Update radius with emotional effects (joy expansion handled differently)
        const radiusWobble = Math.sin(time * 4 + particle.phase) * 1.5;
        
        // Joy doesn't change size, but other emotions might have subtle size effects
        if (this.emotions.joy > 0) {
            // Joy keeps original size but can have gentle pulsing
            const joyPulse = Math.sin(time * 3 + particle.joyExpansionPhase) * 1 * this.emotions.joy;
            particle.radius = particle.originalRadius + joyPulse;
        } else {
            particle.radius = particle.baseRadius + radiusWobble;
        }

        const alive = particle.age < particle.lifespan;

        // Restore global emotions for next particle
        this.emotions = originalEmotions;

        return alive;
    }

    getDominantEmotion() {
        const emotions = [
            { name: 'joy', value: this.emotions.joy },
            { name: 'sadness', value: this.emotions.sadness },
            { name: 'anger', value: this.emotions.anger },
            { name: 'fear', value: this.emotions.fear },
            { name: 'disgust', value: this.emotions.disgust },
            { name: 'love', value: this.emotions.love }
        ];
        
        return emotions.reduce((prev, current) => 
            (current.value > prev.value) ? current : prev
        );
    }

    getEmotionalBackground() {
        // Define neutral background
        const neutral = {
            start: { r: 50, g: 50, b: 50 },
            middle: { r: 60, g: 60, b: 60 },
            end: { r: 50, g: 50, b: 50 }
        };
        
        // Define emotional background colors
        const emotionalBackgrounds = {
            joy: {
                start: { r: 135, g: 206, b: 235 },      // Sky blue
                middle: { r: 176, g: 226, b: 255 },     // Light sky blue
                end: { r: 135, g: 206, b: 235 }         // Sky blue
            },
            sadness: {
                start: { r: 0, g: 15, b: 35 },      // Dark blue
                middle: { r: 5, g: 20, b: 40 },     // Navy blue
                end: { r: 0, g: 10, b: 30 }         // Deep blue
            },
            anger: {
                start: { r: 90, g: 10, b: 10 },       // Deeper red
                middle: { r: 120, g: 20, b: 20 },     // Medium red
                end: { r: 80, g: 15, b: 15 }         // Dark red
            },
            fear: {
                start: { r: 20, g: 0, b: 30 },      // Dark purple
                middle: { r: 25, g: 5, b: 35 },     // Deep violet
                end: { r: 15, g: 0, b: 25 }         // Dark indigo
            },
            disgust: {
                start: { r: 15, g: 25, b: 0 },      // Dark olive
                middle: { r: 20, g: 30, b: 5 },     // Deep moss
                end: { r: 10, g: 20, b: 0 }         // Dark green
            },
            love: {
                start: { r: 255, g: 182, b: 193 },   // Light pink
                middle: { r: 255, g: 105, b: 180 },  // Hot pink
                end: { r: 255, g: 182, b: 193 }
            }
        };

        // Helper function to blend two colors
        const blendColor = (color1, color2, intensity) => {
            return {
                r: Math.round(color1.r + (color2.r - color1.r) * intensity),
                g: Math.round(color1.g + (color2.g - color1.g) * intensity),
                b: Math.round(color1.b + (color2.b - color1.b) * intensity)
            };
        };

        // Start with neutral background
        let blendedBackground = {
            start: { ...neutral.start },
            middle: { ...neutral.middle },
            end: { ...neutral.end }
        };

        // Blend each emotion based on its intensity
        Object.keys(this.emotions).forEach(emotion => {
            const intensity = this.emotions[emotion];
            if (intensity > 0 && emotionalBackgrounds[emotion]) {
                const emotionBg = emotionalBackgrounds[emotion];
                
                // Blend each gradient stop
                blendedBackground.start = blendColor(blendedBackground.start, emotionBg.start, intensity);
                blendedBackground.middle = blendColor(blendedBackground.middle, emotionBg.middle, intensity);
                blendedBackground.end = blendColor(blendedBackground.end, emotionBg.end, intensity);
            }
        });

        // Convert back to rgba strings
        return {
            start: `rgba(${blendedBackground.start.r}, ${blendedBackground.start.g}, ${blendedBackground.start.b}, 1)`,
            middle: `rgba(${blendedBackground.middle.r}, ${blendedBackground.middle.g}, ${blendedBackground.middle.b}, 1)`,
            end: `rgba(${blendedBackground.end.r}, ${blendedBackground.end.g}, ${blendedBackground.end.b}, 1)`
        };
    }

    animate(currentTime) {
        if (!this.animationRunning) return;
        
        if (!this.lastTime) {
            this.lastTime = currentTime;
        }
        
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.time = currentTime;
        
        // Clear both canvases
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Get emotional background colors
        const bgColors = this.getEmotionalBackground();
        
        // Create emotion-based gradient background on offscreen canvas
        const gradient = this.offscreenCtx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, bgColors.start);
        gradient.addColorStop(0.5, bgColors.middle);
        gradient.addColorStop(1, bgColors.end);
        
        this.offscreenCtx.fillStyle = gradient;
        this.offscreenCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
                        case 'love':
                            r = color + 10;
                            b = color + 10;
                            break;
                    }
                }
                
                this.offscreenCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${noiseOpacity})`;
                this.offscreenCtx.fillRect(x, y, 4, 4);
            }
        }

        // Add slight fade effect with emotional tint
        this.offscreenCtx.fillStyle = bgColors.start.replace('1)', '0.1)');
        this.offscreenCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and filter particles
        this.particles = this.particles.filter(particle => this.updateParticle(particle, deltaTime));

        // Calculate target particle count based on message length (same logic as initializeParticles)
        const baseParticleCount = 20;
        const messageBasedParticles = Math.floor(this.wordCount * 2.5);
        const targetParticleCount = Math.min(150, baseParticleCount + messageBasedParticles);

        // Add new particles if needed to maintain message-length based count
        while (this.particles.length < targetParticleCount) {
            this.particles.push(this.createParticle());
        }

        // Draw particles
        this.drawParticles();
        
        // Copy to main canvas first
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        
        // Apply WebGL displacement effect every frame for smoothest possible result
        this.frameCount++;
        if (this.webglDisplacement && this.webglDisplacement.initialized) {
            const scale = this.displacementScale || 50;
            this.webglDisplacement.apply(this.canvas, scale);
        }
        
        // Update animated noise texture periodically for realistic film grain effect
        this.noiseFrameCounter++;
        if (this.noiseFrameCounter >= this.noiseAnimationSpeed) {
            this.updateNoiseOverlay();
            this.noiseFrameCounter = 0;
        }
        
        // Request next frame
        requestAnimationFrame(this.animate);
    }

    updateNoiseOverlay() {
        if (!this.noiseOverlayCanvas) {
            return;
        }
        
        // Clear the overlay canvas
        this.noiseOverlayCtx.clearRect(0, 0, this.noiseOverlayCanvas.width, this.noiseOverlayCanvas.height);
        
        // Generate high-quality film grain noise
        this.generateFilmGrainNoise();
    }

    generateFilmGrainNoise() {
        // Ensure overlay canvas matches main canvas dimensions
        this.noiseOverlayCanvas.width = this.canvas.width;
        this.noiseOverlayCanvas.height = this.canvas.height;
        
        const width = this.noiseOverlayCanvas.width;
        const height = this.noiseOverlayCanvas.height;
        
        // Clear the canvas first
        this.noiseOverlayCtx.clearRect(0, 0, width, height);
        
        // Generate smaller, more realistic grain particles
        const grainDensity = 0.35; // 35% coverage for more visible grain
        const grainSize = 1; // Single pixel grain for fine detail
        
        // Create many small grain particles across the canvas
        for (let x = 0; x < width; x += grainSize) {
            for (let y = 0; y < height; y += grainSize) {
                if (Math.random() < grainDensity) {
                    // Generate random grain intensity
                    const noise = Math.random();
                    let grainValue;
                    
                    if (noise < 0.2) {
                        // 20% darker grain particles
                        grainValue = Math.floor(noise * 60);
                    } else if (noise < 0.35) {
                        // 15% brighter grain particles
                        grainValue = Math.floor(190 + noise * 65);
                    } else {
                        // 65% subtle medium grain
                        grainValue = Math.floor(115 + (noise - 0.5) * 30);
                    }
                    
                    // Draw the grain particle
                    this.noiseOverlayCtx.fillStyle = `rgb(${grainValue}, ${grainValue}, ${grainValue})`;
                    this.noiseOverlayCtx.fillRect(x, y, grainSize, grainSize);
                }
            }
        }
    }

    drawParticles() {
        this.particles.forEach(particle => {
            // Draw connecting lines for love particles that are merging
            if (particle.loveTarget && particle.loveTarget.age < particle.loveTarget.lifespan && this.emotions.love > 0) {
                this.offscreenCtx.save();
                this.offscreenCtx.strokeStyle = `rgba(255, 105, 180, ${0.3 * this.emotions.love * particle.opacity})`;
                this.offscreenCtx.lineWidth = 1 + particle.loveMergeProgress * 2;
                this.offscreenCtx.beginPath();
                this.offscreenCtx.moveTo(particle.x, particle.y);
                this.offscreenCtx.lineTo(particle.loveTarget.x, particle.loveTarget.y);
                this.offscreenCtx.stroke();
                this.offscreenCtx.restore();
            }
            
            // Draw the main particle
            this.offscreenCtx.beginPath();
            this.offscreenCtx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.offscreenCtx.fillStyle = particle.color;
            this.offscreenCtx.globalAlpha = particle.opacity;
            this.offscreenCtx.fill();
            
            // Add special effects for different emotions
            if (particle.emotion === 'joy' && this.emotions.joy > 0) {
                // Joy particles get a subtle glow effect
                this.offscreenCtx.shadowColor = particle.color;
                this.offscreenCtx.shadowBlur = 5 * this.emotions.joy;
                this.offscreenCtx.fill();
                this.offscreenCtx.shadowBlur = 0;
            }
            
            if (particle.emotion === 'anger' && this.emotions.anger > 0 && particle.explosionSpeed > 0) {
                // Anger particles get trailing effect
                this.offscreenCtx.save();
                this.offscreenCtx.globalAlpha = particle.opacity * 0.3;
                this.offscreenCtx.fillStyle = 'rgba(255, 69, 0, 0.6)';
                this.offscreenCtx.beginPath();
                this.offscreenCtx.arc(particle.x - particle.explosionVector.x * 5, 
                                    particle.y - particle.explosionVector.y * 5, 
                                    particle.radius * 0.7, 0, Math.PI * 2);
                this.offscreenCtx.fill();
                this.offscreenCtx.restore();
            }
            
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
            this.displacementScale = Math.max(2, Math.min(15, strength + 2));
        }
    }

    start() {
        if (!this.animationRunning) {
            this.animationRunning = true;
            this.initializeParticles();
            requestAnimationFrame(this.animate);
        }
    }

    stop() {
        this.animationRunning = false;
    }

    setParameters(params) {
        this.recordingLength = params.recordingLength || 30;
        this.wordCount = params.wordCount || 10;
        this.nameLength = params.nameLength || 8;
        
        // Set emotions
        this.emotions = params.emotions || {
            joy: 0,
            sadness: 0,
            anger: 0,
            fear: 0,
            disgust: 0,
            love: 0
        };
    }
}

// Export for use in other files
window.ArtGenerator = ArtGenerator; 