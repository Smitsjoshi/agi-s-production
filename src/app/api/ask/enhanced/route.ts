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
): Promise<{ summary: string; standard: string; technical: string }> {
    const prompts = {
        quick: `You are AGI-S. Respond to: ${query}. 
               Return a JSON object with three versions of your answer:
               1. "summary": ELI5, bullet points, ultra-concise.
               2. "standard": Balanced, professional, clear.
               3. "technical": Deep, analytical, including edge cases and high-level reasoning.
               
               Format: {"summary": "...", "standard": "...", "technical": "..."}`,
        deep: `Provide a DEEP, comprehensive analysis of: ${query}.
               Return a JSON object with three versions of your analysis:
               1. "summary": High-level executive summary.
               2. "standard": Full comprehensive analysis with background and implications.
               3. "technical": Exhaustive technical breakdown with multi-source synthesis logic.
               
               Format: {"summary": "...", "standard": "...", "technical": "..."}`,
        devils: `Play DEVIL'S ADVOCATE for: ${query}.
               Return a JSON object with three versions of your challenge:
               1. "summary": The core contrarian argument.
               2. "standard": A balanced but critical counter-perspective.
               3. "technical": A rigorous forensic deconstruction of the primary assumptions.
               
               Format: {"summary": "...", "standard": "...", "technical": "..."}`,
        data: `Provide a DATA-DRIVEN analysis of: ${query}.
               Return a JSON object with three versions:
               1. "summary": The most important stats and trends.
               2. "standard": Full evidence-based report.
               3. "technical": Detailed statistical analysis, methodology discussion, and raw metric insights.
               
               Format: {"summary": "...", "standard": "...", "technical": "..."}`,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile', // Use the strongest model for triple-generation
            messages: [
                {
                    role: 'system',
                    content: 'You are AGI-S. You MUST return ONLY valid JSON. Your response must be an object with "summary", "standard", and "technical" keys. Use markdown inside the strings.',
                },
                {
                    role: 'user',
                    content: prompts[type],
                },
            ],
            temperature: 0.1, // Low temperature for consistent JSON
            response_format: { type: "json_object" },
            max_tokens: 2000,
        }),
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    try {
        return JSON.parse(content);
    } catch (e) {
        return {
            summary: content,
            standard: content,
            technical: content
        };
    }
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
