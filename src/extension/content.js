// The Ghost Hand
// Injected into every page to execute DOM actions.

console.log("AGI-S Ghost Protocol: Active");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXECUTE') {
        const { action, selector, value } = message;

        try {
            if (action === 'CLICK') {
                const el = document.querySelector(selector);
                if (el) {
                    el.click();
                    sendResponse({ status: 'SUCCESS' });
                } else {
                    sendResponse({ status: 'ERROR', message: 'Element not found' });
                }
            }

            if (action === 'TYPE') {
                const el = document.querySelector(selector);
                if (el) {
                    el.value = value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    sendResponse({ status: 'SUCCESS' });
                }
            }

            if (action === 'READ') {
                // Basic scraper
                const text = document.body.innerText;
                sendResponse({ status: 'SUCCESS', data: text.slice(0, 5000) }); // Limit for now
            }

        } catch (e) {
            sendResponse({ status: 'ERROR', message: e.toString() });
        }
    }
});
