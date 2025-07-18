// tokenManager.js - Centralized API Token Management
// This file manages Hugging Face API tokens securely using localStorage

class TokenManager {
    constructor() {
        this.storageKey = 'hf_api_token';
        this.token = null;
        this.initializeToken();
    }

    // Initialize token from localStorage or show modal
    initializeToken() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored && this.isValidTokenFormat(stored)) {
            this.token = stored;
            this.hideModal();
        } else {
            this.showModal();
        }
    }

    // Validate token format (starts with hf_ and has reasonable length)
    isValidTokenFormat(token) {
        return token && 
               typeof token === 'string' && 
               token.startsWith('hf_') && 
               token.length >= 30 && 
               token.length <= 100;
    }

    // Get current token
    getToken() {
        return this.token;
    }

    // Set and store new token
    setToken(newToken) {
        if (this.isValidTokenFormat(newToken)) {
            this.token = newToken;
            localStorage.setItem(this.storageKey, newToken);
            return true;
        }
        return false;
    }

    // Clear stored token
    clearToken() {
        this.token = null;
        localStorage.removeItem(this.storageKey);
        this.showModal();
    }

    // Show token input modal
    showModal() {
        const modal = document.getElementById('tokenModal');
        if (modal) {
            modal.style.display = 'flex';
            this.setupModalEvents();
        }
    }

    // Hide token input modal
    hideModal() {
        const modal = document.getElementById('tokenModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Setup modal event listeners
    setupModalEvents() {
        const submitBtn = document.getElementById('tokenSubmit');
        const tokenInput = document.getElementById('tokenInput');
        const errorDiv = document.getElementById('tokenError');

        // Clear previous event listeners
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

        // Submit button click
        newSubmitBtn.addEventListener('click', () => {
            const inputToken = tokenInput.value.trim();
            this.handleTokenSubmit(inputToken, errorDiv);
        });

        // Initialize LOGIN button hover effect after modal is shown
        // Use multiple attempts with different delays to ensure it works
        setTimeout(() => initializeLoginButtonHover(), 50);
        setTimeout(() => initializeLoginButtonHover(), 200);
        setTimeout(() => initializeLoginButtonHover(), 500);
        
        // Initialize token title hover effect
        setTimeout(() => initializeTokenTitleHover(), 50);
        setTimeout(() => initializeTokenTitleHover(), 200);
        setTimeout(() => initializeTokenTitleHover(), 500);

        // Enter key press
        tokenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const inputToken = tokenInput.value.trim();
                this.handleTokenSubmit(inputToken, errorDiv);
            }
        });

        // Input validation on typing
        tokenInput.addEventListener('input', () => {
            errorDiv.style.display = 'none';
            if (tokenInput.value.trim()) {
                newSubmitBtn.disabled = false;
            } else {
                newSubmitBtn.disabled = true;
            }
        });

        // Focus on input
        setTimeout(() => tokenInput.focus(), 100);
    }

    // Handle token submission
    async handleTokenSubmit(inputToken, errorDiv) {
        if (!inputToken) {
            this.showError('Please enter an API token', errorDiv);
            return;
        }

        if (!this.isValidTokenFormat(inputToken)) {
            this.showError('Invalid token format. Token should start with "hf_" and be 30-100 characters long.', errorDiv);
            return;
        }

        // Show loading state
        const submitBtn = document.getElementById('tokenSubmit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Validating...';
        submitBtn.disabled = true;

        // Test the token with Hugging Face API
        const isValid = await this.validateTokenWithAPI(inputToken);
        
        if (isValid) {
            this.setToken(inputToken);
            this.hideModal();
            
            // Refresh the page to reinitialize with new token
            window.location.reload();
        } else {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            this.showError('Invalid token or API error. Please check your token and try again.', errorDiv);
        }
    }

    // Validate token by making a test API call
    async validateTokenWithAPI(token) {
        try {
            const response = await fetch('https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: 'test'
                }),
            });

            // Check if response is successful or if it's a model loading response
            return response.ok || response.status === 503; // 503 means model is loading, which is also valid
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    // Show error message
    showError(message, errorDiv) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    // Add settings button to manually change token
    addSettingsButton() {
        // Only add if not already present
        if (document.getElementById('tokenSettingsBtn')) return;

        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'tokenSettingsBtn';
        settingsBtn.innerHTML = '';
        settingsBtn.title = 'Change API Token';
        settingsBtn.style.cssText = `
            position: fixed;
            bottom: 50px;
            right: 340px;
            background: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            cursor: pointer;
            mix-blend-mode: overlay;
            z-index: 1000;
            transition: all 0.3s ease;
        `;

        // Create separate icon element
        const iconElement = document.createElement('img');
        iconElement.src = 'Assets/login.svg';
        iconElement.alt = 'Login';
        iconElement.style.cssText = `
            position: fixed;
            bottom: 63px;
            right: 353px;
            width: 24px;
            height: 24px;
            filter: brightness(0) invert(1);
            mix-blend-mode: overlay;
            pointer-events: none;
            z-index: 1001;
        `;

        settingsBtn.addEventListener('click', () => {
            this.clearToken();
        });

        settingsBtn.addEventListener('mouseenter', () => {
            settingsBtn.style.background = 'rgba(255, 255, 255, 0.7)';
        });

        settingsBtn.addEventListener('mouseleave', () => {
            settingsBtn.style.background = 'rgba(255, 255, 255, 0.5)';
        });

        document.body.appendChild(settingsBtn);
        document.body.appendChild(iconElement);
    }
}

