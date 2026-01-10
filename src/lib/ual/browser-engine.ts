import puppeteer, { Browser, Page } from 'puppeteer';

export class BrowserEngine {
    private static instance: BrowserEngine;
    private browser: Browser | null = null;
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

        console.log('[BrowserEngine] Launching Puppeteer...');
        this.browser = await puppeteer.launch({
            headless: true, // Visible for debugging if false, but usually true for server
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const pages = await this.browser.pages();
        this.activePage = pages.length > 0 ? pages[0] : await this.browser.newPage();

        // Set a reasonable viewport
        await this.activePage.setViewport({ width: 1280, height: 800 });
        console.log('[BrowserEngine] Browser launched.');
    }

    public async navigate(url: string): Promise<{ title: string, text: string }> {
        if (!this.activePage) await this.launch();
        if (!this.activePage) throw new Error("Browser failed to initialize");

        console.log(`[BrowserEngine] Navigating to: ${url}`);
        await this.activePage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const title = await this.activePage.title();
        // Extract main text for LLM context
        const text = await this.activePage.evaluate(() => {
            return document.body.innerText.substring(0, 10000); // Limit context
        });

        return { title, text };
    }

    public async getScreenshot(): Promise<Buffer> {
        if (!this.activePage) throw new Error("No active page");
        return Buffer.from(await this.activePage.screenshot({ encoding: 'binary', type: 'jpeg', quality: 80 }));
    }

    public async executeAction(action: { type: string, selector?: string, value?: string, key?: string }) {
        if (!this.activePage) throw new Error("No active page");
        const page = this.activePage;

        console.log(`[BrowserEngine] Executing: ${action.type} on ${action.selector}`);

        try {
            switch (action.type) {
                case 'click':
                    if (!action.selector) throw new Error("Selector required for click");
                    await page.waitForSelector(action.selector, { timeout: 5000 });
                    await page.click(action.selector);
                    break;

                case 'type':
                    if (!action.selector) throw new Error("Selector required for type");
                    await page.waitForSelector(action.selector, { timeout: 5000 });
                    await page.type(action.selector, action.value || '');
                    break;

                case 'wait':
                    await new Promise(r => setTimeout(r, 2000));
                    break;

                case 'scroll':
                    await page.evaluate(() => window.scrollBy(0, 500));
                    break;

                case 'press':
                    if (!action.key) throw new Error("Key required for press");
                    await page.keyboard.press(action.key as any);
                    break;

                case 'navigate':
                    if (action.value) await this.navigate(action.value);
                    break;

                default:
                    console.warn(`[BrowserEngine] Unknown action type: ${action.type}`);
            }
        } catch (error: any) {
            console.error(`[BrowserEngine] Action failed: ${error.message}`);
            throw error;
        }
    }

    public async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.activePage = null;
        }
    }
}
