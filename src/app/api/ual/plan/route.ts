/**
 * AGI-S UAL™ - AI Action Planning API
 * Copyright © 2024-2025 AGI-S Technologies
 * 
 * Uses Liquid Intelligence™ to plan web automation actions
 */

import { NextRequest, NextResponse } from 'next/server';
import type { WebAction } from '@/lib/universal-action-layer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// MANUAL ENV LOADING FIX
// If process.env.GROQ_API_KEY is missing, try to load it directly from .env.local
if (!process.env.GROQ_API_KEY) {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = dotenv.parse(fs.readFileSync(envPath));
            if (envConfig.GROQ_API_KEY) {
                process.env.GROQ_API_KEY = envConfig.GROQ_API_KEY;
                console.log('[UAL Repair] Manually loaded GROQ_API_KEY from .env.local');
            }
        }
    } catch (e) {
        console.error('[UAL Repair] Failed to load .env.local:', e);
    }
}

// Groq API helper (copied from actions.ts to avoid import issues)
async function callGroqForPlanning(messages: Array<{ role: string; content: string }>): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY is missing. Please create .env.local with GROQ_API_KEY=YOUR_KEY");
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
    let goal = '';
    let context: any = {};

    try {
        const body = await req.json();
        goal = body.goal;
        context = body.context;

        // DEBUG: Check for API Key (Masked)
        const hasKey = !!process.env.GROQ_API_KEY;
        const keyPrefix = hasKey ? process.env.GROQ_API_KEY?.substring(0, 4) : 'NONE';
        console.log(`[UAL Planning] API Key Status: ${hasKey ? 'Present' : 'MISSING'} (Prefix: ${keyPrefix})`);

        if (!hasKey) {
            throw new Error("Missing GROQ_API_KEY environment variable. We tried to load it but failed.");
        }

        const prompt = `You are a "Heavy Scale" Autonomous Agent Planner (Level 5 Intelligence).
Your goal is to convert a user objective into a robust sequence of web actions based on the current page state.

User Objective: "${goal}"

CURRENT PAGE STATE:
- URL: "${context?.url || 'about:blank'}"
- Title: "${context?.title || 'Unknown'}"
- Text Snippet: "${context?.text || 'No content visible'}"
- Bot Status: "${context?.botStatus || 'CLEAN'}"

STRICT OUTPUT FORMAT (JSON OBJECT ONLY):
{
  "status": "CONTINUE" | "COMPLETED",
  "reasoning": "Brief explanation of why the goal is or isn't met",
  "answer": "The final extracted answer (ONLY if status is COMPLETED. e.g. 'The price of BTC is $65,432')",
  "actions": [
    { "type": "navigate", "url": "..." },
    { "type": "type", "selector": "input[name='q']", "value": "..." },
    { "type": "press", "key": "Enter" },
    { "type": "screenshot" }
  ]
}

CORE PHILOSOPHY:
1. BYPASS BLOCKS: If Bot Status is "BLOCK_DETECTED", DO NOT try the same site again. Switch to an alternative immediately (e.g. if Google is blocked, try Bing or DuckDuckGo).
2. EXTRACT ANSWER: When status is "COMPLETED", the "answer" field MUST contain the specific data the user asked for (price, news, etc.) extracted from the text snippet.
3. FLEXIBILITY: If the goal specifies a site but it blocks us, find the data anywhere.
4. SEARCH PATTERNS: Prefer 'type' then 'press' Enter for search.

CRITICAL: Return ONLY the JSON Object. No markdown. No text outside JSON.`;

        console.log(`[UAL Planner] Sending Heavy Prompt to Groq...`);

        const response = await callGroqForPlanning([
            {
                role: 'system',
                content: 'You are an advanced Autonomous Web Agent. You output ONLY valid JSON action sequences.'
            },
            { role: 'user', content: prompt }
        ]);

        console.log(`[UAL Planner] Groq Response: ${response.substring(0, 200)}...`);

        // Parse the AI response with cleaning
        let plan: { status: string; actions: WebAction[]; reasoning?: string; answer?: string };
        try {
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                plan = JSON.parse(jsonMatch[0]);
            } else {
                plan = JSON.parse(cleanResponse);
            }
        } catch (parseError) {
            console.error('[UAL Planner] JSON Parse Error:', parseError);
            plan = { status: 'CONTINUE', actions: [] }; // Force empty to trigger fallback
        }

        let actions = plan.actions || [];

        // INTELLIGENT FALLBACK FOR EMPTY PLANS
        if (actions.length === 0 && plan.status !== 'COMPLETED') {
            console.warn('[UAL Planner] Empty plan generated. Triggering intelligent fallback.');

            // Construct a search query fallback
            const fallbackUrl = context?.url || `https://www.google.com/search?q=${encodeURIComponent(goal)}`;
            actions = [
                { type: 'navigate', url: fallbackUrl },
                { type: 'wait', timeout: 3000 },
                { type: 'screenshot' }
            ];
            plan.status = 'CONTINUE';
        }

        return NextResponse.json({
            actions,
            status: plan.status,
            reasoning: plan.reasoning,
            answer: plan.answer,
            raw: response
        });

    } catch (error: any) {
        console.error('[UAL Planner] CRITICAL FAILURE:', error);

        // UNIVERSAL FALLBACK - If the Brain fails, use the Reflex.
        // This ensures the user ALWAYS gets a result (e.g. a Google Search).
        const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(goal)}`;
        const fallbackActions = [
            { type: 'navigate', url: fallbackUrl },
            { type: 'wait', timeout: 5000 },
            { type: 'screenshot' }
        ];

        return NextResponse.json({
            actions: fallbackActions,
            error: error.message || "Planner Brain Offline - Using Reflex",
            debug_info: "Switched to fallback search due to API error"
        }, { status: 200 });
    }
}