// Global token manager instance
window.tokenManager = new TokenManager();

// Add settings button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tokenManager.addSettingsButton();
    
    // Set up observer to watch for modal visibility changes
    const modal = document.getElementById('tokenModal');
    if (modal) {
        // Try immediate initialization if modal is already visible
        if (modal.style.display === 'flex') {
            setTimeout(() => initializeLoginButtonHover(), 100);
        }
        
        // Watch for style changes on the modal
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const modal = mutation.target;
                    if (modal.style.display === 'flex') {
                        console.log('🔔 Modal became visible, initializing hover effects...');
                        setTimeout(() => initializeLoginButtonHover(), 100);
                        setTimeout(() => initializeLoginButtonHover(), 300);
                        setTimeout(() => initializeTokenTitleHover(), 100);
                        setTimeout(() => initializeTokenTitleHover(), 300);
                    }
                }
            });
        });
        
        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['style']
        });
    }
});

// Initialize LOGIN button character hover effect
function initializeLoginButtonHover() {
    const loginText = document.querySelector('.login-text');
    const tokenSubmitBtn = document.getElementById('tokenSubmit');
    
    console.log('🔍 Initializing LOGIN hover effect...', {
        loginText: !!loginText,
        tokenSubmitBtn: !!tokenSubmitBtn,
        modalVisible: document.getElementById('tokenModal')?.style.display,
        alreadyPrepared: loginText?.dataset.prepared
    });
    
    if (!loginText || !tokenSubmitBtn) {
        console.log('❌ LOGIN elements not found, will retry...');
        return false;
    }

    // Skip if already prepared and working
    if (loginText.dataset.prepared === 'true' && loginText.querySelectorAll('.login-char').length > 0) {
        console.log('✅ LOGIN hover already initialized');
        return true;
    }

    const originalText = loginText.textContent || 'LOGIN';
    const chars = originalText.trim().split('');
    console.log('🔤 Splitting LOGIN text:', chars);
    
    loginText.innerHTML = chars.map(ch => {
        if (ch === ' ') {
            return '<span class="login-space">&nbsp;</span>';
        }
        return `<span class="login-char">${ch}</span>`;
    }).join('');
    loginText.dataset.prepared = 'true';

    const radius = 20; // Smaller radius for more precise letter-focused effect
    const baseWeight = 300; // Thinner default weight
    const maxWeight = 900; // Increase max weight for more dramatic effect
    const easeOutQuad = t => 1 - (1 - t) * (1 - t);
    let rafId = null;

    console.log('🎯 Setting up hover listeners on LOGIN button');
    
    // Don't clone the button - just add listeners directly
    tokenSubmitBtn.addEventListener('mousemove', handleMouseMove);
    tokenSubmitBtn.addEventListener('mouseleave', handleMouseLeave);
    
    function handleMouseMove(e) {
        if (rafId) cancelAnimationFrame(rafId);

        const spans = loginText.querySelectorAll('.login-char');
        
        rafId = requestAnimationFrame(() => {
            const buttonRect = tokenSubmitBtn.getBoundingClientRect();
            const mouseX = e.clientX - buttonRect.left;

            spans.forEach((span, index) => {
                const spanRect = span.getBoundingClientRect();
                const spanCenter = spanRect.left - buttonRect.left + spanRect.width / 2;
                const dist = Math.abs(mouseX - spanCenter);
                const raw = Math.max(0, 1 - dist / radius);
                const influence = easeOutQuad(raw);
                const newWeight = Math.round(baseWeight + influence * (maxWeight - baseWeight));
                
                span.style.fontWeight = newWeight;
                
                // Debug output for testing
                if (index === 0 && influence > 0) {
                    console.log(`🎨 L weight: ${newWeight}, distance: ${dist.toFixed(1)}, influence: ${influence.toFixed(2)}`);
                }
            });
        });
    }

    function handleMouseLeave() {
        console.log('👋 Mouse leave detected');
        if (rafId) cancelAnimationFrame(rafId);
        
        loginText.querySelectorAll('.login-char').forEach(span => {
            span.style.fontWeight = baseWeight;
        });
    }

    console.log('✅ LOGIN hover effect initialized successfully!');
    return true;
}

