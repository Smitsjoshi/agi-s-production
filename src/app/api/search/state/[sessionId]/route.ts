import { NextRequest, NextResponse } from 'next/server';
import { UALSearchService } from '@/lib/ual/ual-search-service';

export async function GET(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        const searchService = new UALSearchService();
        const stateData = await searchService.getSearchState(sessionId);

        if (!stateData) {
            return NextResponse.json({ error: 'Search state not found' }, { status: 404 });
        }

        const answers = await searchService.getAnswers(stateData.id);
        const results = await searchService.getResults(stateData.id);

        return NextResponse.json({
            state: stateData,
            answers: answers,
            results: results
        });
    } catch (error: any) {
        console.error('Error in GET /api/search/state:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
