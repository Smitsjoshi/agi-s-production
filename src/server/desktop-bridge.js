
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
    const screenshot = await page.screenshot({ type: 'jpeg', quality: 60 });
    const title = await page.title();
    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));

    // Simple DOM tree for the planner
    const domTree = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'));
        return elements.slice(0, 50).map(el => ({
            tag: el.tagName.toLowerCase(),
            text: el.innerText?.substring(0, 50) || el.value?.substring(0, 50) || '',
            id: el.id,
            role: el.getAttribute('role'),
            selector: el.id ? `#${el.id}` : el.tagName.toLowerCase()
        }));
    });

    return {
        screenshot: screenshot.toString('base64'),
        title,
        url,
        text,
        domTree
    };
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
                    await activePage.click(cmd.selector);
                    await activePage.waitForTimeout(1000);
                    result.data = await observePage(activePage);
                    break;

                case 'BROWSER_TYPE':
                    await activePage.fill(cmd.selector, cmd.text);
                    await activePage.press(cmd.selector, 'Enter');
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
