export type UALPhase = 'INIT' | 'ASK_USER' | 'RUN_SEARCH' | 'DONE';

export interface UALSession {
    id: string;
    userId?: string;
    createdAt: number;
    updatedAt: number;
}

export interface UALSearchState {
    id: string;
    sessionId: string;
    initialQuery: string;
    currentPhase: UALPhase;
    createdAt: number;
    updatedAt: number;
}

export interface UALPrompt {
    id: string;
    searchStateId: string;
    promptText: string;
    createdAt: number;
}

export interface UALUserInput {
    id: string;
    searchStateId: string;
    inputText: string;
    createdAt: number;
}

export interface UALSearchQuery {
    id: string;
    searchStateId: string;
    queryText: string;
    createdAt: number;
}

export interface UALSearchResult {
    id: string;
    searchStateId: string;
    searchQueryId: string;
    rank: number;
    title: string;
    url: string;
    snippet: string;
    fullText?: string;
    sourceDomain: string;
    publishedDate?: string;
}

export interface UALChunk {
    id: string;
    searchStateId: string;
    searchResultId: string;
    text: string;
    embeddingVector?: number[];
}

export interface UALAnswer {
    id: string;
    searchStateId: string;
    answerText: string;
    summaryText: string;
    createdAt: number;
}

export interface UALAnswerSource {
    id: string;
    answerId: string;
    searchResultId: string;
    evidenceSpan?: string;
}
