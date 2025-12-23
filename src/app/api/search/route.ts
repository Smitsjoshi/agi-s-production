import { NextRequest, NextResponse } from 'next/server';
import { UALSearchService } from '@/lib/ual/ual-search-service';

export async function POST(req: NextRequest) {
    try {
        const { session_id, query } = await req.json();

        if (!session_id || !query) {
            return NextResponse.json({ error: 'Session ID and query are required' }, { status: 400 });
        }

        const searchService = new UALSearchService();

        // 1. Insert new search_state row
        const state = await searchService.createSearchState(session_id, query);

        // 2. Decide next phase
        const nextPhase = await searchService.decideNextPhase(state);

        if (nextPhase === 'ASK_USER') {
            const promptText = await searchService.generateClarification(state);

            // Store prompt via service
            await searchService.savePrompt(state.id, promptText);

            // Update state via service
            await searchService.updateSearchState(state.id, { currentPhase: 'ASK_USER' });

            return NextResponse.json({
                phase: 'ASK_USER',
                prompt: promptText
            });
        } else {
            // RUN_SEARCH
            await searchService.updateSearchState(state.id, { currentPhase: 'RUN_SEARCH' });

            const results = await searchService.runSearch(state.id, query);
            const answer = await searchService.generateAnswer(state.id, query, results);

            // Update state to DONE via service
            await searchService.updateSearchState(state.id, { currentPhase: 'DONE' });

            // Get sources for response
            const sources = results.map(r => ({ title: r.title, url: r.url }));

            return NextResponse.json({
                phase: 'ANSWER_READY',
                answer: answer.answerText,
                answer_id: answer.id,
                summary: answer.summaryText,
                sources: sources
            });
        }
    } catch (error: any) {
        console.error('Error in /api/search:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
