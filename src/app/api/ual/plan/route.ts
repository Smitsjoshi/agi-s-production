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
    try {
        const { goal, context } = await req.json();

        // DEBUG: Check for API Key (Masked)
        const hasKey = !!process.env.GROQ_API_KEY;
        const keyPrefix = hasKey ? process.env.GROQ_API_KEY?.substring(0, 4) : 'NONE';
        console.log(`[UAL Planning] API Key Status: ${hasKey ? 'Present' : 'MISSING'} (Prefix: ${keyPrefix})`);

        if (!hasKey) {
            throw new Error("Missing GROQ_API_KEY environment variable. We tried to load it but failed.");
        }

        const prompt = `You are a "Heavy Scale" Autonomous Agent Planner (Level 5 Intelligence).
Your goal is to understand ANY user request and convert it into a robust, fault-tolerant sequence of web actions.

User Goal: "${goal}"
Context URL: "${context?.url || 'NONE'}"

CORE PHILOSOPHY:
- THINK LIKE A HUMAN: How would a human solve this?
- ROBUSTNESS: Websites are slow. Add 'wait' steps. Use specific selectors.
- ADAPTABILITY: If a specific URL isn't given, INFER it (e.g., "Check crypto" -> "https://coinmarketcap.com").

REQUIRED OUTPUT FORMAT (JSON ARRAY ONLY):
[
  { "type": "navigate", "url": "..." },
  { "type": "wait", "timeout": 3000 },
  { "type": "type", "selector": "input[name='q']", "value": "..." },
  { "type": "click", "selector": "..." },
  { "type": "screenshot" }
]

SCENARIOS:
1. SEARCH: Navigate to Google/Bing -> Type Query -> Click Search -> Wait -> Screenshot.
2. DIRECT: Navigate to URL -> Wait -> Screenshot.
3. SHOPPING: Navigate Amazon -> Type Item -> Click Search -> Click Product -> Wait -> Click "Add to Cart" -> Screenshot.
4. COMPLEX: Navigate -> Wait -> Click specific element -> Type -> Submit -> Wait -> Screenshot.

CRITICAL: Return ONLY the JSON Array. No markdown formatting. No text.`;

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
        let actions: WebAction[];
        try {
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);

            if (jsonMatch) {
                actions = JSON.parse(jsonMatch[0]);
            } else {
                actions = JSON.parse(cleanResponse);
            }
        } catch (parseError) {
            console.error('[UAL Planner] JSON Parse Error:', parseError);
            actions = []; // Force empty to trigger fallback
        }

        // INTELLIGENT FALLBACK FOR EMPTY PLANS
        if (!actions || actions.length === 0) {
            console.warn('[UAL Planner] Empty plan generated. Triggering intelligent fallback.');

            // Construct a search query fallback
            const fallbackUrl = context?.url || `https://www.google.com/search?q=${encodeURIComponent(goal)}`;
            actions = [
                { type: 'navigate', url: fallbackUrl },
                { type: 'wait', timeout: 3000 },
                { type: 'screenshot' }
            ];
        }

        return NextResponse.json({ actions, raw: response });

    } catch (error: any) {
        console.error('[UAL Planner] CRITICAL FAILURE:', error);

        // Return a valid JSON error response instead of 500 to keep UI alive
        return NextResponse.json({
            actions: [],
            error: error.message || "Unknown Planning Error",
            debug_info: "Check server logs for stack trace"
        }, { status: 200 }); // Return 200 so UI can handle the error gracefully
    }
}
