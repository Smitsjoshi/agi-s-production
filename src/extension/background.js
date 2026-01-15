// Background Service Worker
// The Cortex of Project GHOST

const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://agi-s-production.vercel.app',
    'https://agi-s-demo.vercel.app'
];

// Listen for messages from AGI-S (The Web App)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (!ALLOWED_ORIGINS.includes(sender.origin || '')) {
        console.warn('Blocked unauthorized command from:', sender.origin);
        return; // Security Block
    }

    console.log('Received command from Brain:', message);

    if (message.type === 'HANDSHAKE') {
        sendResponse({ status: 'CONNECTED', version: '1.0.0' });
    }

    // Relay EXECUTE commands to the Active Tab
    if (message.type === 'EXECUTE') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                    sendResponse(response);
                });
            } else {
                sendResponse({ error: 'NO_ACTIVE_TAB' });
            }
        });
        return true; // Keep channel open for async response
    }
});
