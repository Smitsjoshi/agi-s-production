import { adminDb, isInitialized } from '@/lib/firebase/admin';
import { nanoid } from 'nanoid';
import { UALSearchState, UALPhase, UALSearchResult, UALChunk, UALAnswer, UALAnswerSource } from './search-types';
import { GoogleGenerativeAI } from "@google/generative-ai";

// In-memory fallback for non-firebase environments
const memoryDb: Record<string, any> = {
    search_states: {},
    search_results: {},
    answers: {},
    prompts: {},
    user_inputs: {},
    answer_sources: [],
};

export class UALSearchService {
    private perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    private googleGenAiKey = process.env.GOOGLE_GENAI_API_KEY;

    private async save(collection: string, id: string, data: any) {
        if (isInitialized && adminDb) {
            try {
                await adminDb.collection(collection).doc(id).set(data);
                return;
            } catch (error) {
                console.error(`Firebase save error in ${collection}:`, error);
                // Fallback to memory
            }
        }

        if (!memoryDb[collection]) memoryDb[collection] = {};
        memoryDb[collection][id] = data;
    }

    private async update(collection: string, id: string, data: any) {
        if (isInitialized && adminDb) {
            try {
                await adminDb.collection(collection).doc(id).update(data);
                return;
            } catch (error) {
                console.error(`Firebase update error in ${collection}:`, error);
                // Fallback to memory
            }
        }

        if (memoryDb[collection] && memoryDb[collection][id]) {
            memoryDb[collection][id] = { ...memoryDb[collection][id], ...data };
        }
    }

    private async add(collection: string, data: any) {
        if (isInitialized && adminDb) {
            try {
                const docRef = await adminDb.collection(collection).add(data);
                return docRef.id;
            } catch (error) {
                console.error(`Firebase add error in ${collection}:`, error);
                // Fallback to memory
            }
        }

        if (!memoryDb[collection]) memoryDb[collection] = [];
        if (Array.isArray(memoryDb[collection])) {
            memoryDb[collection].push(data);
        } else {
            const id = nanoid();
            memoryDb[collection][id] = data;
            return id;
        }
        return nanoid();
    }

    private async getLatestBySession(sessionId: string): Promise<any | null> {
        if (isInitialized && adminDb) {
            try {
                const snapshot = await adminDb.collection('search_states')
                    .where('sessionId', '==', sessionId)
                    .orderBy('createdAt', 'desc')
                    .limit(1)
                    .get();
                if (!snapshot.empty) return snapshot.docs[0].data();
            } catch (error) {
                console.error(`Firebase query error in search_states:`, error);
                // Fallback to memory
            }
        }

        const states = Object.values(memoryDb.search_states) as UALSearchState[];
        const filtered = states.filter(s => s.sessionId === sessionId);
        if (filtered.length === 0) return null;
        return filtered.sort((a, b) => b.createdAt - a.createdAt)[0];
    }

    async createSearchState(sessionId: string, query: string): Promise<UALSearchState> {
        const id = nanoid();
        const now = Date.now();
        const state: UALSearchState = {
            id,
            sessionId,
            initialQuery: query,
            currentPhase: 'INIT',
            createdAt: now,
            updatedAt: now,
        };

        await this.save('search_states', id, state);
        return state;
    }

    async createSession(): Promise<string> {
        const sessionId = nanoid();
        const now = Date.now();
        await this.save('sessions', sessionId, {
            id: sessionId,
            createdAt: now,
            updatedAt: now,
        });
        return sessionId;
    }

    async getSearchState(sessionId: string): Promise<UALSearchState | null> {
        return this.getLatestBySession(sessionId);
    }

    async updateSearchState(id: string, updates: Partial<UALSearchState>) {
        await this.update('search_states', id, { ...updates, updatedAt: Date.now() });
    }

    async savePrompt(stateId: string, promptText: string) {
        await this.add('prompts', {
            searchStateId: stateId,
            promptText,
            createdAt: Date.now(),
        });
    }

    async saveUserInput(stateId: string, inputText: string) {
        await this.add('user_inputs', {
            searchStateId: stateId,
            inputText,
            createdAt: Date.now(),
        });
    }

    async saveFeedback(answerId: string, feedback: 'up' | 'down') {
        await this.update('answers', answerId, {
            feedback: feedback,
            feedbackAt: Date.now(),
        });
    }

    async getAnswers(stateId: string): Promise<UALAnswer[]> {
        if (isInitialized && adminDb) {
            try {
                const snapshot = await adminDb.collection('answers')
                    .where('searchStateId', '==', stateId)
                    .orderBy('createdAt', 'desc')
                    .get();
                return snapshot.docs.map((d: any) => d.data() as UALAnswer);
            } catch (error) {
                console.error(`Firebase query error in answers:`, error);
                // Fallback
            }
        }

        const answers = Object.values(memoryDb.answers) as UALAnswer[];
        return answers.filter(a => a.searchStateId === stateId).sort((a, b) => b.createdAt - a.createdAt);
    }

    async getResults(stateId: string): Promise<UALSearchResult[]> {
        if (isInitialized && adminDb) {
            try {
                const snapshot = await adminDb.collection('search_results')
                    .where('searchStateId', '==', stateId)
                    .orderBy('rank', 'asc')
                    .get();
                return snapshot.docs.map((d: any) => d.data() as UALSearchResult);
            } catch (error) {
                console.error(`Firebase query error in search_results:`, error);
                // Fallback
            }
        }

        const results = Object.values(memoryDb.search_results) as UALSearchResult[];
        return results.filter(r => r.searchStateId === stateId).sort((a, b) => a.rank - b.rank);
    }

