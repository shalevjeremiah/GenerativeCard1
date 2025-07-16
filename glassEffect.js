class GlassEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Create main glass effect container (multiply blend)
        this.glassContainer = document.createElement('div');
        this.glassContainer.style.position = 'absolute';
        this.glassContainer.style.top = '0';
        this.glassContainer.style.left = '0';
        this.glassContainer.style.width = `${this.canvas.width}px`;
        this.glassContainer.style.height = `${this.canvas.height}px`;
        this.glassContainer.style.zIndex = '2';
        this.glassContainer.style.pointerEvents = 'none';
        this.glassContainer.style.overflow = 'hidden';
        this.glassContainer.style.display = 'flex';
        this.glassContainer.style.alignItems = 'stretch';
        this.glassContainer.style.mixBlendMode = 'overlay';
        this.glassContainer.style.opacity = '0.85';
        
        // Create brightness layer (screen blend)
        this.brightnessContainer = document.createElement('div');
        Object.assign(this.brightnessContainer.style, {
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'stretch',
            mixBlendMode: 'soft-light',
            opacity: '0.4'
        });
        
        // Position the canvas container relatively if not already
        if (this.canvas.parentElement.style.position !== 'relative') {
            this.canvas.parentElement.style.position = 'relative';
        }
        
        // Make sure canvas is visible
        this.canvas.style.position = 'relative';
        this.canvas.style.zIndex = '1';
        
        this.canvas.parentElement.appendChild(this.glassContainer);
        this.canvas.parentElement.appendChild(this.brightnessContainer);
        
        // Create white overlay layer
        this.whiteOverlayContainer = document.createElement('div');
        Object.assign(this.whiteOverlayContainer.style, {
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'stretch',
            mixBlendMode: 'overlay',
            opacity: '1',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none',
            zIndex: '4'
        });
        
        // Add subtle gradient to white overlay
        const whiteOverlayGradient = document.createElement('div');
        Object.assign(whiteOverlayGradient.style, {
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)'
        });
        this.whiteOverlayContainer.appendChild(whiteOverlayGradient);
        this.glassContainer.appendChild(this.whiteOverlayContainer);
        
        // Create second white overlay layer
        this.secondWhiteOverlayContainer = document.createElement('div');
        Object.assign(this.secondWhiteOverlayContainer.style, {
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'stretch',
            mixBlendMode: 'overlay',
            opacity: '1',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
            zIndex: '5'
        });
        
        // Add subtle diagonal gradient to second white overlay
        const secondWhiteOverlayGradient = document.createElement('div');
        Object.assign(secondWhiteOverlayGradient.style, {
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(-45deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)'
        });
        this.secondWhiteOverlayContainer.appendChild(secondWhiteOverlayGradient);
        this.glassContainer.appendChild(this.secondWhiteOverlayContainer);
        
        // Create third white overlay layer
        this.thirdWhiteOverlayContainer = document.createElement('div');
        Object.assign(this.thirdWhiteOverlayContainer.style, {
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'stretch',
            mixBlendMode: 'overlay',
            opacity: '1',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            pointerEvents: 'none',
            zIndex: '6'
        });
        
        // Add diagonal gradient to third white overlay in opposite direction
        const thirdWhiteOverlayGradient = document.createElement('div');
        Object.assign(thirdWhiteOverlayGradient.style, {
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(45deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.5) 100%)'
        });
        this.thirdWhiteOverlayContainer.appendChild(thirdWhiteOverlayGradient);
        this.glassContainer.appendChild(this.thirdWhiteOverlayContainer);
        
        // Effect settings
        this.columnsNumber = 15;
        this.distortion = 2.5;
        this.columns = [];
        this.brightnessColumns = [];
        
        // Create temporary canvas for processing
        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');
        
        // Performance optimization: Create image data cache
        this.imageDataCache = new Map();
        this.lastUpdateTime = 0;
        this.updateInterval = 1000 / 30;
        
        // Initialize immediately
        this.init();
        
        // Add resize observer to handle canvas size changes
        this.resizeObserver = new ResizeObserver(() => {
            this.glassContainer.style.width = `${this.canvas.width}px`;
            this.glassContainer.style.height = `${this.canvas.height}px`;
            this.brightnessContainer.style.width = `${this.canvas.width}px`;
            this.brightnessContainer.style.height = `${this.canvas.height}px`;
            this.imageDataCache.clear();
            this.initColumns();
        });
        this.resizeObserver.observe(this.canvas);
    }
    
    init() {
        this.tempCanvas.width = this.canvas.width;
        this.tempCanvas.height = this.canvas.height;
        this.initColumns();
    }
    
    initColumns() {
        // Clear existing columns and cache
        this.columns.forEach(col => col.remove());
        this.brightnessColumns.forEach(col => col.remove());
        this.columns = [];
        this.brightnessColumns = [];
        this.imageDataCache.clear();
        
        // Calculate dimensions
        const totalWidth = this.canvas.width;
        const baseColumnWidth = Math.ceil(totalWidth / this.columnsNumber);
        const adjustedColumnWidth = Math.ceil(baseColumnWidth / this.distortion);
        
        // Create new columns
        for (let i = 0; i < this.columnsNumber; i++) {
            // Create main effect column
            const column = this.createColumn(i, baseColumnWidth, adjustedColumnWidth);
            this.glassContainer.appendChild(column);
            this.columns.push(column);
            
            // Create brightness column
            const brightnessColumn = this.createColumn(i, baseColumnWidth, adjustedColumnWidth, true);
            this.brightnessContainer.appendChild(brightnessColumn);
            this.brightnessColumns.push(brightnessColumn);
            
            // Set initial backgrounds
            this.setColumnProperties(column, i, baseColumnWidth);
            this.setColumnProperties(brightnessColumn, i, baseColumnWidth);
        }
    }
    
    createColumn(index, baseColumnWidth, adjustedColumnWidth, isBrightness = false) {
        const column = document.createElement('div');
        column.style.position = 'relative';
        column.style.height = '100%';
        column.style.width = `${adjustedColumnWidth}px`;
        column.style.flexGrow = '1';
        column.style.flexShrink = '0';
        column.style.backgroundSize = `${this.canvas.width}px ${this.canvas.height}px`;
        column.style.backgroundPosition = `-${index * baseColumnWidth}px 0`;
        column.style.backgroundRepeat = 'no-repeat';
        column.style.transform = `scaleX(${this.distortion})`;
        column.style.transformOrigin = 'left';
        column.style.backdropFilter = 'blur(0.3px)';
        column.style.backgroundColor = isBrightness ? 
            'rgba(255, 255, 255, 0.04)' : 
            'rgba(255, 255, 255, 0.03)';
        
        // Add glass effect overlay
        const gradientOpacity = isBrightness ? '0.08' : '0.1';
        column.innerHTML = `<div style="position: absolute; inset: 0; width: 100%; height: 100%; 
            background: linear-gradient(90deg, 
                rgba(255,255,255,${gradientOpacity}) 0%, 
                rgba(255,255,255,0) 45%,
                rgba(255,255,255,0) 55%,
                rgba(255,255,255,${gradientOpacity}) 100%);
            pointer-events: none;"></div>`;
        
        return column;
    }
    
    setColumnProperties(column, index, columnWidth) {
        const startX = columnWidth * index;
        const cacheKey = `${startX}-${columnWidth}`;
        
        let imagePortion;
        if (this.imageDataCache.has(cacheKey)) {
            imagePortion = this.imageDataCache.get(cacheKey);
        } else {
            imagePortion = this.getCanvasPortion(startX, columnWidth);
            this.imageDataCache.set(cacheKey, imagePortion);
        }
        
        column.style.backgroundImage = `url('${imagePortion}')`;
    }
    
    getCanvasPortion(startX, columnWidth) {
        const width = Math.min(columnWidth, this.canvas.width - startX);
        this.tempCanvas.width = width;
        this.tempCanvas.height = this.canvas.height;
        
        this.tempCtx.drawImage(
            this.canvas,
            startX, 0, width, this.canvas.height,
            0, 0, width, this.canvas.height
        );
        
        return this.tempCanvas.toDataURL();
    }
    
    update() {
        const currentTime = performance.now();
        if (currentTime - this.lastUpdateTime < this.updateInterval) {
            return; // Skip update if too soon
        }
        
        const columnWidth = Math.ceil(this.canvas.width / this.columnsNumber);
        this.columns.forEach((column, index) => {
            this.setColumnProperties(column, index, columnWidth);
        });
        
        this.lastUpdateTime = currentTime;
    }
    
    setDistortion(value) {
        this.distortion = value;
        this.imageDataCache.clear();
        this.initColumns();
    }
    
    destroy() {
        this.resizeObserver.disconnect();
        this.imageDataCache.clear();
        this.glassContainer.remove();
        this.brightnessContainer.remove();
        this.whiteOverlayContainer.remove();
        this.secondWhiteOverlayContainer.remove();
        this.thirdWhiteOverlayContainer.remove();
    }
}

