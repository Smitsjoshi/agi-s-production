/**
 * AGI-S UAL™ - AI Action Planning API
 * Copyright © 2024-2025 AGI-S Technologies
 * 
 * Uses Liquid Intelligence™ to plan web automation actions
 */

import { NextRequest, NextResponse } from 'next/server';
import type { WebAction } from '@/lib/universal-action-layer';

// Groq API helper (copied from actions.ts to avoid import issues)
async function callGroqForPlanning(messages: Array<{ role: string; content: string }>): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not set");
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.3,
            max_tokens: 1000,
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
    try {
        const { goal, context } = await req.json();

        // DEBUG: Check for API Key (Masked)
        const hasKey = !!process.env.GROQ_API_KEY;
        const keyPrefix = hasKey ? process.env.GROQ_API_KEY?.substring(0, 4) : 'NONE';
        console.log(`[UAL Planning] API Key Status: ${hasKey ? 'Present' : 'MISSING'} (Prefix: ${keyPrefix})`);

        if (!hasKey) {
            throw new Error("Missing GROQ_API_KEY environment variable. Please check .env.local file.");
        }

        const prompt = `You are the Universal Action Layer (UAL)™ AI planner. 
Your job is to convert user goals into precise, complex web automation actions.

User Goal: "${goal}"
Target URL: "${context?.url || 'Not specified - YOU MUST DECIDE START URL'}"

INSTRUCTIONS:
1. If no Target URL is provided, you MUST start with a "navigate" action to the most appropriate website (e.g., google.com for searches, specific sites if mentioned).
2. Plan a complete sequence of actions to achieve the goal. Don't just stop at the landing page; try to fulfill the request.
3. Use specific selectors where possible, or robust generic ones.

Available actions:
- navigate: { type: "navigate", url: "https://..." }
- click: { type: "click", selector: "button.submit" } // CSS selector
- type: { type: "type", selector: "input#search", value: "text" }
- submit: { type: "click", selector: "form button[type=submit]" }
- scroll: { type: "scroll" }
- wait: { type: "wait", timeout: 2000 }
- screenshot: { type: "screenshot" }

Example 1 (Search):
Goal: "Find AI news"
[
  { "type": "navigate", "url": "https://google.com" },
  { "type": "type", "selector": "textarea[name='q']", "value": "latest AI news" },
  { "type": "click", "selector": "input[type='submit']" },
  { "type": "wait", "timeout": 2000 },
  { "type": "screenshot" }
]

Example 2 (Specific):
Goal: "Check Hacker News"
[
  { "type": "navigate", "url": "https://news.ycombinator.com" },
  { "type": "wait", "timeout": 1000 },
  { "type": "screenshot" }
]

Return ONLY the JSON array, no explanation.`;

        const response = await callGroqForPlanning([
            {
                role: 'system',
                content: 'You are UAL™ AI Planner. You convert goals into precise web automation actions. Always return valid JSON arrays.'
            },
            { role: 'user', content: prompt }
        ]);

        // Parse the AI response
        let actions: WebAction[];
        try {
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            // Try to extract JSON from the response
            const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                actions = JSON.parse(jsonMatch[0]);
            } else {
                actions = JSON.parse(cleanResponse);
            }
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw Response:', response);

            // Intelligent fallback based on goal
            const fallbackUrl = context?.url || (goal.toLowerCase().includes('news') ? 'https://news.google.com' : 'https://google.com');
            actions = [
                { type: 'navigate', url: fallbackUrl },
                { type: 'wait', timeout: 2000 },
                { type: 'screenshot' }
            ];
        }

        return NextResponse.json({ actions, raw: response });

    } catch (error: any) {
        console.error('UAL Planning Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
