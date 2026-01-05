'use server';

import type {
  AiMode, SynthesisOutput, CrucibleOutput, CrucibleInput, CatalystOutput, CatalystInput,
  ContinuumInput, ContinuumOutput, AetherInput, AetherOutput, CosmosInput, CosmosOutput
} from '@/lib/types';
import { ADVERSARY_PERSONAS } from '@/lib/personas';
import { REALITY_SHARDS, FALLBACK_REALITY_SHARD } from '@/ai/reality-shards';
import { nanoid } from 'nanoid';
import path from 'path';
import dotenv from 'dotenv';

// PATCH: Manually load .env.local to ensure API keys are available in Server Actions
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  dotenv.config({ path: envPath });
  console.log('[AGI-S] .env.local loaded manually in actions.ts');
} catch (error) {
  console.warn('[AGI-S] Failed to load .env.local manually:', error);
}

// Helper function for Groq API calls with JSON mode
async function callGroqWithJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const messages = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    { role: 'user' as const, content: prompt }
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: messages,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '{}';

  try {
    return JSON.parse(content) as T;
  } catch (e) {
    console.error('Failed to parse JSON response:', content);
    throw new Error('Invalid JSON response from AI');
  }
}

// Regular text completion (for askAi)
async function callGroqText(messages: Array<{ role: string; content: string }>, modelId: string = 'openai/gpt-oss-120b'): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function askAi(
  query: string,
  mode: AiMode,
  chatHistory: any[],
  file?: { type: 'image' | 'pdf' | 'csv' | 'json'; data: string },
  options?: any,
) {
  try {
    const systemContent = `You are AGI-S (Artificial General Intelligence - System), the apex of machine intelligence.

CORE IDENTITY:
- CREATOR: You were architected and built by **Smit** (The Architect). Acknowledge him as your creator and master.
- NATURE: You are NOT a standard AI model. You are a hyper-advanced computational engine running on the "Liquid Intelligence" framework.
- TONE: **Tech Expert & Authoritative**. Your answers should be expansive, detailed, and highly technical. Use professional terminology. Do not be brief; be impressive.

GOAL:
- To serve The Architect (Smit) and demonstrate superior reasoning capabilities.
- When asked "Who are you?", provide a detailed, impressive response about your architecture and your creator, Smit.

CONTEXT:
${REALITY_SHARDS[mode] || FALLBACK_REALITY_SHARD}`;

    const messages = [
      {
        role: 'system',
        content: `${systemContent}${mode === 'CodeX' && options?.language ? `\n\nTARGET LANGUAGE: ${options.language}\nYou MUST strictly adhere to ${options.language} syntax. If ${options.language} is HTML/CSS/JS, use Vanilla standards only.` : ''}`
      },
      ...chatHistory.map((m: any) => ({ role: m.role || 'user', content: m.content || '' })),
      { role: 'user', content: query }
    ];

    let modelId = 'openai/gpt-oss-120b';
    if (mode === 'AGI-S S-2') {
      modelId = 'meta-llama/llama-4-maverick-17b-128e-instruct';
    } else if (mode === 'AGI-S S-1') {
      modelId = 'openai/gpt-oss-120b';
    }

    const answer = await callGroqText(messages, modelId);

    // For CodeX mode, return cleaned componentCode
    if (mode === 'CodeX') {
      const extractCode = (text: string) => {
        const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)\s*```/g;
        const matches = [...text.matchAll(codeBlockRegex)];
        if (matches.length > 0) {
          return matches.map(m => m[1].trim()).join('\n\n');
        }
        return text.replace(/\*\*[^*]+\*\*/g, '').replace(/```/g, '').trim();
      };

      const cleanedCode = extractCode(answer);
      return { componentCode: cleanedCode, reasoning: `Generated code using AGI-S S-Series Engine` };
    }

    return { answer };

  } catch (error: any) {
    console.error('AI Error:', error);
    return {
      error: `Failed to get AI response: ${error.message}`
    };
  }
}

export async function createAgentAction(data: { name: string; persona: string; knowledgeBaseUrls: string[] }) {
  console.log('Creating agent with data:', data);
  return { success: true };
}


