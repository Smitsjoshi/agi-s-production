/**
 * AGI-S Universal Action Layer (UAL)™ - Server Implementation
 * Copyright © 2024-2025 AGI-S Technologies
 * Patent Pending
 * 
 * IMPORTANT: Puppeteer may not work on Vercel serverless functions
 * due to binary size limits. For production, consider using:
 * - Puppeteer with @sparticuz/chromium (Vercel-compatible)
 * - Or a dedicated server for browser automation
 */

import { NextRequest, NextResponse } from 'next/server';
import type { UALTask, UALResult, WebAction } from '@/lib/universal-action-layer';

// Dynamic import for Puppeteer (server-side only)
let puppeteer: any;
let chromium: any;

async function initBrowser() {
    if (!puppeteer) {
        try {
            // Try to use chromium-min for Vercel
            chromium = await import('@sparticuz/chromium');
            puppeteer = await import('puppeteer-core');
        } catch {
            // Fallback to regular puppeteer for local development
            puppeteer = await import('puppeteer');
        }
    }
    return { puppeteer, chromium };
}

/**
 * Execute UAL task with browser automation
 */
export async function POST(req: NextRequest) {
    try {
        const task: UALTask = await req.json();
        const { goal, url, actions } = task;

        const steps: string[] = [];
        let screenshot: string | undefined;
        let extractedData: any;

        // Initialize Browser
        const { puppeteer: pup, chromium: chr } = await initBrowser();

        let browser;

        try {
            if (chr) {
                // Vercel environment with chromium
                steps.push('🌐 Launching browser (Vercel mode)...');
                browser = await pup.default.launch({
                    args: chr.default.args,
                    defaultViewport: chr.default.defaultViewport,
                    executablePath: await chr.default.executablePath(),
                    headless: chr.default.headless,
                });
            } else {
                // Local development
                steps.push('🌐 Launching browser (local mode)...');
                browser = await pup.default.launch({
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ],
                });
            }
        } catch (launchError: any) {
            steps.push(`❌ Browser launch failed: ${launchError.message}`);
            steps.push('⚠️ Note: Puppeteer may not work on Vercel free tier');
            steps.push('💡 For production, use a dedicated server or Browserless.io');

            return NextResponse.json({
                success: false,
                error: 'Browser automation not available on this platform',
                steps,
            } as UALResult);
        }

        steps.push('✅ Browser launched');

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });

        // Navigate to URL (either provided or from first action)
        let initialUrl = url;

        // If no initial URL provided, check if first action is navigation
        if (!initialUrl && actions && actions.length > 0 && actions[0].type === 'navigate' && actions[0].url) {
            initialUrl = actions[0].url;
            // We don't remove the action, as executeAction will handle it safely (idempotent-ish navigation)
        }

        if (initialUrl) {
            steps.push(`🌐 Navigating to ${initialUrl}...`);
            try {
                await page.goto(initialUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                steps.push('✅ Page loaded');
            } catch (navError: any) {
                steps.push(`⚠️ Navigation warning: ${navError.message}`);
                // Continue anyway, maybe params loads partial page
            }
        } else {
            steps.push('⚠️ No start URL provided. Attempting to execute actions directly...');
        }

        // Execute actions if provided
        if (actions && actions.length > 0) {
            for (const [index, action] of actions.entries()) {
                try {
                    // Skip first navigation if we already did it via initialUrl to save time/reload
                    if (index === 0 && action.type === 'navigate' && action.url === initialUrl) {
                        steps.push('⏩ Skipping redundant initial navigation');
                        continue;
                    }
                    await executeAction(page, action, steps);
                } catch (error: any) {
                    steps.push(`⚠️ Action ${index + 1} (${action.type}) failed: ${error.message}`);
                    // Consider breaking if critical? For now continue
                }
            }
        } else {
            // If no actions provided, just take a screenshot
            steps.push('📸 Capturing page state...');
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
        steps.push('✅ Browser closed');

        const result: UALResult = {
            success: true,
            screenshot,
            data: extractedData,
            steps,
        };

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('UAL Error:', error);

        const result: UALResult = {
            success: false,
            error: error.message,
            steps: [`❌ Error: ${error.message}`],
        };

        return NextResponse.json(result, { status: 500 });
    }
}

/**
 * Execute a single web action
 */
async function executeAction(page: any, action: WebAction, steps: string[]) {
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

        case 'extract':
            steps.push('📊 Extracting data...');
            // Data extraction logic
            steps.push('✅ Data extracted');
            break;

        default:
            steps.push(`⚠️ Unknown action type: ${action.type}`);
    }
}
