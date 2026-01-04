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

        const prompt = `You are an AUTONOMOUS WEB AGENT PLANNER.
Your job: Convert user goals into EXECUTABLE browser actions.

USER GOAL: "${goal}"

CURRENT STATE:
URL: ${context?.url || 'about:blank'}
Title: ${context?.title || 'Unknown'}
Page Text: ${context?.text?.substring(0, 300) || 'Empty page'}

═══════════════════════════════════════════════════════════════
CRITICAL RULE - READ THIS CAREFULLY:
═══════════════════════════════════════════════════════════════

When you generate a "type" action, you MUST include the "value" field.
The "value" is THE ACTUAL TEXT TO TYPE.

WRONG ❌:
{ "type": "type", "selector": "input[name='q']" }  // NO VALUE = BROKEN

CORRECT ✅:
{ "type": "type", "selector": "input[name='q']", "value": "green nike shoes amazon" }

═══════════════════════════════════════════════════════════════

OUTPUT FORMAT (JSON ONLY):
{
  "status": "CONTINUE",
  "reasoning": "Why this plan achieves the goal",
  "actions": [
    { "type": "navigate", "url": "https://www.google.com" },
    { "type": "type", "selector": "input[name='q']", "value": "THE SEARCH QUERY HERE" },
    { "type": "press", "key": "Enter" }
  ]
}

EXAMPLES FOR COMMON GOALS:

Goal: "find green nike shoes from amazon"
{
  "status": "CONTINUE",
  "reasoning": "Search Google for Amazon listings",
  "actions": [
    { "type": "type", "selector": "input[name='q']", "value": "green nike shoes amazon" },
    { "type": "press", "key": "Enter" }
  ]
}

Goal: "what is the price of bitcoin"
{
  "status": "CONTINUE", 
  "reasoning": "Search for BTC price",
  "actions": [
    { "type": "navigate", "url": "https://www.google.com" },
    { "type": "type", "selector": "input[name='q']", "value": "bitcoin price usd" },
    { "type": "press", "key": "Enter" }
  ]
}

YOUR TASK NOW:
Generate actions for: "${goal}"

Remember: EVERY "type" action needs a "value". No exceptions.

Return ONLY the JSON object.`;

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