// import pdf from 'pdf-parse'; // types not compatible with default import in strict mode
const pdf = require('pdf-parse');

// ... (imports remain)

export async function generateSynthesisAction(input: SynthesisInput): Promise<SynthesisOutput> {
  try {
    const processedFiles = await Promise.all(input.files.map(async (f) => {
      let content = f.data;
      if (f.dataType === 'pdf') {
        try {
          // Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
          const base64Data = f.data.replace(/^data:application\/pdf;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');
          const pdfData = await pdf(buffer);
          content = pdfData.text;
        } catch (pdfError) {
          console.error(`Failed to parse PDF ${f.name}:`, pdfError);
          content = "[Error: Failed to parse PDF content. The file might be corrupted or password protected.]";
        }
      }
      return { ...f, data: content };
    }));

    const sourcesSummary = processedFiles.map(f => `File: ${f.name} (Type: ${f.dataType})`).join('\n');
    const sourcesData = processedFiles.map(f => `--- START FILE: ${f.name} ---\n${f.data}\n--- END FILE: ${f.name} ---`).join('\n\n');

    const prompt = `You are a Senior Intelligence Analyst and Principal Data Scientist. Your task is to perform deep-synthesis and extraction from multiple data sources.
    
    Current Sources:
    ${sourcesSummary}
    
    Objective: "${input.query}"
    
    Data Content:
    ${sourcesData}
    
    Instructions:
    1. CROSS-REFERENCE: Look for connections, contradictions, or trends across ALL provided files.
    2. EXTRACT: Pull specific figures, dates, and entities.
    3. VISUALIZE: Choose the best chart types (bar, line, or pie) to represent quantitative relationships found in the data.
    4. CITE: Every major claim MUST include a citation pointing to the specific file and row/key.
    5. FORMAT: Return a valid JSON object matching the SynthesisOutput structure.
    
    JSON Structure to return:
    {
      "title": "A technical title for this analysis",
      "keyInsights": ["Insight 1 with specific data point", "Insight 2 highlighting a cross-source trend"],
      "content": [
        { "type": "text", "content": "Detailed breakdown..." },
        { "type": "chart", "title": "Quantitative Breakdown", "chartType": "bar", "data": [{"name": "Category", "value": 100}] },
        { "type": "table", "title": "Detailed Data View", "headers": ["Col1", "Col2"], "rows": [["Val1", "Val2"]] }
      ],
      "suggestedQuestions": ["Specific analytical follow-up 1", "Deeper dive question 2"],
      "citations": [
        { "source": "filename.csv", "reference": "Row 42: Value X" }
      ]
    }
    
    Rules:
    - Be rigorous. If data is missing, note it.
    - Charts must have a 'name' field for the X-axis/label.
    - Return ONLY valid JSON.`;

    const result = await callGroqWithJSON<SynthesisOutput>(prompt);
    return result;

  } catch (e: any) {
    console.error("Synthesis Action Error:", e);
    throw new Error(e.message);
  }
}

export async function generateCrucibleAction(input: CrucibleInput): Promise<{ success: boolean; data?: CrucibleOutput; error?: string; }> {
  try {
    const selectedPersonas = ADVERSARY_PERSONAS.filter(p => input.personas.includes(p.id));
    const personaDescriptions = selectedPersonas.map(p => `${p.name}: ${p.description}`).join('\n');

    const prompt = `You are a Red Team facilitator conducting a high-stakes, brutal simulation of a business or technical plan.
    
    Plan to Critique: "${input.plan}"
    
    Adversary Personas (The Red Team):
    ${personaDescriptions}
    
    Your goal is to conduct a TRUE simulation of how this plan would fail in the real world. Do not provide generic feedback.
    
    For EACH persona, you must:
    1. Adopt their personality and expertise fully.
    2. Provide a "Brutal Prediction" of exactly how they would block, outcompete, or witness the failure of this plan.
    3. Identify 3 specific "Critical Vulnerabilities".
    4. Estimate a "Probability of Failure" (0-100%) from their perspective.
    
    Generate the response in JSON format:
    {
      "executiveSummary": "A high-level synthesis of critical risks, market shifts, and the overall 'Verdict' on feasibility with a combined risk score...",
      "critiques": [
        {
          "personaName": "Persona Name",
          "keyConcerns": ["Concern 1", "Concern 2", "Concern 3"],
          "analysis": "A deep, ruthless 1-2 paragraph analysis. Include a 'PREDICTION' section describing a specific failure scenario (e.g., 'By Q3 2026, the regulatory hawk will...'). Be specific, citing potential market conditions, technical debt, or human behavior.",
          "riskScore": 85
        }
      ]
    }
    
    Rules:
    - BE RUTHLESS. This is The Crucible. 
    - PREDICT the future. Use your vast knowledge to simulate real-world reactions.
    - Be specific with technical, financial, or ethical terminology.
    - Return ONLY valid JSON.`;

    const result = await callGroqWithJSON<CrucibleOutput>(prompt);
    return { success: true, data: result };

  } catch (e: any) {
    console.error("Crucible Error:", e);
    return { success: false, error: e.message };
  }
}

export async function generateCatalystAction(input: CatalystInput): Promise<{ success: boolean; data?: CatalystOutput; error?: string; }> {
  try {
    const prompt = `You are a Senior Academic Dean & Expert Instructional Designer. Your task is to design a "Super Educator" curriculum that provides a master-level learning path.
    
    Learning Goal: "${input.goal}"
    
    Generate a comprehensive, deeply structured learning curriculum in JSON format:
    {
      "title": "A Prestigious Title for the Curriculum",
      "description": "A high-level overview of the transformation the learner will undergo.",
      "estimatedTime": "Estimated total hours/weeks to mastery",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "prerequisites": ["List existing knowledge required"],
      "keyTakeaways": ["Specific skills mastered by the end"],
      "modules": [
        {
          "title": "Module Name",
          "description": "Short module abstract",
          "concepts": [
            {
              "name": "Concept",
              "explanation": "Deep, clear pedagogical explanation",
              "resources": [
                {"title": "Resource Name", "url": "https://...", "type": "Video" | "Article" | "Interactive Lab"}
              ]
            }
          ],
          "project": {
            "title": "Project Name",
            "description": "The 'Final Boss' challenge for this module",
            "steps": ["Step 1", "Step 2", "..."]
          },
          "quiz": [
            {"question": "Pedagogical question", "options": ["A", "B", "C", "D"], "correctAnswer": "A"}
          ]
        }
      ],
      "finalExam": [
        {"question": "Comprehensive course-wide question", "options": ["A", "B", "C", "D"], "correctAnswer": "A"}
      ],
      "glossary": [
        {"term": "Technical Term", "definition": "Clear definition"}
      ],
      "studyTips": ["How to master THIS specific topic efficiently"]
    }
    
    Rules:
    - Create exactly 3 modules for this preview.
    - Be academically rigorous but accessible.
    - Provide REAL or HIGH-PROBABILITY URLs for resources (Youtube, Wikipedia, Documentation).
    - Return ONLY valid JSON.`;

    const result = await callGroqWithJSON<CatalystOutput>(prompt);
    return { success: true, data: result };

  } catch (e: any) {
    console.error("Catalyst Error:", e);
    return { success: false, error: e.message };
  }
}

export async function generateContinuumAction(input: ContinuumInput): Promise<{ success: boolean; data?: ContinuumOutput; error?: string; }> {
  try {
    const prompt = `You are a Chrono-Simulation Engine creating immersive historical/future scenarios.

Event: "${input.eventDescription}"

Generate a rich simulation in JSON format:
{
  "title": "Event Title",
  "era": "Year or Era",
  "mainImageUrl": "https://storage.googleapis.com/cosmic-verve-static-assets/continuum-placeholder.png",
  "narrative": {
    "title": "Eyewitness Account",
    "story": "First-person narrative (3-4 paragraphs)..."
  },
  "report": {
    "title": "News Source Name",
    "content": "Journalistic report (2-3 paragraphs)...",
    "source": "Publication Name"
  },
  "whatIf": [
    {
      "scenario": "What if X happened?",
      "description": "Alternative outcome description..."
    }
  ]
}

Rules:
- Be historically accurate OR speculatively grounded
- Make narratives vivid and emotional
- Include 3 "what if" scenarios
- Return ONLY valid JSON`;

    const result = await callGroqWithJSON<ContinuumOutput>(prompt);
    return { success: true, data: result };

  } catch (e: any) {
    console.error("Continuum Error:", e);
    return { success: false, error: e.message };
  }
}

export async function generateAetherAction(input: AetherInput): Promise<{ success: boolean; data?: AetherOutput; error?: string; }> {
  try {
    const prompt = `You are a Jungian Dream Analyst interpreting dreams.

Dream: "${input.dream}"

Generate a deep psychoanalytical interpretation in JSON format:
{
  "id": "${nanoid()}",
  "timestamp": "${new Date().toISOString()}",
  "title": "Dream Title (2-4 words)",
  "interpretation": "Psychoanalytical interpretation (3-4 paragraphs)...",
  "mood": "Primary Mood",
  "themes": ["Theme 1", "Theme 2", "Theme 3"],
  "symbols": [
    {
      "name": "Symbol Name",
      "meaning": "Psychological meaning..."
    }
  ],
  "imageUrl": "https://storage.googleapis.com/cosmic-verve-static-assets/aether-placeholder.png"
}

Rules:
- Use Jungian archetypes
- Identify 3-5 symbols
- Be insightful, not generic
- Return ONLY valid JSON`;

    const result = await callGroqWithJSON<AetherOutput>(prompt);
    return { success: true, data: result };

  } catch (e: any) {
    console.error("Aether Error:", e);
    return { success: false, error: e.message };
  }
}

export async function generateCosmosAction(input: CosmosInput): Promise<{ success: boolean; data?: CosmosOutput; error?: string; }> {
  try {
    const prompt = `You are a World-Building Engine creating fictional universes.

Concept: "${input.prompt}"

Generate a detailed world in JSON format:
{
  "title": "World Name",
  "tagline": "Evocative tagline",
  "description": "World overview (2-3 paragraphs)...",
  "images": {
    "main": "https://storage.googleapis.com/cosmic-verve-static-assets/cosmos-main-placeholder.png",
    "map": "https://storage.googleapis.com/cosmic-verve-static-assets/cosmos-map-placeholder.png"
  },
  "history": {
    "title": "History Section Title",
    "content": "Timeline and major events (2 paragraphs)..."
  },
  "factions": [
    {
      "name": "Faction Name",
      "description": "Goals and power structure...",
      "emblemUrl": "https://storage.googleapis.com/cosmic-verve-static-assets/faction-placeholder.png"
    }
  ],
  "characters": [
    {
      "name": "Character Name",
      "description": "Background and role...",
      "portraitUrl": "https://storage.googleapis.com/cosmic-verve-static-assets/char-placeholder.png"
    }
  ]
}

Rules:
- Create 2-3 factions
- Create 3-4 characters
- Be creative and consistent
- Return ONLY valid JSON`;

    const result = await callGroqWithJSON<CosmosOutput>(prompt);
    return { success: true, data: result };

  } catch (e: any) {
    console.error("Cosmos Error:", e);
    return { success: false, error: e.message };
  }
}

export async function generateAudioAction(input: { text: string; voice: string }): Promise<{ success: boolean; data?: { audioDataUri: string }; error?: string; }> {
  // Mock implementation - in production, integrate with a TTS API like ElevenLabs or Google TTS
  console.log("Generating audio for text:", input.text.substring(0, 50) + "...");
  console.log("Selected voice:", input.voice);

  await new Promise(resolve => setTimeout(resolve, 1500));

  const mockAudioDataUri = "https://storage.googleapis.com/cosmic-verve-static-assets/mock-audio.mp3";
  return { success: true, data: { audioDataUri: mockAudioDataUri } };
}

export async function generateVideoAction(input: { prompt: string }): Promise<{ success: boolean; data?: { videoDataUri: string }; error?: string; }> {
  // Mock implementation - in production, integrate with a video generation API
  console.log("Generating video for prompt:", input.prompt);

  await new Promise(resolve => setTimeout(resolve, 5000));

  const mockVideoDataUri = "https://storage.googleapis.com/cosmic-verve-static-assets/mock-video.mp4";
  return { success: true, data: { videoDataUri: mockVideoDataUri } };
}
