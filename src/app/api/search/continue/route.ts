import { NextRequest, NextResponse } from 'next/server';
import { UALSearchService } from '@/lib/ual/ual-search-service';

export async function POST(req: NextRequest) {
    try {
        const { session_id, user_input } = await req.json();

        if (!session_id || !user_input) {
            return NextResponse.json({ error: 'Session ID and user input are required' }, { status: 400 });
        }

        const searchService = new UALSearchService();
        const state = await searchService.getSearchState(session_id);

        if (!state) {
            return NextResponse.json({ error: 'Search state not found for this session' }, { status: 404 });
        }

        // Store user input via service
        await searchService.saveUserInput(state.id, user_input);

        // Continue to RUN_SEARCH via service
        await searchService.updateSearchState(state.id, { currentPhase: 'RUN_SEARCH' });

        const refinedQuery = `${state.initialQuery} ${user_input}`;
        const results = await searchService.runSearch(state.id, refinedQuery);
        const answer = await searchService.generateAnswer(state.id, refinedQuery, results);

        // Update state to DONE via service
        await searchService.updateSearchState(state.id, { currentPhase: 'DONE' });

        const sources = results.map(r => ({ title: r.title, url: r.url }));

        return NextResponse.json({
            phase: 'ANSWER_READY',
            answer: answer.answerText,
            answer_id: answer.id,
            summary: answer.summaryText,
            sources: sources
        });
    } catch (error: any) {
        console.error('Error in /api/search/continue:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
