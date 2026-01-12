import { chromium, Browser, BrowserContext, Page } from 'playwright-core';
import { nanoid } from 'nanoid';

export interface BrowserActionResult {
    success: boolean;
    screenshot: string; // Base64
    domTree: any;
    error?: string;
    description: string;
}

export class BrowserAgent {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;

    async initialize() {
        if (this.browser) return;

        this.browser = await chromium.launch({
            headless: true, // Set to false if we want to show the browser locally
        });

        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        this.page = await this.context.newPage();
    }

    async navigate(url: string): Promise<BrowserActionResult> {
        await this.initialize();
        if (!this.page) throw new Error("Browser not initialized");

        try {
            await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            return await this.observe(`Navigated to ${url}`);
        } catch (error: any) {
            return {
                success: false,
                screenshot: '',
                domTree: null,
                error: error.message,
                description: `Failed to navigate to ${url}`
            };
        }
    }

    async click(selector: string): Promise<BrowserActionResult> {
        if (!this.page) throw new Error("Browser not initialized");
        try {
            await this.page.click(selector, { timeout: 10000 });
            return await this.observe(`Clicked ${selector}`);
        } catch (error: any) {
            return {
                success: false,
                screenshot: '',
                domTree: null,
                error: error.message,
                description: `Failed to click ${selector}`
            };
        }
    }

    async type(selector: string, text: string): Promise<BrowserActionResult> {
        if (!this.page) throw new Error("Browser not initialized");
        try {
            await this.page.fill(selector, text, { timeout: 10000 });
            return await this.observe(`Typed "${text}" into ${selector}`);
        } catch (error: any) {
            return {
                success: false,
                screenshot: '',
                domTree: null,
                error: error.message,
                description: `Failed to type into ${selector}`
            };
        }
    }

    async observe(description: string): Promise<BrowserActionResult> {
        if (!this.page) throw new Error("Browser not initialized");

        const screenshot = await this.page.screenshot({ type: 'jpeg', quality: 60 });
        const domTree = await this.getAccessibilityTree();

        return {
            success: true,
            screenshot: screenshot.toString('base64'),
            domTree,
            description
        };
    }

    private async getAccessibilityTree() {
        if (!this.page) return null;
        // Simplified DOM/Accessibility Tree for the LLM
        return await this.page.evaluate(() => {
            function getElementData(el: Element): any {
                const rect = el.getBoundingClientRect();
                return {
                    tag: el.tagName.toLowerCase(),
                    id: el.id,
                    className: el.className,
                    text: el.textContent?.trim().slice(0, 50),
                    role: el.getAttribute('role'),
                    ariaLabel: el.getAttribute('aria-label'),
                    visible: rect.width > 0 && rect.height > 0
                };
            }

            const interactables = Array.from(document.querySelectorAll('button, a, input, [role="button"]'))
                .filter(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                })
                .map(getElementData);

            return interactables;
        });
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
