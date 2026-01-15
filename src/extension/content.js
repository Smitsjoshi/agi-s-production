// The Ghost Hand (UAL 2.0)
// Active Interaction Layer

console.log("AGI-S UAL 2.0: Active");

// Announce presence
window.dispatchEvent(new CustomEvent('AGIS_UAL_READY', {
    detail: { version: '2.0.0', status: 'ACTIVE' }
}));
window.AGIS_UAL_ACTIVE = true;

// Helper: Simulate human-like typing
const simulateType = (element, text) => {
    element.focus();
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
};

// Helper: Highlight element before action (Debug/Visual Feedback)
const highlightElement = (element) => {
    const original = element.style.outline;
    element.style.outline = "2px solid #10b981"; // Emerald Green
    setTimeout(() => {
        element.style.outline = original;
    }, 1000);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXECUTE') {
        const { action, selector, value } = message;
        console.log(`[UAL] Executing: ${action} on ${selector}`);

        try {
            const el = document.querySelector(selector);

            // Action: CLICK
            if (action === 'CLICK') {
                if (el) {
                    highlightElement(el);
                    el.click();
                    sendResponse({ status: 'SUCCESS' });
                } else {
                    sendResponse({ status: 'ERROR', message: `Element not found: ${selector}` });
                }
            }

            // Action: TYPE
            else if (action === 'TYPE') {
                if (el) {
                    highlightElement(el);
                    simulateType(el, value);
                    sendResponse({ status: 'SUCCESS' });
                } else {
                    sendResponse({ status: 'ERROR', message: `Element not found: ${selector}` });
                }
            }

            // Action: READ (Content Extraction)
            else if (action === 'READ') {
                if (el) {
                    const text = el.innerText || el.textContent;
                    sendResponse({ status: 'SUCCESS', data: text });
                } else {
                    // Default to body if no selector
                    const text = document.body.innerText;
                    sendResponse({ status: 'SUCCESS', data: text.slice(0, 10000) });
                }
            }

            // Action: SCROLL
            else if (action === 'SCROLL') {
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    sendResponse({ status: 'SUCCESS' });
                } else {
                    window.scrollTo({ top: value || 0, behavior: 'smooth' });
                    sendResponse({ status: 'SUCCESS' });
                }
            }

            else {
                sendResponse({ status: 'ERROR', message: 'Unknown Action' });
            }

        } catch (e) {
            console.error('[UAL Error]', e);
            sendResponse({ status: 'ERROR', message: e.toString() });
        }

        return true; // Keep channel open
    }
});
