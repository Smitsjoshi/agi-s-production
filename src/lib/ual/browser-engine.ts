import { chromium, Browser, BrowserContext, Page } from 'playwright';

export interface BrowserActionResult {
    success: boolean;
    screenshot?: string;
    domTree?: any;
    error?: string;
    title?: string;
    url?: string;
    text?: string;
}

export class BrowserEngine {
    private static instance: BrowserEngine;
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private activePage: Page | null = null;

    private constructor() { }

    public static getInstance(): BrowserEngine {
        if (!BrowserEngine.instance) {
            BrowserEngine.instance = new BrowserEngine();
        }
        return BrowserEngine.instance;
    }

    public async launch(): Promise<void> {
        if (this.browser) return;

        console.log('[BrowserEngine] Launching Playwright (Headed: true)...');
        this.browser = await chromium.launch({
            headless: process.env.NODE_ENV === 'production', // Local debug mode enabled
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        this.activePage = await this.context.newPage();
        console.log('[BrowserEngine] Browser launched.');
    }

    public async navigate(url: string): Promise<BrowserActionResult> {
        if (!this.activePage) await this.launch();
        if (!this.activePage) throw new Error("Browser failed to initialize");

        console.log(`[BrowserEngine] Navigating to: ${url}`);
        await this.activePage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        return await this.observe();
    }

    public async executeAction(action: { type: string, selector?: string, value?: string, url?: string, key?: string }): Promise<BrowserActionResult> {
        if (!this.activePage) await this.launch();
        if (!this.activePage) throw new Error("No active page");
        const page = this.activePage;

        console.log(`[BrowserEngine] Executing: ${action.type} on ${action.selector || 'page'}`);

        try {
            switch (action.type) {
                case 'click':
                    if (!action.selector) throw new Error("Selector required for click");
                    await page.click(action.selector, { timeout: 10000 });
                    break;

                case 'type':
                    if (!action.selector) throw new Error("Selector required for type");
                    await page.fill(action.selector, action.value || '', { timeout: 10000 });
                    break;

                case 'wait':
                    await new Promise(r => setTimeout(r, 2000));
                    break;

                case 'scroll':
                    await page.evaluate(() => window.scrollBy(0, 500));
                    break;

                case 'press':
                    if (!action.key) throw new Error("Key required for press");
                    await page.keyboard.press(action.key);
                    break;

                case 'navigate':
                    if (action.value) await this.navigate(action.value);
                    else if (action.url) await this.navigate(action.url);
                    break;

                default:
                    console.warn(`[BrowserEngine] Unknown action type: ${action.type}`);
            }

            return await this.observe();
        } catch (error: any) {
            console.error(`[BrowserEngine] Action failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                screenshot: await this.getScreenshotBase64()
            };
        }
    }

    public async observe(): Promise<BrowserActionResult> {
        if (!this.activePage) throw new Error("No active page");

        const screenshot = await this.getScreenshotBase64();
        const domTree = await this.getAccessibilityTree();
        const title = await this.activePage.title();
        const url = this.activePage.url();
        const text = await this.activePage.evaluate(() => document.body.innerText.slice(0, 5000));

        return {
            success: true,
            screenshot,
            domTree,
            title,
            url,
            text
        };
    }

    private async getScreenshotBase64(): Promise<string> {
        if (!this.activePage) return '';
        const buffer = await this.activePage.screenshot({ type: 'jpeg', quality: 60 });
        return buffer.toString('base64');
    }

    private async getAccessibilityTree() {
        if (!this.activePage) return null;
        return await this.activePage.evaluate(() => {
            function getElementData(el: Element): any {
                const rect = el.getBoundingClientRect();
                return {
                    tag: el.tagName.toLowerCase(),
                    id: el.id,
                    text: el.textContent?.trim().slice(0, 30),
                    role: el.getAttribute('role'),
                    ariaLabel: el.getAttribute('aria-label'),
                    rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height }
                };
            }

            return Array.from(document.querySelectorAll('button, a, input, [role="button"]'))
                .filter(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                })
                .map(getElementData);
        });
    }

    public async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.activePage = null;
            this.context = null;
        }
    }
}
