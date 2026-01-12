
const WebSocket = require('ws');
const { exec } = require('child_process');
const { chromium, firefox, webkit } = require('playwright');

// Configuration
const PORT = 3001;
const wss = new WebSocket.Server({ port: PORT });

let browser = null;
let context = null;
let page = null;

console.log(`\x1b[36mAGI-S Multi-Browser Bridge Active on ws://localhost:${PORT}\x1b[0m`);
console.log('Mode: Local Autonomous Agent (Playwright Engine)');

async function getBrowserInstance(type = 'chromium') {
    if (browser) return { browser, page };

    const engine = type === 'firefox' ? firefox : (type === 'webkit' ? webkit : chromium);

    console.log(`\x1b[33mLaunching ${type}...\x1b[0m`);
    browser = await engine.launch({
        headless: false, // Visible for the user
        args: ['--no-sandbox']
    });
    context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    return { browser, page };
}

async function observePage(page) {
    if (!page) return {};

    // 1. Capture high-quality observation data
    const [screenshot, title, url, accessibilityTree] = await Promise.all([
        page.screenshot({ type: 'jpeg', quality: 50 }),
        page.title(),
        page.url(),
        page.accessibility.snapshot()
    ]);

    // 2. Comprehensive DOM Grounding (Actionable elements only)
    const domTree = await page.evaluate(() => {
        const isVisible = (el) => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
        };

        const elements = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"], [onclick]'));

        return elements
            .filter(isVisible)
            .slice(0, 100) // Increase density
            .map(el => {
                const rect = el.getBoundingClientRect();
                return {
                    tag: el.tagName.toLowerCase(),
                    text: el.innerText?.trim().substring(0, 60) || el.value?.trim().substring(0, 60) || el.getAttribute('aria-label') || el.placeholder || '',
                    id: el.id,
                    role: el.getAttribute('role') || (el.tagName === 'A' ? 'link' : el.tagName.toLowerCase()),
                    selector: el.id ? `#${el.id}` : (el.getAttribute('name') ? `[name="${el.getAttribute('name')}"]` : null),
                    bounds: { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
                };
            });
    });

    return {
        screenshot: screenshot.toString('base64'),
        title,
        url,
        accessibilityTree,
        domTree
    };
}

// Semantic Grounding Action Handler (Perplexity/Skyvern style)
async function smartAction(page, type, selector, value) {
    console.log(`\x1b[35m[Semantic Agent]\x1b[0m ${type} command received...`);

    // 1. Try to dismiss common consent modals automatically
    try {
        const consentSelectors = ['button:has-text("Accept all")', 'button:has-text("I agree")', '#L2AGLb', '.ayH38e'];
        for (const s of consentSelectors) {
            const btn = await page.$(s);
            if (btn && await btn.isVisible()) {
                console.log(`\x1b[34m[Auto-Heal] Dismissing Modal...\x1b[0m`);
                await btn.click({ timeout: 1500 }).catch(() => { });
            }
        }
    } catch (e) { }

    // 2. Primary Execution Path (If selector exists)
    if (selector) {
        try {
            await page.waitForSelector(selector, { state: 'visible', timeout: 3000 });
            if (type === 'click') {
                await page.click(selector, { timeout: 3000 });
                return;
            } else if (type === 'type') {
                await page.fill(selector, value, { timeout: 3000 });
                await page.press(selector, 'Enter');
                return;
            }
        } catch (e) {
            console.log(`\x1b[33m[Grounding] Selector ${selector} failed, attempting semantic recovery...\x1b[0m`);
        }
    }

    // 3. SEMANTIC RECOVERY (Comet Mode)
    // If the planner gave a bad selector, we try to find the element by TEXT or ROLE
    const targetText = value || selector.replace(/[#.[\]]/g, ' ').trim();

    const recoveryStrategies = [
        // Role + Name match
        async () => {
            const role = type === 'type' ? 'textbox' : 'button';
            const loc = page.getByRole(role).and(page.getByText(targetText, { exact: false })).first();
            if (await loc.isVisible()) return loc;
        },
        // Placeholder match
        async () => {
            if (type === 'type') {
                const loc = page.getByPlaceholder(new RegExp(targetText, 'i')).first();
                if (await loc.isVisible()) return loc;
            }
        },
        // Raw text match
        async () => {
            const loc = page.getByText(targetText, { exact: false }).first();
            if (await loc.isVisible()) return loc;
        }
    ];

    for (const strategy of recoveryStrategies) {
        try {
            const loc = await strategy();
            if (loc) {
                console.log(`\x1b[32m[Auto-Heal] Semantic Match Found!\x1b[0m`);
                if (type === 'click') await loc.click({ timeout: 2000 });
                else {
                    await loc.fill(value);
                    await loc.press('Enter');
                }
                return;
            }
        } catch (e) { }
    }

    // 4. COORDINATE GROUNDING (Last Resort)
    // If we have coordinates from the domTree, we can click them directly
    console.log(`\x1b[31m[Grounding Failed] No element found matching instructions.\x1b[0m`);
    throw new Error(`Target not found: ${selector}`);
}

wss.on('connection', (ws) => {
    console.log('\x1b[32mCanvas Interface Connected\x1b[0m');

    ws.on('message', async (message) => {
        try {
            const cmd = JSON.parse(message);
            const { page: activePage } = await getBrowserInstance(cmd.browserType);

            let result = { status: 'success' };

            switch (cmd.type) {
                case 'BROWSER_NAVIGATE':
                    await activePage.goto(cmd.url, { waitUntil: 'domcontentloaded' });
                    result.data = await observePage(activePage);
                    break;

                case 'BROWSER_CLICK':
                    await smartAction(activePage, 'click', cmd.selector);
                    await activePage.waitForTimeout(1000);
                    result.data = await observePage(activePage);
                    break;

                case 'BROWSER_TYPE':
                    await smartAction(activePage, 'type', cmd.selector, cmd.text);
                    await activePage.waitForTimeout(1000);
                    result.data = await observePage(activePage);
                    break;

                case 'BROWSER_OBSERVE':
                    result.data = await observePage(activePage);
                    break;

                case 'MOUSE_MOVE':
                    const x = Math.floor((cmd.x / 100) * 1920);
                    const y = Math.floor((cmd.y / 100) * 1080);
                    exec(`powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})"`);
                    break;

                case 'RUN_TERMINAL':
                    exec(cmd.command);
                    break;

                default:
                    console.log("Unknown Command:", cmd.type);
            }

            ws.send(JSON.stringify({ ...result, id: cmd.id }));
        } catch (error) {
            console.error('\x1b[31mBridge Error:\x1b[0m', error.message);
            ws.send(JSON.stringify({ status: 'error', error: error.message }));
        }
    });

    ws.on('close', () => console.log('\x1b[31mDisconnected\x1b[0m'));
});
