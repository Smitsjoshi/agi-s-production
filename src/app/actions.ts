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
      { role: 'system', content: systemContent },
      ...chatHistory.map((m: any) => ({ role: m.role || 'user', content: m.content || '' })),
      { role: 'user', content: query }
    ];

    let modelId = 'openai/gpt-oss-120b';
    if (mode === 'AGI-S S-2') {
      modelId = 'llama-3.1-405b-instruct';
    } else if (mode === 'AGI-S S-1') {
      modelId = 'openai/gpt-oss-120b';
    }

    const answer = await callGroqText(messages, modelId);

    // For CodeX mode, return componentCode
    if (mode === 'CodeX') {
      return { componentCode: answer, reasoning: `Generated code using ${modelId}` };
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

export async function generateSynthesisAction(input: {
  query: string;
  type: 'csv' | 'json';
  data: string;
}): Promise<SynthesisOutput> {
  try {
    const prompt = `You are an expert Data Scientist analyzing ${input.type.toUpperCase()} data.

User Query: "${input.query}"

Data Sample (first 5000 chars):
${input.data.substring(0, 5000)}

Generate a comprehensive analysis report in JSON format with the following structure:
{
  "content": [
    {"type": "text", "content": "Introduction and key findings..."},
    {"type": "chart", "title": "Chart Title", "chartType": "bar", "data": [{"name": "Category", "value": 100}]},
    {"type": "table", "title": "Table Title", "headers": ["Col1", "Col2"], "rows": [["val1", "val2"]]},
    {"type": "text", "content": "Conclusions and recommendations..."}
  ]
}

Rules:
- Include at least 1 chart and 1 table
- Use "bar", "line", or "pie" for chartType
- Make insights actionable
- Return ONLY valid JSON`;

    const result = await callGroqWithJSON<SynthesisOutput>(prompt);
    return result;

  } catch (e: any) {
    console.error("Synthesis Error:", e);
    return {
      content: [{
        type: 'text',
        content: `Error analyzing data: ${e.message}. Please try again with a different query or smaller dataset.`
      }]
    };
  }
}

export async function generateCrucibleAction(input: CrucibleInput): Promise<{ success: boolean; data?: CrucibleOutput; error?: string; }> {
  try {
    const selectedPersonas = ADVERSARY_PERSONAS.filter(p => input.personas.includes(p.id));
    const personaDescriptions = selectedPersonas.map(p => `${p.name}: ${p.description}`).join('\n');

    const prompt = `You are a Red Team facilitator conducting a brutal critique session.

Plan to Critique: "${input.plan}"

Adversary Personas:
${personaDescriptions}

Generate harsh but realistic critiques from EACH persona in JSON format:
{
  "executiveSummary": "High-level summary of critical risks...",
  "critiques": [
    {
      "personaName": "Persona Name",
      "keyConcerns": ["Concern 1", "Concern 2", "Concern 3"],
      "analysis": "Detailed paragraph explaining flaws and risks from this persona's perspective..."
    }
  ]
}

Rules:
- Be ruthless and specific
- Identify real business/technical/ethical risks
- Each critique should be 3-5 sentences
- Return ONLY valid JSON`;

    const result = await callGroqWithJSON<CrucibleOutput>(prompt);
    return { success: true, data: result };

  } catch (e: any) {
    console.error("Crucible Error:", e);
    return { success: false, error: e.message };
  }
}

export async function generateCatalystAction(input: CatalystInput): Promise<{ success: boolean; data?: CatalystOutput; error?: string; }> {
  try {
    const prompt = `You are an expert Instructional Designer creating a learning curriculum.

Learning Goal: "${input.goal}"

Generate a structured learning path in JSON format:
{
  "title": "Learning Path Title",
  "description": "What the learner will achieve...",
  "modules": [
    {
      "title": "Module 1 Title",
      "concepts": [
        {
          "name": "Concept Name",
          "explanation": "Clear explanation...",
          "resources": [
            {"title": "Resource Title", "url": "https://example.com", "type": "Article"}
          ]
        }
      ],
      "project": {
        "title": "Hands-on Project",
        "description": "What to build..."
      },
      "quiz": [
        {
          "question": "Question text?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A"
        }
      ]
    }
  ]
}

Rules:
- Create 2-3 modules
- Each module has 2-3 concepts
- Include real URLs to quality resources
- Make projects practical
- Return ONLY valid JSON`;

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
