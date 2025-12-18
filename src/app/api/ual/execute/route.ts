/**
 * AGI-S Universal Action Layer (UAL)™ - Server Implementation
 * Copyright © 2024-2025 AGI-S Technologies
 * Patent Pending
 */

import { NextRequest, NextResponse } from 'next/server';
import type { UALTask, UALResult, WebAction } from '@/lib/universal-action-layer';

// Dynamic import for Puppeteer (server-side only)
let puppeteer: any;
let chromium: any;

async function initBrowser() {
    if (!puppeteer) {
        try {
            // Check if running on Vercel
            if (process.env.VERCEL) {
                chromium = await import('@sparticuz/chromium');
                puppeteer = await import('puppeteer-core');

                // Configure sparticuz/chromium for Vercel
                // This is critical for Vercel serverless environment
                // We don't set a specific path, we let the library handle it or use a well-known CDN if needed
                // But for standard Vercel usage, the default package import often needs font helpers
            } else {
                puppeteer = await import('puppeteer');
            }
        } catch (e) {
            console.error("Browser import failed", e);
            puppeteer = await import('puppeteer');
        }
    }
    return { puppeteer, chromium };
}

export async function POST(req: NextRequest) {
    try {
        const task: UALTask = await req.json();
        const { goal, url, actions } = task;

        const steps: string[] = [];
        let screenshot: string | undefined;
        let extractedData: any;

        const { puppeteer: pup, chromium: chr } = await initBrowser();
        let browser;

        try {
            if (chr && process.env.VERCEL) {
                steps.push('🌐 Launching browser (Vercel Production Mode)...');

                // Vercel specific configuration
                browser = await pup.default.launch({
                    args: chr.default.args,
                    defaultViewport: chr.default.defaultViewport,
                    executablePath: await chr.default.executablePath(),
                    headless: chr.default.headless,
                    ignoreHTTPSErrors: true,
                });
            } else {
                // Local development - Headful if requested (currently hardcoded or could be env driven)
                steps.push('🌐 Launching browser (Local/Visible Mode)...');
                browser = await pup.default.launch({
                    headless: false, // Visible for demo
                    defaultViewport: null,
                    args: [
                        '--start-maximized',
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                    ],
                });
            }
        } catch (launchError: any) {
            console.error("Launch Error:", launchError);
            steps.push(`❌ Critical Browser Error: ${launchError.message}`);

            // Fallback response for Vercel Free Tier limitations
            return NextResponse.json({
                success: false,
                error: `Browser automation failed. Vercel Free Tier has strictly limited binary support. (${launchError.message})`,
                steps,
            } as UALResult);
        }

        steps.push('✅ Browser engine active');
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });

        // Navigate to URL (either provided or from first action)
        let initialUrl = url;

        // If no initial URL provided, check if first action is navigation
        if (!initialUrl && actions && actions.length > 0 && actions[0].type === 'navigate' && actions[0].url) {
            initialUrl = actions[0].url;
        }

        if (initialUrl) {
            steps.push(`🌐 Navigating to ${initialUrl}...`);
            try {
                await page.goto(initialUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                steps.push('✅ Page loaded');
            } catch (navError: any) {
                steps.push(`⚠️ Navigation warning: ${navError.message}`);
            }
        } else {
            steps.push('⚠️ No start URL provided. Attempting to execute actions directly...');
        }

        // Execute actions if provided
        if (actions && actions.length > 0) {
            for (const [index, action] of actions.entries()) {
                try {
                    // Skip first navigation if we already did it
                    if (index === 0 && action.type === 'navigate' && action.url === initialUrl) {
                        steps.push('⏩ Skipping redundant initial navigation');
                        continue;
                    }
                    await executeAction(page, action, steps);
                } catch (error: any) {
                    steps.push(`⚠️ Action ${index + 1} (${action.type}) failed: ${error.message}`);
                }
            }
        }

        // Always capture final screenshot
        screenshot = await page.screenshot({ encoding: 'base64' });
        steps.push('✅ Screenshot captured');

        // Extract page data
        extractedData = await page.evaluate(() => ({
            title: document.title,
            url: window.location.href,
            text: document.body.innerText.substring(0, 500),
        }));

        await browser.close();
        steps.push('✅ Session closed');

        return NextResponse.json({
            success: true,
            screenshot,
            data: extractedData,
            steps,
        });

    } catch (error: any) {
        console.error('UAL Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            steps: [`❌ Fatal Error: ${error.message}`],
        }, { status: 500 });
    }
}

async function executeAction(page: any, action: WebAction, steps: string[]) {
    // ... (Keep existing execution logic same)
    switch (action.type) {
        case 'navigate':
            if (action.url) {
                steps.push(`🌐 Navigating to ${action.url}...`);
                await page.goto(action.url, { waitUntil: 'networkidle2' });
                steps.push('✅ Navigation complete');
            }
            break;
        case 'click':
            if (action.selector) {
                steps.push(`🖱️ Clicking ${action.selector}...`);
                await page.waitForSelector(action.selector, { timeout: 5000 });
                await page.click(action.selector);
                steps.push('✅ Click complete');
            }
            break;
        case 'type':
            if (action.selector && action.value) {
                steps.push(`⌨️ Typing into ${action.selector}...`);
                await page.waitForSelector(action.selector, { timeout: 5000 });
                await page.type(action.selector, action.value);
                steps.push('✅ Typing complete');
            }
            break;
        case 'scroll':
            steps.push('📜 Scrolling page...');
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            steps.push('✅ Scroll complete');
            break;
        case 'wait':
            const timeout = action.timeout || 1000;
            steps.push(`⏳ Waiting ${timeout}ms...`);
            await page.waitForTimeout(timeout);
            steps.push('✅ Wait complete');
            break;
        case 'screenshot':
            steps.push('📸 Taking screenshot...');
            await page.screenshot({ encoding: 'base64' });
            steps.push('✅ Screenshot taken');
            break;
        default:
            steps.push(`⚠️ Unknown action type: ${action.type}`);
    }
}
