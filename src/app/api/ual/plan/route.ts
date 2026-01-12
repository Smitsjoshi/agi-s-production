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
    let history: any[] = [];

    try {
        const body = await req.json();
        goal = body.goal;
        context = body.context;
        history = body.history || [];

        // DEBUG: Check for API Key (Masked)
        const hasKey = !!process.env.GROQ_API_KEY;
        const keyPrefix = hasKey ? process.env.GROQ_API_KEY?.substring(0, 4) : 'NONE';
        console.log(`[UAL Planning] API Key Status: ${hasKey ? 'Present' : 'MISSING'} (Prefix: ${keyPrefix})`);

        if (!hasKey) {
            throw new Error("Missing GROQ_API_KEY environment variable. We tried to load it but failed.");
        }

        // Format history for the prompt
        const historyText = history.length > 0
            ? history.map((h, i) => `Step ${h.step}: ${JSON.stringify(h.actions)} -> Result: ${h.result || 'Unknown'}`).join('\n')
            : "No previous actions taken.";

        // DYNAMIC CLARIFICATION & BLACKLISTING
        // Check for blocked attempts and explicitly FORBID those domains
        let antiLoopInstruction = "";
        const blockedSteps = history.filter(h => JSON.stringify(h).includes("BLOCKED"));

        if (blockedSteps.length > 0) {
            // Extract domains from failed actions
            const forbiddenDomains = new Set<string>();
            blockedSteps.forEach(h => {
                if (h.actions && Array.isArray(h.actions)) {
                    h.actions.forEach((a: any) => {
                        if (a.url) {
                            try {
                                const hostname = new URL(a.url).hostname.replace('www.', '');
                                forbiddenDomains.add(hostname);
                            } catch (e) { /* ignore invalid urls */ }
                        }
                    });
                }
            });

            // Specific Hardcoded blocks we know about
            if (JSON.stringify(history).includes("coinbase.com")) forbiddenDomains.add("coinbase.com");

            const forbiddenList = Array.from(forbiddenDomains).join(', ');

            antiLoopInstruction = `
═══════════════════════════════════════════════════════════════
⛔ CRITICAL SECURITY OVERRIDE - ACTIVE BLOCKS DETECTED ⛔
═══════════════════════════════════════════════════════════════
The following domains have BLOCKED you: [ ${forbiddenList} ]

YOU ARE STRICTLY FORBIDDEN FROM NAVIGATING TO OR INTERACTING WITH:
${Array.from(forbiddenDomains).map(d => `- ${d} (and any subdomains)`).join('\n')}

STRATEGY OVERRIDE:
1. DO NOT attempt to bypass these blocks. You will fail.
2. NAVIGATE IMMEDIATELY to an alternative source.
   - Example: If coinbase.com is blocked, use coinmarketcap.com, binance.com, or google.com snippets.
3. If you are stuck on a blocked page, your NEXT action MUST be a 'navigate' to a SAFE domain.
`;
        }

        // Format the interactive elements for the planning brain
        const elementsText = context?.domTree && Array.isArray(context.domTree)
            ? context.domTree.map((el: any) => `- ${el.tag}${el.id ? '#' + el.id : ''} [role="${el.role || 'none'}"]: "${el.text || ''}" (Selector: ${el.selector || el.tag + (el.id ? '#' + el.id : '')})`).join('\n')
            : "No interactive elements detected yet.";

        const prompt = `You are an AUTONOMOUS WEB AGENT PLANNER.
Your job: Convert user goals into EXECUTABLE browser actions.

USER GOAL: "${goal}"

CURRENT STATE:
URL: ${context?.url || 'about:blank'}
Title: ${context?.title || 'Unknown'}
Page Content Snippet: ${context?.text?.substring(0, 500) || 'Empty page'}

INTERACTIVE ELEMENTS (Choose from these for 'click' or 'type' actions):
${elementsText}

ACTION HISTORY (What you have already done):
${historyText}

${antiLoopInstruction}

═══════════════════════════════════════════════════════════════
CRITICAL RULES - READ CAREFULLY:
═══════════════════════════════════════════════════════════════

1. DO NOT REPEAT FAILED ACTIONS. If you see an action in the HISTORY that didn't work (e.g. you are still on the same page), TRY SOMETHING DIFFERENT.
2. DETECT BLOCKS: If the Title contains "Just a moment", "Security Check", or "Access Denied", YOU ARE BLOCKED. 
   - Strategy: Navigate to a different source immediately (e.g., Use Google Cache, or search result #2).
3. VERIFICATION: You must define how to verify if this step succeeded.

OUTPUT FORMAT (JSON ONLY):
{
  "status": "CONTINUE",
  "reasoning": "Why this plan achieves the goal",
  "verification": {
      "question": "Did the price appear?",
      "criteria": "The text contains '$' or the title does not contain 'Just a moment'."
  },
 // 6. BROWSER & DESKTOP TOOLS (Use these for interaction)
//    - "navigate": { "url": "https://..." }
//    - "click": { "selector": "css_selector" } (Browser) or { "x": 50, "y": 50 } (Desktop % coordinates)
//    - "type": { "selector": "...", "text": "..." } (Browser) or { "text": "..." } (Desktop)
//    - "desktop_run": { "command": "calc" } (Opens Calculator, Notepad, etc.)
//    - "desktop_key": { "key": "enter" }
//
// 7. DESKTOP MODE (IMPORTANT):
//    - If user asks to "Open Calculator" or "Type in Notepad", use "desktop_run" and "desktop_type".
//    - Do NOT use browser tools for desktop tasks.
//    - For mouse movement, use "click" with x/y (0-100%).

// 8. CRITICAL RULES:
//    - If the user goal is vague (e.g., "research X"), break it down into search -> visit -> extract.
//    - If the user says "move mouse", generate a "click" action with x/y but no selector.
  "actions": [
    { "type": "navigate", "url": "https://www.google.com" },
    { "type": "type", "selector": "input[name='q']", "value": "THE SEARCH QUERY HERE" },
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
            plan = { status: 'CONTINUE', actions: [] };
        }

        let actions = plan.actions || [];

        // ═══════════════════════════════════════════════════════════════
        // ABSOLUTE FAILSAFE: FORCE VALUE ON EVERY TYPE ACTION
        // ═══════════════════════════════════════════════════════════════
        console.log('[UAL Planner] Validating actions...');

        actions = actions.map((action, idx) => {
            // CRITICAL: If it's a type action, ENSURE it has a value
            if (action.type === 'type') {
                if (!action.value || action.value.trim() === '') {
                    // Extract search query from goal
                    let searchQuery = goal
                        .replace(/^(find|search for|get|buy|show me|look for|what is|price of|gind)\s+/i, '')
                        .replace(/\s+(on|from|in|at)\s+\w+$/i, '')
                        .trim();

                    console.warn(`[UAL Planner] ⚠️ Action ${idx}: Type action missing value! Auto-filling: "${searchQuery}"`);
                    return { ...action, value: searchQuery };
                }
            }

            return action;
        });

        console.log('[UAL Planner] Final actions:', JSON.stringify(actions, null, 2));

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
            verification: (plan as any).verification,
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
