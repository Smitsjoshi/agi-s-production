import { NextRequest, NextResponse } from 'next/server';
import { BrowserEngine } from '@/lib/ual/browser-engine';

// Prevent Next.js from caching this route as it controls live state
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, url, selector, value, key } = body;
        const engine = BrowserEngine.getInstance();

        // Ensure browser is running
        await engine.launch();

        let result: any = {};

        switch (action) {
            case 'navigate':
                if (!url) return NextResponse.json({ error: 'URL required for navigation' }, { status: 400 });
                const pageInfo = await engine.navigate(url);
                result = { message: 'Navigated successfully', ...pageInfo };
                break;

            case 'execute':
                // Pass the raw action object to the engine
                await engine.executeAction({ type: body.type, selector, value, key });
                const screenshotBuffer = await engine.getScreenshot();
                result = {
                    message: 'Action executed',
                    screenshot: screenshotBuffer.toString('base64')
                };
                break;

            case 'launch':
                // Explicit launch trigger
                await engine.launch();
                result = { message: 'Browser launched' };
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true, ...result });

    } catch (error: any) {
        console.error('[Browser API] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    // Screenshot endpoint for polling
    try {
        const engine = BrowserEngine.getInstance();
        const screenshot = await engine.getScreenshot();

        return new NextResponse(screenshot as any, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error: any) {
        // If no browser open, return a placeholder or 404
        return NextResponse.json({ error: 'Browser not active' }, { status: 404 });
    }
}
