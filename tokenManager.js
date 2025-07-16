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
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.title = 'Change API Token';
        settingsBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 20px;
            cursor: pointer;
            backdrop-filter: blur(10px);
            z-index: 1000;
            transition: all 0.3s ease;
        `;

        settingsBtn.addEventListener('click', () => {
            this.clearToken();
        });

        settingsBtn.addEventListener('mouseenter', () => {
            settingsBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        settingsBtn.addEventListener('mouseleave', () => {
            settingsBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        });

        document.body.appendChild(settingsBtn);
    }
}

// Global token manager instance
window.tokenManager = new TokenManager();

// Add settings button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tokenManager.addSettingsButton();
});

// Export for use in other files
window.getApiToken = () => window.tokenManager.getToken(); 