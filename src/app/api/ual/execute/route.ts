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
                chromium = await import('@sparticuz/chromium-min');
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
        const { goal, url, actions, sessionId } = task;

        const steps: string[] = [];
        let screenshot: string | undefined;
        let extractedData: any;

        const { puppeteer: pup, chromium: chr } = await initBrowser();
        let browser;

        // BROWSER STEALTH CONFIG
        const USER_AGENTS = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        ];
        const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

        // Persistent User Data Directory for local dev to keep sessions
        const userDataDir = sessionId ? `./.ual-sessions/${sessionId}` : undefined;

        try {
            if (chr && process.env.VERCEL) {
                steps.push('🌐 Launching browser (Vercel/CDN Mode)...');
                const remotePack = "https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar";

                browser = await pup.default.launch({
                    args: [...chr.default.args, '--no-sandbox', '--disable-setuid-sandbox'],
                    defaultViewport: chr.default.defaultViewport,
                    executablePath: await chr.default.executablePath(remotePack),
                    headless: chr.default.headless,
                    ignoreHTTPSErrors: true,
                });
            } else {
                steps.push(`🌐 Launching Stealth Browser${sessionId ? ' (Persistent)' : ''}...`);
                browser = await pup.default.launch({
                    headless: false,
                    defaultViewport: null,
                    userDataDir, // Enable session persistence
                    args: [
                        '--start-maximized',
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-blink-features=AutomationControlled',
                    ],
                });
            }
        } catch (launchError: any) {
            console.error("Launch Error:", launchError);
            steps.push(`❌ Browser Error: ${launchError.message}`);
            return NextResponse.json({ success: false, error: launchError.message, steps }, { status: 500 });
        }

        steps.push('✅ Browser engine active');

        // Helper to always get the most recently created/active page
        const getActivePage = async (b: any) => {
            const currentPages = await b.pages();
            return currentPages[currentPages.length - 1];
        };

        let page = await getActivePage(browser);
        await page.setUserAgent(randomUA);

        // Hide automation flags
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });

        if (!process.env.VERCEL) {
            await page.setViewport({ width: 1440, height: 900 });
        }

        // Logic to determine if we need to navigate or if we're already on a page
        const currentUrl = page.url();
        let targetUrl = url;

        if (!targetUrl && actions?.[0]?.type === 'navigate') {
            targetUrl = actions[0].url;
        }

        // Only navigate if we're not already there or near there
        if (targetUrl && (currentUrl === 'about:blank' || (targetUrl !== 'NONE' && !currentUrl.includes(targetUrl.replace(/^https?:\/\/(www\.)?/, ''))))) {
            steps.push(`🌐 Navigating to ${targetUrl}...`);
            try {
                await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                steps.push('✅ Page loaded');
                page = await getActivePage(browser);
            } catch (e: any) {
                steps.push(`⚠️ Nav warning: ${e.message}`);
            }
        }

        // EXECUTE ACTIONS ROBOUSTY
        for (const action of actions || []) {
            try {
                // Refresh page reference in case previous action opened a new tab
                page = await getActivePage(browser);

                switch (action.type) {
                    case 'navigate':
                        if (action.url) {
                            steps.push(`🌐 Navigating to ${action.url}...`);
                            await page.goto(action.url, { waitUntil: 'networkidle2' });
                        }
                        break;
                    case 'click':
                        if (action.selector) {
                            steps.push(`🖱️ Clicking ${action.selector}...`);
                            await page.waitForSelector(action.selector, { timeout: 10000, visible: true });

                            // Human-like mouse move
                            const element = await page.$(action.selector);
                            const box = await element.boundingBox();
                            if (box) {
                                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                            }
                            await page.click(action.selector);
                        }
                        break;
                    case 'type':
                        if (action.selector && action.value) {
                            steps.push(`⌨️ Typing into ${action.selector}...`);
                            await page.waitForSelector(action.selector, { timeout: 10000, visible: true });
                            await page.click(action.selector, { clickCount: 3 }); // Select all text
                            await page.keyboard.press('Backspace');

                            // Human-like typing
                            for (const char of action.value) {
                                await page.keyboard.type(char, { delay: 30 + Math.random() * 50 });
                            }

                            // If value ends with \n or it's a search, press Enter automatically
                            if (action.value.endsWith('\n') || goal.toLowerCase().includes('search')) {
                                await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
                                await page.keyboard.press('Enter');
                                steps.push('⌨️ Pressed Enter');
                                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => { });
                            }
                        }
                        break;
                    case 'press':
                        if (action.key) {
                            steps.push(`⌨️ Pressing ${action.key}...`);
                            await page.keyboard.press(action.key);
                            if (action.key === 'Enter') {
                                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => { });
                            }
                        }
                        break;
                    case 'wait':
                        const ms = action.timeout || 2000;
                        steps.push(`⏳ Waiting ${ms}ms...`);
                        await new Promise(r => setTimeout(r, ms));
                        break;
                    case 'screenshot':
                        screenshot = await page.screenshot({ encoding: 'base64', fullPage: false });
                        steps.push('📸 Captured state');
                        break;
                    case 'scroll':
                        steps.push('📜 Scrolling...');
                        await page.evaluate(() => window.scrollBy(0, 500));
                        break;
                }
            } catch (err: any) {
                steps.push(`⚠️ Failed: ${action.type} - ${err.message}`);
                console.error(`Action ${action.type} failed`, err);
            }
        }

        // Finalize state
        if (!screenshot) {
            screenshot = await page.screenshot({ encoding: 'base64' });
        }

        try {
            const title = await page.title();
            const currentUrl = page.url();
            const text = await page.evaluate(() => document.body.innerText.substring(0, 1500));

            // Bot detection check
            let botStatus = "CLEAN";
            if (title.toLowerCase().includes("captcha") || title.toLowerCase().includes("robot") || text.toLowerCase().includes("please verify you are a human")) {
                botStatus = "BLOCK_DETECTED";
            }

            extractedData = { title, url: currentUrl, text, botStatus };
        } catch (e) { }

        await browser.close();
        steps.push('✅ Cycle complete');

        return NextResponse.json({
            success: true,
            steps,
            screenshot,
            data: extractedData
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, steps: [`❌ Fatal: ${error.message}`] }, { status: 500 });
    }
}

