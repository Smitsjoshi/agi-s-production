// The Ghost Hand (UAL 2.0)
// Active Interaction Layer + Neural HUD

console.log("AGI-S UAL 2.0: Active");

// Announce presence
window.dispatchEvent(new CustomEvent('AGIS_UAL_READY', {
    detail: { version: '2.0.0', status: 'ACTIVE' }
}));
window.AGIS_UAL_ACTIVE = true;

// --- UTILITIES ---
const simulateType = (element, text) => {
    element.focus();
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
};

const highlightElement = (element) => {
    const original = element.style.outline;
    element.style.outline = "2px solid #10b981"; // Emerald
    setTimeout(() => { element.style.outline = original; }, 1000);
};

// --- NEURAL HUD (Shadow DOM Injection) ---
let hudOverlay = null;

const toggleHUD = (enable) => {
    if (enable && !hudOverlay) {
        const host = document.createElement('div');
        host.id = 'agi-s-hud-host';
        host.style.position = 'fixed';
        host.style.top = '0';
        host.style.left = '0';
        host.style.width = '100vw';
        host.style.height = '100vh';
        host.style.pointerEvents = 'none'; // Click through
        host.style.zIndex = '9999999';

        const shadow = host.attachShadow({ mode: 'open' });

        // CSS
        const style = document.createElement('style');
        style.textContent = `
            .hud-container {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 12px;
                color: white;
                font-family: monospace;
                pointer-events: auto;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
                animation: slideIn 0.5s ease-out;
            }
            .pulse { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
            .btn {
                background: rgba(255,255,255,0.1); border: none; color: white; padding: 4px 8px; 
                border-radius: 4px; cursor: pointer; font-size: 10px; text-transform: uppercase;
            }
            .btn:hover { background: rgba(255,255,255,0.2); }
        `;

        // UI
        const container = document.createElement('div');
        container.className = 'hud-container';
        container.innerHTML = `
            <div class="pulse"></div>
            <div>
                <div style="font-size: 10px; opacity: 0.5; text-transform: uppercase;">AGI-S Connected</div>
                <div style="font-size: 12px; font-weight: bold;">NEURAL HUD ACTIVE</div>
            </div>
            <button class="btn" id="analyze-btn">Analyze</button>
        `;

        shadow.appendChild(style);
        shadow.appendChild(container);
        document.body.appendChild(host);
        hudOverlay = host;

        // Listeners inside Shadow DOM
        shadow.getElementById('analyze-btn').addEventListener('click', () => {
            console.log("AGI-S HUD: Analyzing Page...");
            // Send context back to background -> dashboard
            // In V3, content scripts can't notify background easily? They can.
        });

    } else if (!enable && hudOverlay) {
        hudOverlay.remove();
        hudOverlay = null;
    }
};

// --- MESSAGE LISTENER ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`[UAL] Command: ${message.action}`, message);

    if (message.action === 'HUD_TOGGLE') {
        toggleHUD(message.value); // true/false
        sendResponse({ status: 'SUCCESS' });
        return;
    }

    if (message.type === 'EXECUTE') {
        const { action, selector, value } = message;

        try {
            const el = selector ? document.querySelector(selector) : null;

            if (action === 'CLICK') {
                if (el) { highlightElement(el); el.click(); sendResponse({ status: 'SUCCESS' }); }
                else sendResponse({ status: 'ERROR', message: `Element not found: ${selector}` });
            }
            else if (action === 'TYPE') {
                if (el) { highlightElement(el); simulateType(el, value); sendResponse({ status: 'SUCCESS' }); }
                else sendResponse({ status: 'ERROR', message: `Element not found: ${selector}` });
            }
            else if (action === 'READ') {
                // Enhanced Scraper
                const text = document.body.innerText;
                const title = document.title;
                const links = Array.from(document.querySelectorAll('a')).slice(0, 10).map(a => ({ text: a.innerText, href: a.href }));
                sendResponse({ status: 'SUCCESS', data: { title, text: text.slice(0, 5000), links } });
            }
            else if (action === 'SCROLL') {
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                else window.scrollTo({ top: value || 0, behavior: 'smooth' });
                sendResponse({ status: 'SUCCESS' });
            }
            else if (action === 'NAVIGATE') {
                window.location.href = value || selector; // API puts URL in value or selector
                sendResponse({ status: 'SUCCESS', message: 'Navigating...' });
            }
            else if (action === 'PRESS') {
                // value = 'Enter' etc.
                const key = value || 'Enter';
                const eventOpts = { bubbles: true, cancelable: true, key: key, code: key, view: window };
                (el || document.activeElement).dispatchEvent(new KeyboardEvent('keydown', eventOpts));
                (el || document.activeElement).dispatchEvent(new KeyboardEvent('keypress', eventOpts));
                (el || document.activeElement).dispatchEvent(new KeyboardEvent('keyup', eventOpts));
                sendResponse({ status: 'SUCCESS' });
            }
            else {
                sendResponse({ status: 'ERROR', message: 'Unknown Action: ' + action });
            }

        } catch (e) {
            sendResponse({ status: 'ERROR', message: e.toString() });
        }
        return true;
    }
});
