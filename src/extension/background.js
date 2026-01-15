// Background Service Worker (UAL 2.0 Hive Mind)
// Coordinates intelligence between tabs.

const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://agi-s-production.vercel.app',
    'https://agi-s-demo.vercel.app'
];

// Memory Store for 'Hive Mind' (Context sharing)
let HIVE_CONTEXT = {};
let TARGET_TAB_ID = null; // Track the tab we are controlling

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (!ALLOWED_ORIGINS.includes(sender.origin || '')) {
        console.warn('Blocked unauthorized command from:', sender.origin);
        return;
    }

    if (message.type === 'HANDSHAKE') {
        sendResponse({ status: 'CONNECTED', version: '2.0.0' });
    }

    // EXECUTE: Run action on Active Tab or Targeted Tab
    if (message.type === 'EXECUTE') {
        const { action, value, selector } = message;

        // NEW TAB HANDLING for NAVIGATE
        if (action === 'NAVIGATE') {
            const url = value || selector;
            if (url) {
                chrome.tabs.create({ url: url.startsWith('http') ? url : `https://${url}` }, (tab) => {
                    // CRITICAL FIX: Track this new tab as the Target
                    TARGET_TAB_ID = tab.id;
                    console.log('[UAL] Targeted Tab:', TARGET_TAB_ID);
                });
                sendResponse({ status: 'SUCCESS', message: 'Opened new tab' });
            } else {
                sendResponse({ status: 'ERROR', message: 'No URL provided' });
            }
            return true; // Async response
        }

        // Forward commands to the TARGETED tab if it exists, otherwise Active Tab
        if (TARGET_TAB_ID) {
            sendMessageWithRetry(TARGET_TAB_ID, message, sendResponse);
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    sendMessageWithRetry(tabs[0].id, message, sendResponse);
                } else {
                    sendResponse({ error: 'NO_ACTIVE_TAB' });
                }
            });
        }
        return true;
    }

    // ... (HIVE handlers remain) ...

});

// Helper: Retry sending message to tab (handles slow loading content scripts)
function sendMessageWithRetry(tabId, message, sendResponse, attempt = 1) {
    chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
            console.warn(`[UAL] Attempt ${attempt} failed:`, chrome.runtime.lastError.message);
            if (attempt < 5) {
                setTimeout(() => {
                    sendMessageWithRetry(tabId, message, sendResponse, attempt + 1);
                }, 1000 * attempt); // Linear backoff: 1s, 2s, 3s, 4s
            } else {
                sendResponse({ error: 'CONNECTION_FAILED', details: chrome.runtime.lastError.message });
            }
        } else {
            sendResponse(response);
        }
    });
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
