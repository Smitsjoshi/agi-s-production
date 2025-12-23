import { NextRequest, NextResponse } from 'next/server';
import { UALSearchService } from '@/lib/ual/ual-search-service';

export async function POST(req: NextRequest) {
    try {
        const { answer_id, feedback } = await req.json(); // feedback: 'up' | 'down'

        if (!answer_id || !feedback) {
            return NextResponse.json({ error: 'Answer ID and feedback are required' }, { status: 400 });
        }

        const searchService = new UALSearchService();
        await searchService.saveFeedback(answer_id, feedback);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in feedback API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