    async decideNextPhase(state: UALSearchState, lastInput?: string): Promise<UALPhase> {
        const query = lastInput || state.initialQuery;

        // Use Gemini to decide if query needs clarification
        if (!this.googleGenAiKey) return query.split(' ').length < 3 ? 'ASK_USER' : 'RUN_SEARCH';

        try {
            const genAI = new GoogleGenerativeAI(this.googleGenAiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `Analyze this search query: "${query}". 
            Is it too short or ambiguous to provide a high-quality augmented search result? 
            Respond with only "ASK_USER" if it needs clarification, or "RUN_SEARCH" if it is clear enough.`;

            const result = await model.generateContent(prompt);
            const decision = result.response.text().trim();

            return decision.includes('ASK_USER') ? 'ASK_USER' : 'RUN_SEARCH';
        } catch (error) {
            console.error('Error in decision logic:', error);
            return query.split(' ').length < 3 ? 'ASK_USER' : 'RUN_SEARCH';
        }
    }

    async generateClarification(state: UALSearchState): Promise<string> {
        if (!this.googleGenAiKey) return `Could you please provide more details about "${state.initialQuery}"?`;

        try {
            const genAI = new GoogleGenerativeAI(this.googleGenAiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `The user asked: "${state.initialQuery}". This is too ambiguous. 
            Generate a short, helpful clarifying question to understand their intent better.`;

            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            return `Could you please provide more details about "${state.initialQuery}"?`;
        }
    }

    async runSearch(stateId: string, query: string): Promise<UALSearchResult[]> {
        if (!this.perplexityApiKey) {
            console.warn('PERPLEXITY_API_KEY missing, using mock search results');
            return this.getMockResults(stateId);
        }

        try {
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.perplexityApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-sonar-small-128k-online',
                    messages: [{ role: 'user', content: query }],
                    max_tokens: 1000,
                })
            });

            if (!response.ok) throw new Error('Perplexity API error');
            const data = await response.json();

            // Extract sources/citations if available
            const content = data.choices[0].message.content;
            const citations = data.citations || [];

            const results: UALSearchResult[] = citations.map((url: string, index: number) => ({
                id: nanoid(),
                searchStateId: stateId,
                searchQueryId: nanoid(),
                rank: index + 1,
                title: `Source ${index + 1}`,
                url: url,
                snippet: `Result from ${url}`,
                fullText: content,
                sourceDomain: new URL(url).hostname,
            }));

            // Handle case where no citations are returned but we have content
            if (results.length === 0) {
                results.push({
                    id: nanoid(),
                    searchStateId: stateId,
                    searchQueryId: nanoid(),
                    rank: 1,
                    title: "Perplexity AI",
                    url: "https://perplexity.ai",
                    snippet: "Search response from Perplexity AI",
                    fullText: content,
                    sourceDomain: "perplexity.ai",
                });
            }

            for (const res of results) {
                await this.save('search_results', res.id, res);
            }

            return results;
        } catch (error) {
            console.error('Search error:', error);
            return this.getMockResults(stateId);
        }
    }

    private getMockResults(stateId: string): UALSearchResult[] {
        return [
            {
                id: nanoid(),
                searchStateId: stateId,
                searchQueryId: nanoid(),
                rank: 1,
                title: "Mock Search Result",
                url: "https://example.com/mock",
                snippet: "This is a mock result because API keys might be missing.",
                fullText: "Mock full text content for RAG pipeline testing.",
                sourceDomain: "example.com",
            }
        ];
    }

    async generateAnswer(stateId: string, query: string, results: UALSearchResult[]): Promise<UALAnswer> {
        const id = nanoid();
        const now = Date.now();

        if (!this.googleGenAiKey) {
            return {
                id,
                searchStateId: stateId,
                answerText: "Mock answer: Google GenAI key is missing. Using search context directly.",
                summaryText: "Mock summary.",
                createdAt: now,
            };
        }

        try {
            const genAI = new GoogleGenerativeAI(this.googleGenAiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const context = results.map((r, i) => `[${i + 1}] Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`).join('\n\n');

            const prompt = `System: You are an expert researcher. Use only the provided context to answer the user's question.
            Answer in clear steps. Attach citations like [1], [2] to factual sentences.
            
            User Question: "${query}"
            
            Context:
            ${context}
            
            Respond with a detailed "answer" and a very short "summary" (max 20 words).`;

            const result = await model.generateContent(prompt);
            const fullResponse = result.response.text();

            let answerText = fullResponse;
            let summaryText = "";

            if (fullResponse.toLowerCase().includes("summary:")) {
                const parts = fullResponse.split(/summary:/i);
                answerText = parts[0].trim();
                summaryText = parts[1].trim();
            } else {
                summaryText = answerText.substring(0, 100) + "...";
            }

            const answer: UALAnswer = {
                id,
                searchStateId: stateId,
                answerText,
                summaryText,
                createdAt: now,
            };

            await this.save('answers', id, answer);

            for (let i = 0; i < results.length; i++) {
                if (answerText.includes(`[${i + 1}]`)) {
                    await this.add('answer_sources', {
                        answerId: id,
                        searchResultId: results[i].id,
                    });
                }
            }

            return answer;
        } catch (error) {
            console.error('Answer generation error:', error);
            return {
                id,
                searchStateId: stateId,
                answerText: "Error generating answer. Please check logs.",
                summaryText: "Error occurred.",
                createdAt: now,
            };
        }
    }
}
