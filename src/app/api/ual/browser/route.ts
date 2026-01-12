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
                result = await engine.navigate(url);
                break;

            case 'execute':
                // Pass the raw action object to the engine
                result = await engine.executeAction({ type: body.type, selector, value, url: body.url, key });
                break;

            case 'launch':
                // Explicit launch trigger
                await engine.launch();
                result = { success: true, message: 'Browser launched' };
                break;

            case 'observe':
                result = await engine.observe();
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ ...result });

    } catch (error: any) {
        console.error('[Browser API] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    // Screenshot endpoint for polling
    try {
        const engine = BrowserEngine.getInstance();
        const obs = await engine.observe();

        if (!obs.screenshot) throw new Error("No screenshot available");

        const buffer = Buffer.from(obs.screenshot, 'base64');

        return new NextResponse(buffer as any, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Browser not active or no screenshot' }, { status: 404 });
    }
}
