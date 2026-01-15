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
        host.style.bottom = '20px';
        host.style.right = '20px';
        host.style.zIndex = '2147483647'; // Max Z-Index
        host.style.fontFamily = 'monospace';

        const shadow = host.attachShadow({ mode: 'open' });

        // CSS
        const style = document.createElement('style');
        style.textContent = `
            .orb {
                width: 40px;
                height: 40px;
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid #06b6d4; /* Cyan-500 */
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
                transition: all 0.3s ease;
                overflow: hidden;
                white-space: nowrap;
                position: relative;
            }
            .orb:hover {
                width: 180px;
                border-radius: 20px;
                background: rgba(0, 0, 0, 0.95);
                padding: 0 12px;
                justify-content: flex-start;
            }
            .icon {
                min-width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .pulse-dot {
                width: 8px;
                height: 8px;
                background: #06b6d4;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            .content {
                opacity: 0;
                margin-left: 8px;
                color: #06b6d4;
                font-size: 12px;
                font-weight: bold;
                transition: opacity 0.2s 0.1s;
                pointer-events: none;
            }
            .orb:hover .content {
                opacity: 1;
                pointer-events: auto;
            }
            @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
            
            .meta { font-size: 9px; color: #666; margin-top: 2px; }
        `;

        // UI
        const container = document.createElement('div');
        container.className = 'orb';
        container.innerHTML = `
            <div class="icon">
                <div class="pulse-dot"></div>
            </div>
            <div class="content">
                <div>SOVEREIGN OS</div>
                <div class="meta">HIVE MIND: CONNECTED</div>
            </div>
        `;

        shadow.appendChild(style);
        shadow.appendChild(container);
        document.body.appendChild(host);
        hudOverlay = host;

        // Interaction
        container.addEventListener('click', () => {
            console.log("[AGI-S] HUD Clicked - Initiating Inspection Mode...");
            // Future: Open Analysis Modal
        });

    } else if (!enable && hudOverlay) {
        hudOverlay.remove();
        hudOverlay = null;
    }
};

// AUTO-ACTIVATE ON LOAD
setTimeout(() => toggleHUD(true), 500);

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
                const target = el || document.activeElement;

                target.dispatchEvent(new KeyboardEvent('keydown', eventOpts));
                target.dispatchEvent(new KeyboardEvent('keypress', eventOpts));
                target.dispatchEvent(new KeyboardEvent('keyup', eventOpts));

                // ROBUSTNESS: If Enter, also try to submit the form if it belongs to one
                if (key === 'Enter' && target.form) {
                    target.form.requestSubmit();
                }

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
