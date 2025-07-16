(function () {
    window.addEventListener('load', () => {
        const artCanvas = document.getElementById('artCanvas');
        const displacementCanvas = document.getElementById('displacementCanvas');
        const eqCanvas = document.getElementById('equalizerCanvas');
        const hoverOverlay = document.getElementById('hoverOverlay');

        if (!artCanvas || !displacementCanvas || !eqCanvas) {
            console.warn('Equalizer integration: required canvases not found');
            return;
        }

        // Ensure equalizer canvas matches the art canvas dimensions
        eqCanvas.width = artCanvas.width;
        eqCanvas.height = artCanvas.height;

        // Add default blur to the art canvas for the glass effect
        artCanvas.classList.add('blur-enabled');
        if (!artCanvas.style.getPropertyValue('--blur-amount')) {
            artCanvas.style.setProperty('--blur-amount', '20px');
        }

        // Create and start the Chrome equalizer
        const chromeEqualizer = new ChromeEqualizer('equalizerCanvas');
        chromeEqualizer.singleMode = true; // use single wide equalizer for displacement
        chromeEqualizer.updateDimensions();
        chromeEqualizer.initializeBars();

        // Force bars to take full container height
        chromeEqualizer.minBarHeight = chromeEqualizer.equalizerHeight;
        chromeEqualizer.maxBarHeight = chromeEqualizer.equalizerHeight;
        chromeEqualizer.bars.forEach(bar => {
            bar.height = chromeEqualizer.equalizerHeight;
            bar.targetHeight = chromeEqualizer.equalizerHeight;
        });

        // Patch updateAudioData so height stays constant
        const originalUpdateAudioData = chromeEqualizer.updateAudioData.bind(chromeEqualizer);
        chromeEqualizer.updateAudioData = function() {
            originalUpdateAudioData(); // keep internal timing / recording logic
            this.bars.forEach(bar => {
                bar.height = this.equalizerHeight;
                bar.targetHeight = this.equalizerHeight;
            });
        };

        chromeEqualizer.start();

        // If a hover overlay is present, forward its mouse events to the equalizer
        if (hoverOverlay) {
            hoverOverlay.addEventListener('mousemove', (e) => {
                const rect = hoverOverlay.getBoundingClientRect();
                chromeEqualizer.mouseX = (e.clientX - rect.left) * (eqCanvas.width / rect.width);
                chromeEqualizer.mouseY = (e.clientY - rect.top) * (eqCanvas.height / rect.height);
                chromeEqualizer.isMouseOver = true;
            });

            ['mouseleave', 'mouseenter'].forEach(evt => {
                hoverOverlay.addEventListener(evt, () => {
                    chromeEqualizer.isMouseOver = evt === 'mouseenter';
                    if (!chromeEqualizer.isMouseOver) {
                        chromeEqualizer.mouseX = -1;
                        chromeEqualizer.mouseY = -1;
                    }
                });
            });
        }

        // Wait for artGenerator and WebGL displacement to be ready
        function startDisplacementLoop() {
            if (window.artGenerator &&
                window.artGenerator.webglDisplacement &&
                window.artGenerator.webglDisplacement.initialized) {

                const gl = displacementCanvas.getContext('webgl');
                const intensity = 75;

                function update() {
                    // Clear displacement canvas
                    if (gl) {
                        gl.clearColor(0, 0, 0, 0);
                        gl.clear(gl.COLOR_BUFFER_BIT);
                    }

                    // Apply equalizer canvas as the displacement map
                    window.artGenerator.webglDisplacement.applyCanvasAsDisplacement(
                        window.artGenerator.canvas,
                        chromeEqualizer.canvas,
                        intensity
                    );

                    requestAnimationFrame(update);
                }

                update();
            } else {
                // Retry after a short delay until everything is ready
                setTimeout(startDisplacementLoop, 150);
            }
        }

        startDisplacementLoop();
    });
})(); 