class GlassDisplacementEffect {
    constructor(canvas, glassImageUrl = 'Glass.png', displacementScale = 8) {
        console.log('GlassDisplacementEffect constructor called with:', glassImageUrl, displacementScale);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.glassImageUrl = glassImageUrl;
        this.displacementScale = displacementScale;
        this.glassImg = new window.Image();
        this.glassImg.crossOrigin = 'anonymous';
        this.glassImgLoaded = false;
        this.glassImg.onload = () => {
            console.log('Glass.png loaded successfully:', this.glassImg.width, 'x', this.glassImg.height);
            this.glassImgLoaded = true;
        };
        this.glassImg.onerror = () => {
            console.error('Failed to load Glass.png from:', this.glassImageUrl);
        };
        console.log('Setting glass image source to:', glassImageUrl);
        this.glassImg.src = glassImageUrl;
    }

    apply() {
        if (!this.glassImgLoaded) {
            return;
        }
        // Apply displacement effect
        // Draw the current canvas to an offscreen buffer
        const w = this.canvas.width;
        const h = this.canvas.height;
        const src = this.ctx.getImageData(0, 0, w, h);
        const srcData = src.data;

        // Draw and get the glass image, scaled to fit canvas
        const glassCanvas = document.createElement('canvas');
        glassCanvas.width = w;
        glassCanvas.height = h;
        const glassCtx = glassCanvas.getContext('2d');
        glassCtx.drawImage(this.glassImg, 0, 0, w, h);
        const glassData = glassCtx.getImageData(0, 0, w, h).data;

        // Prepare output
        const out = this.ctx.createImageData(w, h);
        const outData = out.data;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                // Use glass image brightness as displacement
                const gidx = idx;
                const r = glassData[gidx];
                const g = glassData[gidx + 1];
                const b = glassData[gidx + 2];
                // Brightness 0..255
                const brightness = (r + g + b) / 3;
                // Map brightness to -scale/2..+scale/2
                const dx = Math.round(((brightness / 255) - 0.5) * this.displacementScale);
                const dy = Math.round(((brightness / 255) - 0.5) * this.displacementScale);
                // Source pixel (clamp to edge)
                let sx = Math.max(0, Math.min(w - 1, x + dx));
                let sy = Math.max(0, Math.min(h - 1, y + dy));
                const sidx = (sy * w + sx) * 4;
                outData[idx] = srcData[sidx];
                outData[idx + 1] = srcData[sidx + 1];
                outData[idx + 2] = srcData[sidx + 2];
                outData[idx + 3] = srcData[sidx + 3];
            }
        }
        // Draw output back to canvas
        this.ctx.putImageData(out, 0, 0);
    }
} 