// Initialize token title character hover effect
function initializeTokenTitleHover() {
    const tokenTitle = document.querySelector('.token-title');
    
    console.log('🎯 Initializing token title hover effect...', {
        tokenTitle: !!tokenTitle,
        modalVisible: document.getElementById('tokenModal')?.style.display,
        alreadyPrepared: tokenTitle?.dataset.prepared
    });
    
    if (!tokenTitle) {
        console.log('❌ Token title not found, will retry...');
        return false;
    }

    // Skip if already prepared and working
    if (tokenTitle.dataset.prepared === 'true' && tokenTitle.querySelectorAll('.title-char').length > 0) {
        console.log('✅ Token title hover already initialized');
        return true;
    }

    const originalText = tokenTitle.textContent || 'API Token Required';
    const chars = originalText.trim().split('');
    console.log('🔤 Splitting token title text:', chars);
    
    tokenTitle.innerHTML = chars.map(ch => {
        if (ch === ' ') {
            return '<span class="title-space">&nbsp;</span>';
        }
        return `<span class="title-char">${ch}</span>`;
    }).join('');
    tokenTitle.dataset.prepared = 'true';

    const radius = 35; // Increased radius for more spread-out effect
    const baseWeight = 120; // Ultra-thin base weight matching the title style
    const maxWeight = 600; // Bold weight for hover effect
    const easeOutQuad = t => 1 - (1 - t) * (1 - t);
    let rafId = null;

    console.log('🎨 Setting up hover listeners on token title');
    
    tokenTitle.addEventListener('mousemove', handleMouseMove);
    tokenTitle.addEventListener('mouseleave', handleMouseLeave);
    
    function handleMouseMove(e) {
        if (rafId) cancelAnimationFrame(rafId);

        const spans = tokenTitle.querySelectorAll('.title-char');
        
        rafId = requestAnimationFrame(() => {
            const titleRect = tokenTitle.getBoundingClientRect();
            const mouseX = e.clientX - titleRect.left;

            spans.forEach((span, index) => {
                const spanRect = span.getBoundingClientRect();
                const spanCenter = spanRect.left - titleRect.left + spanRect.width / 2;
                const dist = Math.abs(mouseX - spanCenter);
                const raw = Math.max(0, 1 - dist / radius);
                const influence = easeOutQuad(raw);
                const newWeight = Math.round(baseWeight + influence * (maxWeight - baseWeight));
                
                span.style.fontWeight = newWeight;
                
                // Debug output for testing
                if (index === 0 && influence > 0) {
                    console.log(`🎨 Title first char weight: ${newWeight}, distance: ${dist.toFixed(1)}, influence: ${influence.toFixed(2)}`);
                }
            });
        });
    }

    function handleMouseLeave() {
        console.log('👋 Title mouse leave detected');
        if (rafId) cancelAnimationFrame(rafId);
        
        tokenTitle.querySelectorAll('.title-char').forEach(span => {
            span.style.fontWeight = baseWeight;
        });
    }

    console.log('✅ Token title hover effect initialized successfully!');
    return true;
}

// Export for use in other files
window.getApiToken = () => window.tokenManager.getToken();

// Export hover functions for debugging
window.initializeLoginButtonHover = initializeLoginButtonHover;
window.initializeTokenTitleHover = initializeTokenTitleHover; 