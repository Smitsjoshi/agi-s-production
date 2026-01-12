
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

    console.log(`\x1b[33mLaunching ${type} with Ghost Protocol...\x1b[0m`);
    browser = await engine.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-blink-features=AutomationControlled', // Mask automation
            '--disable-infobars'
        ]
    });

    context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false
    });

    // Ghost Protocol: Script injection to mask webdriver
    await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        window.chrome = { runtime: {} };
    });

    page = await context.newPage();
    return { browser, page };
}

async function observePage(page) {
    if (!page) return {};

    // 1. Capture high-quality observation data
    let accessibilityTree = null;
    try {
        if (page.accessibility) {
            accessibilityTree = await page.accessibility.snapshot();
        }
    } catch (e) {
        console.log(`\x1b[31m[Warning] Accessibility Snapshot failed: ${e.message}\x1b[0m`);
    }

    const [screenshot, title, url] = await Promise.all([
        page.screenshot({ type: 'jpeg', quality: 50 }),
        page.title(),
        page.url()
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

// BULLETPROOF SMART ACTION (GHOST PROTOCOL V3)
async function smartAction(page, type, selector, value) {
    console.log(`\x1b[35m[UAL AGENT]\x1b[0m Executing ${type}...`);

    // 0. Ensure page is front and focused
    await page.bringToFront();

    // 1. Dismiss common "Obstacles" (Modals/Popups)
    try {
        const obstacles = ['button:has-text("Accept")', 'button:has-text("I agree")', '#L2AGLb', '.ayH38e', '[aria-label="Accept all"]'];
        for (const s of obstacles) {
            const el = await page.$(s);
            if (el && await el.isVisible()) {
                console.log(`\x1b[34m[Heal] Clearing obstacle: ${s}\x1b[0m`);
                await el.click({ timeout: 1000 }).catch(() => { });
            }
        }
    } catch (e) { }

    // 2. BRUTE FORCE SELECTOR PATH
    if (selector) {
        try {
            console.log(`\x1b[36m[Grounding] Targeting selector: ${selector}\x1b[0m`);
            const target = await page.waitForSelector(selector, { state: 'visible', timeout: 2000 });

            if (type === 'click') {
                // Ghost Movement: Randomize path toward center of element
                const box = await target.boundingBox();
                if (box) {
                    const targetX = box.x + box.width / 2 + (Math.random() * 4 - 2);
                    const targetY = box.y + box.height / 2 + (Math.random() * 4 - 2);
                    await page.mouse.move(targetX, targetY, { steps: 10 });
                    await page.waitForTimeout(100 + Math.random() * 150);
                }
                await target.click({ force: true, timeout: 2000 });
                return;
            } else if (type === 'type') {
                await target.click({ force: true });
                // Ghost Typing: Delay between characters
                for (const char of value) {
                    await page.keyboard.type(char, { delay: 50 + Math.random() * 100 });
                }
                await page.waitForTimeout(200 + Math.random() * 400);
                await page.keyboard.press('Enter');
                return;
            }
        } catch (e) {
            console.log(`\x1b[33m[Warning] Selector ${selector} failed or timed out. Triggering Semantic Recovery...\x1b[0m`);
        }
    }

    // 3. SEMANTIC RECOVERY (COMET MODE)
    const searchHint = value || (selector ? selector.replace(/[#.[\]'"=]/g, ' ').trim() : "");
    console.log(`\x1b[35m[Recovery] Searching semantically for: "${searchHint}"\x1b[0m`);

    const strategies = [
        () => page.getByRole('button', { name: searchHint, exact: false }).first(),
        () => page.getByRole('textbox', { name: searchHint, exact: false }).first(),
        () => page.getByPlaceholder(searchHint, { exact: false }).first(),
        () => page.getByText(searchHint, { exact: false }).first(),
        () => page.locator('input, button, a').filter({ hasText: searchHint }).first()
    ];

    for (const strategy of strategies) {
        try {
            const loc = strategy();
            if (await loc.isVisible({ timeout: 1000 })) {
                console.log(`\x1b[32m[Success] Semantic anchor found!\x1b[0m`);
                await loc.scrollIntoViewIfNeeded();
                await page.waitForTimeout(200);
                if (type === 'click') {
                    await loc.click({ force: true });
                } else {
                    await loc.click({ force: true });
                    for (const char of value) {
                        await page.keyboard.type(char, { delay: 40 + Math.random() * 80 });
                    }
                    await page.keyboard.press('Enter');
                }
                return;
            }
        } catch (e) { }
    }

    // 4. FALLBACK: TYPE ANYWAY
    if (type === 'type') {
        console.log(`\x1b[31m[Critical Fallback] Target not found. Typing blindly at current focus...\x1b[0m`);
        for (const char of value) {
            await page.keyboard.type(char, { delay: 40 + Math.random() * 80 });
        }
        await page.keyboard.press('Enter');
        return;
    }

    throw new Error(`Execution Failed: Could not find or ground target "${selector || value}"`);
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
                    console.log(`\x1b[34mNavigating to: ${cmd.url}\x1b[0m`);
                    await activePage.goto(cmd.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    await activePage.waitForLoadState('networkidle').catch(() => { });
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
