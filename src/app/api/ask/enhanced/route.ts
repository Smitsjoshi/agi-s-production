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
                videos: await searchVideos(query),
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
        quick: `Respond to: ${query}. 
               Return a JSON object with three IDENTICAL top-level keys but VASTLY DIFFERENT content:
               1. "summary": ELI5 (Explain Like I'm 5). Use ultra-simple language, stick to one or two short bullet points. No jargon.
               2. "standard": Balanced professional response. Clear, informative, and well-structured.
               3. "technical": Expert/PhD level. Use high-level terminology, discuss internal mechanisms, edge cases, and architectural implications.
               
               Format: {"summary": "...", "standard": "...", "technical": "..."}`,
        deep: `Provide a DEEP analysis of: ${query}.
               Return a JSON object with three VASTLY DIFFERENT levels of depth:
               1. "summary": Executive high-level summary. Focus only on the "bottom line".
               2. "standard": Comprehensive analysis. Includes background, key drivers, and consequences.
               3. "technical": Forensic-level deconstruction. Discusses underlying data structures, theoretical frameworks, and low-level specifications.
               
               Format: {"summary": "...", "standard": "...", "technical": "..."}`,
        devils: `Play DEVIL'S ADVOCATE for: ${query}.
               Return a JSON object with three VASTLY DIFFERENT critical intensities:
               1. "summary": The single biggest flaw or counter-argument in one sentence.
               2. "standard": A balanced but firm critical perspective challenging the main premise.
               3. "technical": A rigorous analytical assault on the logical consistency and structural weaknesses of the idea.
               
               Format: {"summary": "...", "standard": "...", "technical": "..."}`,
        data: `Provide a DATA-DRIVEN analysis of: ${query}.
               Return a JSON object with three VASTLY DIFFERENT data granularities:
               1. "summary": The most critical KPIs/numbers only.
               2. "standard": Full evidence-based report with trends and correlations.
               3. "technical": Detailed raw metric breakdown, statistical significance discussion, and methodology audit.
               
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
    // Highly relevant mock search to demonstrate Super Page capabilities
    // In a real production app, this would be Brave/Google Search API
    return [
        {
            title: `${query} - Expert Overview`,
            url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
            snippet: `In-depth analysis and comprehensive background on ${query}. Technical specifications and historical context included.`
        },
        {
            title: `Latest Trends in ${query}`,
            url: `https://www.nature.com/search?q=${query}`,
            snippet: `Current research papers and breakthrough developments regarding ${query} in the scientific community.`
        }
    ];
}

async function searchVideos(query: string): Promise<Array<{
    title: string;
    description: string;
    videoId: string;
    thumbnail: string;
}>> {
    // Generate relevant YouTube ideas using AI
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return [];

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
                        role: 'system',
                        content: 'You are a video research assistant. Find 3 highly relevant, high-quality educational YouTube video topics/titles for the given query. Return ONLY a JSON array of objects with "title", "description", "videoId" (make up a plausible-looking 11-char ID if unknown), and "thumbnail" (use https://img.youtube.com/vi/[videoId]/0.jpg).',
                    },
                    {
                        role: 'user',
                        content: `Query: ${query}`,
                    },
                ],
                temperature: 0.1,
                response_format: { type: "json_object" },
            }),
        });

        const data = await response.json();
        const content = JSON.parse(data.choices[0]?.message?.content || '{"videos": []}');
        return content.videos || [];
    } catch (e) {
        return [];
    }
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
