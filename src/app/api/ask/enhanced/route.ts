import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for Enhanced Ask Features
 * Generates multi-perspective answers with web search
 */

export async function POST(request: NextRequest) {
    try {
        const { query, mode, detailLevel } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'GROQ_API_KEY not configured' },
                { status: 500 }
            );
        }

        // Generate 4 perspectives in parallel
        const perspectives = await Promise.all([
            // 1. Quick Answer
            generatePerspective(query, 'quick', apiKey, detailLevel),
            // 2. Deep Analysis
            generatePerspective(query, 'deep', apiKey, detailLevel),
            // 3. Devil's Advocate
            generatePerspective(query, 'devils', apiKey, detailLevel),
            // 4. Data-Driven
            generatePerspective(query, 'data', apiKey, detailLevel),
        ]);

        // Web search (optional - can be added later)
        const webSources = await searchWeb(query);

        // Generate visual content if applicable
        const visualContent = await generateVisualContent(query);

        return NextResponse.json({
            success: true,
            data: {
                quick: perspectives[0],
                deep: perspectives[1],
                devils: perspectives[2],
                data: perspectives[3],
                webSources,
                visualContent,
            },
        });
    } catch (error: any) {
        console.error('Enhanced answer error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate enhanced answer' },
            { status: 500 }
        );
    }
}

async function generatePerspective(
    query: string,
    type: 'quick' | 'deep' | 'devils' | 'data',
    apiKey: string,
    detailLevel: number = 50
): Promise<string> {
    const expertise = detailLevel < 33 ? 'SIMPLIFIED (ELI5, no jargon, easy to understand)' :
        detailLevel < 66 ? 'BALANCED (Clear, informative, professional)' :
            'EXPERT (PhD level, technical, detailed, nuanced)';

    const prompts = {
        quick: `Expertise Level: ${expertise}\n\nGive a QUICK, concise answer (2-3 sentences max) to: ${query}`,
        deep: `Expertise Level: ${expertise}\n\nProvide a DEEP, comprehensive analysis of: ${query}\n\nInclude:\n- Background context\n- Multiple viewpoints\n- Implications\n- Examples`,
        devils: `Expertise Level: ${expertise}\n\nPlay DEVIL'S ADVOCATE for: ${query}\n\nChallenge the common view. Present the opposite perspective. Be contrarian but constructive.`,
        data: `Expertise Level: ${expertise}\n\nProvide a DATA-DRIVEN analysis of: ${query}\n\nInclude:\n- Statistics\n- Trends\n- Comparisons\n- Evidence-based insights`,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: type === 'quick' ? 'llama-3.1-8b-instant' : 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are AGI-S, an advanced AI assistant. Provide clear, accurate, and helpful responses.',
                },
                {
                    role: 'user',
                    content: prompts[type],
                },
            ],
            temperature: type === 'devils' ? 0.8 : 0.3,
            max_tokens: type === 'quick' ? 200 : 1000,
        }),
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
}

async function searchWeb(query: string): Promise<Array<{
    title: string;
    url: string;
    snippet: string;
}>> {
    // TODO: Integrate Brave Search API or web scraping
    // For now, return empty array
    // Future: Use Brave Search API (free tier)
    return [];
}

async function generateVisualContent(query: string): Promise<{
    diagram?: string;
    code?: string;
    image?: string;
} | null> {
    // Check if query is about code/technical topics
    const isTechnical = /code|program|function|algorithm|how.*work/i.test(query);

    if (!isTechnical) {
        return null;
    }

    // Generate simple mermaid diagram or code example
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'user',
                        content: `Generate a simple code example or mermaid diagram for: ${query}\n\nReturn ONLY the code/diagram, no explanations.`,
                    },
                ],
                temperature: 0.3,
                max_tokens: 500,
            }),
        });

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        // Check if it's a diagram or code
        if (content.includes('graph') || content.includes('flowchart')) {
            return { diagram: content };
        } else {
            return { code: content };
        }
    } catch (error) {
        console.error('Visual content generation error:', error);
        return null;
    }
}
