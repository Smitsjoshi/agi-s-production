import { NextRequest, NextResponse } from 'next/server';
import { UALSearchService } from '@/lib/ual/ual-search-service';

export async function POST(req: NextRequest) {
    try {
        const searchService = new UALSearchService();
        const sessionId = await searchService.createSession();
        return NextResponse.json({ session_id: sessionId });
    } catch (error: any) {
        console.error('Error creating session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
