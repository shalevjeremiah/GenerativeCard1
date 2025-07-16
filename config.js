// Azure service configuration
const AzureConfig = {
    speech: {
        subscriptionKey: 'YOUR_AZURE_SPEECH_KEY',
        region: 'YOUR_AZURE_REGION',
        language: 'en-US'
    },
    contentModerator: {
        subscriptionKey: 'YOUR_CONTENT_MODERATOR_KEY',
        endpoint: 'YOUR_AZURE_ENDPOINT'
    }
};

// Export configuration
window.AzureConfig = AzureConfig; 