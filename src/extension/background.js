// Background Service Worker (UAL 2.0 Hive Mind)
// Coordinates intelligence between tabs.

const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://agi-s-production.vercel.app',
    'https://agi-s-demo.vercel.app'
];

// Memory Store for 'Hive Mind' (Context sharing)
let HIVE_CONTEXT = {};

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (!ALLOWED_ORIGINS.includes(sender.origin || '')) {
        console.warn('Blocked unauthorized command from:', sender.origin);
        return;
    }

    if (message.type === 'HANDSHAKE') {
        sendResponse({ status: 'CONNECTED', version: '2.0.0' });
    }

    // EXECUTE: Run action on Active Tab
    if (message.type === 'EXECUTE') {
        const { action, value, selector } = message;

        // NEW TAB HANDLING for NAVIGATE
        if (action === 'NAVIGATE') {
            const url = value || selector;
            if (url) {
                chrome.tabs.create({ url: url.startsWith('http') ? url : `https://${url}` });
                sendResponse({ status: 'SUCCESS', message: 'Opened new tab' });
            } else {
                sendResponse({ status: 'ERROR', message: 'No URL provided' });
            }
            return true; // Async response
        }

        // Forward other commands (CLICK, TYPE, PRESS, READ) to the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                    sendResponse(response);
                });
            } else {
                sendResponse({ error: 'NO_ACTIVE_TAB' });
            }
        });
        return true;
    }

    // HIVE_STORE: Store data from Tab A
    if (message.type === 'HIVE_STORE') {
        HIVE_CONTEXT[message.key] = message.value;
        sendResponse({ status: 'STORED' });
    }

    // HIVE_FETCH: Retrieve data for Tab B
    if (message.type === 'HIVE_FETCH') {
        sendResponse({ status: 'RETRIEVED', data: HIVE_CONTEXT[message.key] });
    }

    // BROADCAST: Send message to ALL tabs (e.g., "HUD_ON")
    if (message.type === 'BROADCAST') {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, message);
                }
            });
        });
        sendResponse({ status: 'BROADCAST_SENT' });
    }
});
