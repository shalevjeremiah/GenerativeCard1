class WebGLDisplacementEffect {
    constructor(canvas, displacementImageUrl) {
        this.canvas = canvas;
        this.displacementImageUrl = displacementImageUrl;
        this.initialized = false;
        
        // Create WebGL context
        this.gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }) ||
                   canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
        if (!this.gl) {
            return;
        }
        
        this.init().catch(() => {
            this.createProceduralDisplacement();
        });
    }
    
    async init() {
        const gl = this.gl;
        
        // Vertex shader - creates a full-screen quad
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;
        
        // Fragment shader - applies displacement
        const fragmentShaderSource = `
            precision mediump float;
            
            uniform sampler2D u_image;
            uniform sampler2D u_displacement;
            uniform float u_displacementScale;
            uniform vec2 u_resolution;
            
            varying vec2 v_texCoord;
            
            void main() {
                // Sample the displacement map
                vec4 displacement = texture2D(u_displacement, v_texCoord);
                
                // Convert displacement to offset (-0.5 to 0.5 range)
                vec2 offset = (displacement.rg - 0.5) * u_displacementScale / u_resolution;
                
                // Sample the original image with displacement
                vec2 displacedCoord = v_texCoord + offset;
                
                // Clamp coordinates to prevent sampling outside texture
                displacedCoord = clamp(displacedCoord, 0.0, 1.0);
                
                gl_FragColor = texture2D(u_image, displacedCoord);
            }
        `;
        
        // Create shaders
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        if (!this.program) {
            return;
        }
        
        // Get attribute and uniform locations
        this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
        this.texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');
        this.imageLocation = gl.getUniformLocation(this.program, 'u_image');
        this.displacementLocation = gl.getUniformLocation(this.program, 'u_displacement');
        this.displacementScaleLocation = gl.getUniformLocation(this.program, 'u_displacementScale');
        this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
        
        // Create buffers
        this.setupBuffers();
        
        // Create textures
        this.imageTexture = this.createTexture();
        this.displacementTexture = this.createTexture();
        
        // Load displacement image
        try {
            await this.loadDisplacementImage();
            this.initialized = true;
        } catch (error) {
            this.createProceduralDisplacement();
            this.initialized = true;
        }
    }
    
    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    createProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
        
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    setupBuffers() {
        const gl = this.gl;
        
        // Create a full-screen quad
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1,
        ]);
        
        const texCoords = new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            1, 1,
        ]);
        
        // Position buffer
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        
        // Texture coordinate buffer
        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    }
    
    createTexture() {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        return texture;
    }
    
    async loadDisplacementImage() {
        // Check if we're running on file:// protocol
        if (window.location.protocol === 'file:') {
            throw new Error('File protocol detected - using procedural displacement');
        }
        
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            
            image.onload = () => {
                try {
                    const gl = this.gl;
                    gl.bindTexture(gl.TEXTURE_2D, this.displacementTexture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            
            image.onerror = (error) => {
                reject(new Error('Image load failed: ' + this.displacementImageUrl));
            };
            
            image.src = this.displacementImageUrl;
        });
    }
    
    createProceduralDisplacement() {
        const gl = this.gl;
        const width = 512;  // Higher resolution for better quality
        const height = 512;
        
        // Create a realistic glass-like displacement map
        const data = new Uint8Array(width * height * 4);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                // Normalized coordinates
                const fx = x / width;
                const fy = y / height;
                
                // Create realistic glass-like displacement with multiple techniques:
                
                // 1. Large wave patterns (like glass bubbles/imperfections)
                const wave1 = Math.sin(fx * Math.PI * 3.2) * Math.cos(fy * Math.PI * 2.8) * 0.4;
                const wave2 = Math.sin(fx * Math.PI * 5.1) * Math.cos(fy * Math.PI * 4.3) * 0.3;
                
                // 2. Medium frequency noise (glass texture)
                const noise1 = Math.sin(fx * Math.PI * 12) * Math.cos(fy * Math.PI * 15) * 0.2;
                const noise2 = Math.sin(fx * Math.PI * 18) * Math.cos(fy * Math.PI * 21) * 0.15;
                
                // 3. High frequency details (fine glass texture)
                const detail1 = Math.sin(fx * Math.PI * 35) * Math.cos(fy * Math.PI * 42) * 0.08;
                const detail2 = Math.sin(fx * Math.PI * 55) * Math.cos(fy * Math.PI * 63) * 0.05;
                
                // 4. Radial distortion (like curved glass)
                const centerX = fx - 0.5;
                const centerY = fy - 0.5;
                const distance = Math.sqrt(centerX * centerX + centerY * centerY);
                const radialEffect = Math.sin(distance * Math.PI * 4) * 0.1;
                
                // 5. Diagonal streaks (like glass manufacturing lines)
                const diagonal = Math.sin((fx + fy) * Math.PI * 6) * 0.1;
                
                // Combine all effects
                const horizontalDisplacement = wave1 + noise1 + detail1 + radialEffect * centerX + diagonal;
                const verticalDisplacement = wave2 + noise2 + detail2 + radialEffect * centerY - diagonal;
                
                // Normalize to 0-1 range and add some base offset for glass-like effect
                const hDisp = (horizontalDisplacement * 0.5 + 0.5) * 0.8 + 0.1;
                const vDisp = (verticalDisplacement * 0.5 + 0.5) * 0.8 + 0.1;
                
                // Map to 0-255 range
                const hValue = Math.floor(Math.max(0, Math.min(255, hDisp * 255)));
                const vValue = Math.floor(Math.max(0, Math.min(255, vDisp * 255)));
                
                data[i] = hValue;       // R - horizontal displacement
                data[i + 1] = vValue;   // G - vertical displacement  
                data[i + 2] = 128;      // B - neutral blue channel
                data[i + 3] = 255;      // A - fully opaque
            }
        }
        
        // Upload to GPU
        gl.bindTexture(gl.TEXTURE_2D, this.displacementTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        
    }
    
    apply(sourceCanvas, displacementScale = 15) {
        if (!this.initialized) {
            return;
        }
        
        const gl = this.gl;
        
        // Create a temporary canvas to capture the blurred version of the source
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = sourceCanvas.width;
        tempCanvas.height = sourceCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Check if the source canvas has blur applied
        const hasBlur = sourceCanvas.classList.contains('blur-enabled');
        const blurAmount = sourceCanvas.style.getPropertyValue('--blur-amount') || '0px';
        
        if (hasBlur && blurAmount !== '0px') {
            // Apply the same blur to our temporary canvas
            tempCtx.filter = `blur(${blurAmount})`;
        }
        
        // Draw the source canvas (with or without blur) to our temp canvas
        tempCtx.drawImage(sourceCanvas, 0, 0);
        
        // Update image texture with the processed canvas content
        gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);
        
        // Ensure displacement canvas matches source canvas exactly
        this.canvas.width = sourceCanvas.width;
        this.canvas.height = sourceCanvas.height;
        
        // Clear the canvas first to prevent overlay buildup
        gl.clearColor(0, 0, 0, 0); // Transparent clear
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Set up WebGL state with exact source dimensions
        gl.viewport(0, 0, sourceCanvas.width, sourceCanvas.height);
        gl.useProgram(this.program);
        
        // Bind textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
        gl.uniform1i(this.imageLocation, 0);
        
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.displacementTexture);
        gl.uniform1i(this.displacementLocation, 1);
        
        // Set uniforms
        gl.uniform1f(this.displacementScaleLocation, displacementScale);
        gl.uniform2f(this.resolutionLocation, sourceCanvas.width, sourceCanvas.height);
        
        // Set up attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
    }
    
    // New method to use a canvas as the displacement map
    applyCanvasAsDisplacement(sourceCanvas, displacementCanvas, displacementScale = 15) {
        if (!this.initialized) {
            return;
        }
        
        const gl = this.gl;
        
        // Create a temporary canvas to capture the blurred version of the source
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = sourceCanvas.width;
        tempCanvas.height = sourceCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Check if the source canvas has blur applied
        const hasBlur = sourceCanvas.classList.contains('blur-enabled');
        const blurAmount = sourceCanvas.style.getPropertyValue('--blur-amount') || '0px';
        
        if (hasBlur && blurAmount !== '0px') {
            // Apply the same blur to our temporary canvas
            tempCtx.filter = `blur(${blurAmount})`;
        }
        
        // Draw the source canvas (with or without blur) to our temp canvas
        tempCtx.drawImage(sourceCanvas, 0, 0);
        
        // Update image texture with the processed canvas content
        gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);
        
        // Update displacement texture with the equalizer canvas
        gl.bindTexture(gl.TEXTURE_2D, this.displacementTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, displacementCanvas);
        
        // Ensure displacement canvas matches source canvas exactly
        this.canvas.width = sourceCanvas.width;
        this.canvas.height = sourceCanvas.height;
        
        // Clear the canvas first to prevent overlay buildup
        gl.clearColor(0, 0, 0, 0); // Transparent clear
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Set up WebGL state with exact source dimensions
        gl.viewport(0, 0, sourceCanvas.width, sourceCanvas.height);
        gl.useProgram(this.program);
        
        // Bind textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
        gl.uniform1i(this.imageLocation, 0);
        
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.displacementTexture);
        gl.uniform1i(this.displacementLocation, 1);
        
        // Set uniforms
        gl.uniform1f(this.displacementScaleLocation, displacementScale);
        gl.uniform2f(this.resolutionLocation, sourceCanvas.width, sourceCanvas.height);
        
        // Set up attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

// Export for use
window.WebGLDisplacementEffect = WebGLDisplacementEffect; 