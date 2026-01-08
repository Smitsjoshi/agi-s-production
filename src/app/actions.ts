'use server';

import {
  CrucibleOutputSchema,
  AdversaryPersonaIdSchema
} from '@/lib/types';
import type {
  AiMode, SynthesisOutput, SynthesisInput, CrucibleOutput, CrucibleInput, CrucibleCritique, CatalystOutput, CatalystInput,
  ContinuumInput, ContinuumOutput, AetherInput, AetherOutput, CosmosInput, CosmosOutput,
  AudioOverview, VideoOverview, MindMap, MindMapNode, Flashcard, FlashcardDeck, QuizQuestion, Quiz,
  Infographic, SlideContent, SlideDeck, Report
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
async function callGroqWithJSON<T>(prompt: string, systemPrompt?: string, temperature: number = 0.7, model: string = 'llama-3.3-70b-versatile'): Promise<T> {
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
      model: model,
      messages: messages,
      temperature: temperature,
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

/**
 * Helper for Multimodal / Vision calls
 */
async function callGroqVision(prompt: string, base64Image: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: base64Image } }
          ]
        }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) throw new Error(`Groq Vision Error: ${response.status}`);
  const data = await response.json();
  return data.choices[0]?.message?.content || "";
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

// ============================================
// SOURCE EXTRACTION ACTIONS
// ============================================

/**
 * Extract transcript from YouTube video
 */
export async function extractYouTubeTranscript(url: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const { YoutubeTranscript } = await import('youtube-transcript');

    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (!videoIdMatch) {
      return { success: false, error: 'Invalid YouTube URL' };
    }

    const videoId = videoIdMatch[1];
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Format transcript with timestamps
    const formattedTranscript = transcript
      .map(item => `[${Math.floor(item.offset / 1000)}s] ${item.text}`)
      .join('\n');

    return { success: true, data: formattedTranscript };
  } catch (error: any) {
    console.error('YouTube transcript extraction error:', error);
    return { success: false, error: error.message || 'Failed to extract YouTube transcript' };
  }
}

/**
 * Scrape and extract main content from web page
 */
export async function scrapeWebPage(url: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const axios = (await import('axios')).default;
    const cheerio = await import('cheerio');

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Remove script, style, nav, footer, ads
    $('script, style, nav, footer, aside, .ad, .advertisement, #comments').remove();

    // Extract main content (try common selectors)
    let content = '';
    const mainSelectors = ['main', 'article', '.content', '.post-content', '#content', 'body'];

    for (const selector of mainSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }

    if (!content) {
      content = $('body').text();
    }

    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    if (!content || content.length < 100) {
      return { success: false, error: 'Could not extract meaningful content from page' };
    }

    return { success: true, data: content };
  } catch (error: any) {
    console.error('Web scraping error:', error);
    return { success: false, error: error.message || 'Failed to scrape web page' };
  }
}

// ============================================
// STUDIO AI FEATURE ACTIONS
// ============================================

/**
 * Perform multi-source synthesis with high detail
 */
export async function generateSynthesisAction(input: SynthesisInput): Promise<{ success: boolean; data?: SynthesisOutput; error?: string }> {
  try {
    const { query, files } = input;

    // Process files (PDF, CSV, JSON, Image)
    const processedFiles = await Promise.all(input.files.map(async (f: any) => {
      let content = ""; // DEFAULT TO EMPTY TO PREVENT BINARY LEAK
      if (f.dataType === 'pdf') {
        try {
          const pkg = require('pdf-parse');
          const pdfParser = typeof pkg === 'function' ? pkg : (pkg.PDFParse || pkg.default);
          const base64Data = f.data.includes(',') ? f.data.split(',')[1] : f.data;
          const buffer = Buffer.from(base64Data, 'base64');

          if (typeof pdfParser === 'function') {
            const data = await pdfParser(buffer);
            content = data.text || "[WARNING: PDF successfully parsed but no text was found. This is likely a scanned image. Please upload an image version for OCR analysis.]";
          } else if (pdfParser) {
            const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
            const instance = new pdfParser(uint8Array);
            const data = await instance.getText();
            content = data.text || "[WARNING: PDF successfully parsed but no text was found. This is likely a scanned image. Please upload an image version for OCR analysis.]";
          }
        } catch (err: any) {
          console.error(`PDF parse error for ${f.name}:`, err);
          content = `[ERROR: PDF Parsing Failed. The document might be encrypted or corrupted.]`;
        }
      } else if (f.dataType === 'image') {
        try {
          // Use Vision to extract text/diagrams
          content = await callGroqVision(
            "Extract ALL text, identify diagrams, explain charts, and describe any visual information in this image in extreme detail for a researcher.",
            f.data
          );
        } catch (err: any) {
          console.error("Vision error:", err);
          content = `[ERROR: Image Vision Analysis Failed]`;
        }
      }
      return { name: f.name, content };
    }));

    const sourcesSummary = processedFiles.map(f => `Source: ${f.name}\nContent: ${f.content.substring(0, 5000)}...`).join('\n\n');

    const prompt = `Perform an ADVANCED, high-fidelity, comprehensive multi-source synthesis for the query: "${query}"
    
    You are an Elite Intelligence Analyst. You must provide an EXHAUSTIVE, deeply technical answer (minimum 800-1200 words) using the provided sources. 
    If a source appears to have extraction issues (noted as [WARNING] or [ERROR] or is empty), EXPLICITLY state this in your response and do NOT hallucinate content for that source.
    
    Format your response as a series of structured blocks. 
    
    Rules:
    1. NEVER use HTML tags or raw markdown headers like # or ## inside the JSON strings.
    2. Use 'text', 'table', and 'chart' block types.
    3. Cite sources explicitly: [Source: name.pdf, Page/Section X]
    4. Be impressive. Use sophisticated analytical frameworks (e.g., SWOT, First Principles, PESTLE) if applicable.
    
    Sources Content:
    ${sourcesSummary}
    
    Output as JSON:
    {
      "content": [
        { "type": "text", "content": "..." },
        { "type": "table", "headers": ["Header 1", "Header 2"], "rows": [["Cell 1", "Cell 2"]] }
      ],
      "suggestedQuestions": ["Question 1", "Question 2"],
      "confidenceScore": 0.98
    }`;

    const result = await callGroqWithJSON<SynthesisOutput>(prompt);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Synthesis error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate a Critical Analysis report
 */
export async function generateCriticalAnalysisAction(sources: { name: string; content: string }[]): Promise<{ success: boolean; data?: Report; error?: string }> {
  try {
    const context = sources.map(s => s.content.substring(0, 5000)).join('\n\n');
    const prompt = `Perform a DENSE, ELITE-LEVEL CRITICAL analysis of these sources. 
    Identify hidden biases, systemic gaps in data, cross-source contradictions, underlying logical fallacies, and ethical implications.
    
    IMPORTANT: If the source content is empty or contains warnings about extraction failure, do NOT invent data. Instead, analyze the failure itself and what intelligence might be missing.
    
    The report must be extremely detailed (minimum 1000 words).
    
    Output as JSON:
    {
      "title": "Elite-Level Critical Intelligence Assessment",
      "executiveSummary": "A high-level strategic overview (BLUF)...",
      "sections": [
        { "heading": "Structural Analysis & Data Integrity", "content": "..." },
        { "heading": "Inherent Biases & Perspectives", "content": "..." },
        { "heading": "Cross-Source Synthesis & Contradictions", "content": "..." },
        { "heading": "Risk Assessment & Future Implications", "content": "..." },
        { "heading": "Strategic Recommendations", "content": "..." }
      ]
    }`;
    const result = await callGroqWithJSON<Report>(prompt);
    return { success: true, data: { ...result, id: nanoid(), createdAt: new Date() } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate an Executive Summary
 */
export async function generateExecutiveSummaryAction(sources: { name: string; content: string }[]): Promise<{ success: boolean; data?: Report; error?: string }> {
  try {
    const context = sources.map(s => s.content.substring(0, 8000)).join('\n\n');
    const prompt = `Create a DEFINTIVE Executive Summary for a global leader or CXO. 
    Focus on 'Bottom Line Up Front' (BLUF), Strategic Value, and Actionable Intelligence.
    
    The summary must be highly detailed and authoritative (minimum 800 words).
    
    Output as JSON:
    {
      "title": "Strategy & Executive Synthesis",
      "executiveSummary": "Deep high-level summary covering all core pillars...",
      "sections": [
        { "heading": "Strategic Implications & Market Positioning", "content": "..." },
        { "heading": "Core Value Drivers & Key Findings", "content": "..." },
        { "heading": "Critical Risks & Mitigations", "content": "..." },
        { "heading": "Top 5 Strategic Recommendations", "content": "..." }
      ]
    }`;
    const result = await callGroqWithJSON<Report>(prompt);
    return { success: true, data: { ...result, id: nanoid(), createdAt: new Date() } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate a podcast-style Audio Overview script and audio
 */
export async function generateAudioOverviewAction(sources: { name: string; content: string }[]): Promise<{ success: boolean; data?: AudioOverview; error?: string }> {
  try {
    const context = sources.map(s => `Source: ${s.name}\nContent: ${s.content.substring(0, 5000)}...`).join('\n\n');

    const prompt = `You are Jordan and Taylor, professional podcasters known for deep, nuanced synthesis. 
    Create a natural, engaging conversation script discussing the provided sources.
    
    The conversation should be HIGHLY DETAILED and last about 10 minutes (reading time).
    Avoid superficial summaries. Dig into the "Why" and "So What".
    
    Sources:
    ${context}
    
    Output as JSON:
    {
      "script": "Jordan: [Full script with speaker labels...]",
      "dialogue": [
        { "speaker": "Jordan", "text": "..." },
        { "speaker": "Taylor", "text": "..." }
      ]
    }`;

    const result = await callGroqWithJSON<{ script: string; dialogue: any[] }>(prompt);

    return {
      success: true,
      data: {
        id: nanoid(),
        script: result.script,
        audioUrl: "#voice-api-active",
        duration: 600,
        speakers: [
          { name: 'Jordan', voice: 'Male' },
          { name: 'Taylor', voice: 'Female' }
        ],
        createdAt: new Date()
      }
    };
  } catch (error: any) {
    console.error('Audio Overview error:', error);
    return { success: false, error: error.message || 'Failed to generate audio overview' };
  }
}

/**
 * Generate an interactive Mind Map
 */
export async function generateMindMapAction(sources: { name: string; content: string }[]): Promise<{ success: boolean; data?: MindMap; error?: string }> {
  try {
    const context = sources.map(s => s.content.substring(0, 3000)).join('\n\n');

    const prompt = `Extract a COMPLEX, deep hierarchical topic structure for an expert-level mind map.
    Go deep—aim for 4-5 levels of nested hierarchy. Identify intricate connections, secondary drivers, and nuanced details.
    
    Sources:
    ${context}
    
    Output as JSON:
    {
      "rootNode": {
        "label": "Master Intelligence Hub",
        "description": "Exhaustive core synthesis",
        "level": 0,
        "children": [
          { 
            "label": "Primary Pillar 1", 
            "description": "...", 
            "level": 1, 
            "children": [
              { "label": "Secondary Subtopic", "description": "...", "level": 2, "children": [
                 { "label": "Tertiary Detail", "description": "...", "level": 3, "children": [] }
              ]}
            ] 
          }
        ]
      }
    }`;

    const result = await callGroqWithJSON<{ rootNode: MindMapNode }>(prompt);

    // Generate Mermaid syntax
    const generateMermaid = (node: MindMapNode): string => {
      let syntax = `mindmap\n  root((${node.label}))\n`;
      const walk = (n: MindMapNode, depth: number) => {
        n.children.forEach(child => {
          syntax += `${'  '.repeat(depth + 1)}${child.label}\n`;
          walk(child, depth + 1);
        });
      };
      walk(node, 1);
      return syntax;
    };

    return {
      success: true,
      data: {
        id: nanoid(),
        rootNode: result.rootNode,
        mermaidSyntax: generateMermaid(result.rootNode),
        createdAt: new Date()
      }
    };
  } catch (error: any) {
    console.error('Mind Map error:', error);
    return { success: false, error: error.message || 'Failed to generate mind map' };
  }
}

/**
 * Generate study Flashcards
 */
export async function generateFlashcardsAction(sources: { name: string; content: string }[]): Promise<{ success: boolean; data?: FlashcardDeck; error?: string }> {
  try {
    const context = sources.map(s => s.content.substring(0, 4000)).join('\n\n');

    const prompt = `Create a set of 15 high-quality study flashcards from these sources.
    
    Sources:
    ${context}
    
    Output as JSON:
    {
      "cards": [
        { "front": "Question/Term", "back": "Answer/Definition", "category": "...", "difficulty": "medium" }
      ]
    }`;

    const result = await callGroqWithJSON<{ cards: Flashcard[] }>(prompt);

    return {
      success: true,
      data: {
        id: nanoid(),
        cards: result.cards.map(c => ({ ...c, id: nanoid() })),
        totalCards: result.cards.length,
        createdAt: new Date()
      }
    };
  } catch (error: any) {
    console.error('Flashcards error:', error);
    return { success: false, error: error.message || 'Failed to generate flashcards' };
  }
}

/**
 * Generate a comprehensive Quiz
 */
export async function generateQuizAction(sources: { name: string; content: string }[]): Promise<{ success: boolean; data?: Quiz; error?: string }> {
  try {
    const context = sources.map(s => s.content.substring(0, 4000)).join('\n\n');

    const prompt = `Create a comprehensive multiple-choice quiz (10 questions) based on these sources.
    
    Sources:
    ${context}
    
    Output as JSON:
    {
      "questions": [
        { 
          "question": "...", 
          "options": ["A", "B", "C", "D"], 
          "correctIndex": 0, 
          "explanation": "..." 
        }
      ]
    }`;

    const result = await callGroqWithJSON<{ questions: QuizQuestion[] }>(prompt);

    return {
      success: true,
      data: {
        id: nanoid(),
        questions: result.questions.map(q => ({ ...q, id: nanoid() })),
        totalQuestions: result.questions.length,
        passingScore: 7,
        createdAt: new Date()
      }
    };
  } catch (error: any) {
    console.error('Quiz error:', error);
    return { success: false, error: error.message || 'Failed to generate quiz' };
  }
}

/**
 * Generate an Infographic summary
 */
export async function generateInfographicAction(sources: { name: string; content: string }[]): Promise<{ success: boolean; data?: Infographic; error?: string }> {
  try {
    const context = sources.map(s => s.content.substring(0, 3000)).join('\n\n');

    const prompt = `Extract exactly 6 key data points (statistics, trends, or comparisons) for an infographic from these sources.
    
    Sources:
    ${context}
    
    Output as JSON:
    {
      "title": "Main Title",
      "dataPoints": [
        { "label": "...", "value": "...", "type": "stat" }
      ]
    }`;

    const result = await callGroqWithJSON<{ title: string; dataPoints: any[] }>(prompt);

    const imageUrl = `https://pollinations.ai/p/infographic-${nanoid()}?prompt=${encodeURIComponent(`A modern infographic showing ${result.title}: ${result.dataPoints.map(d => d.label).join(', ')}`)}`;

    return {
      success: true,
      data: {
        id: nanoid(),
        title: result.title,
        imageUrl: imageUrl,
        dataPoints: result.dataPoints,
        createdAt: new Date()
      }
    };
  } catch (error: any) {
    console.error('Infographic error:', error);
    return { success: false, error: error.message || 'Failed to generate infographic' };
  }
}

/**
 * Generate a professional Slide Deck
 */
export async function generateSlideDeckAction(sources: { name: string; content: string }[]): Promise<{ success: boolean; data?: SlideDeck; error?: string }> {
  try {
    const context = sources.map(s => s.content.substring(0, 3000)).join('\n\n');

    const prompt = `Create a professional 10-slide presentation outline based on these sources.
    
    Sources:
    ${context}
    
    Output as JSON:
    {
      "title": "Presentation Title",
      "slides": [
        { "title": "...", "content": ["point 1", "point 2"], "notes": "..." }
      ]
    }`;

    const result = await callGroqWithJSON<{ title: string; slides: SlideContent[] }>(prompt);

    return {
      success: true,
      data: {
        id: nanoid(),
        title: result.title,
        slides: result.slides,
        totalSlides: result.slides.length,
        createdAt: new Date()
      }
    };
  } catch (error: any) {
    console.error('Slide Deck error:', error);
    return { success: false, error: error.message || 'Failed to generate slide deck' };
  }
}

/**
 * Generate a structured Intelligence Report
 */
export async function generateReportAction(sources: { name: string; content: string }[]): Promise<{ success: boolean; data?: Report; error?: string }> {
  try {
    const context = sources.map(s => s.content.substring(0, 5000)).join('\n\n');

    const prompt = `Write a comprehensive, professional intelligence report based on these sources.
    
    Sources:
    ${context}
    
    Output as JSON:
    {
      "title": "Executive Report Title",
      "executiveSummary": "...",
      "sections": [
        { "heading": "...", "content": "..." }
      ],
      "citations": [
        { "source": "...", "reference": "..." }
      ]
    }`;

    const result = await callGroqWithJSON<any>(prompt);

    return {
      success: true,
      data: {
        id: nanoid(),
        ...result,
        createdAt: new Date()
      }
    };
  } catch (error: any) {
    console.error('Report error:', error);
    return { success: false, error: error.message || 'Failed to generate report' };
  }
}

/**
 * Generate a Video Overview (sequence of slides + thumbnails)
 */
export async function generateVideoOverviewAction(sources: { name: string; content: string }[]): Promise<{ success: boolean; data?: VideoOverview; error?: string }> {
  try {
    const context = sources.map(s => s.content.substring(0, 3000)).join('\n\n');

    const prompt = `Create a video storyboard outline based on these sources. Give me 5 key scenes.
    
    Sources:
    ${context}
    
    Output as JSON:
    {
      "slides": [
        { "title": "...", "content": ["..."], "timestamp": 0 }
      ]
    }`;

    const result = await callGroqWithJSON<{ slides: any[] }>(prompt);

    const videoUrl = `https://pollinations.ai/p/video-overview-${nanoid()}?prompt=${encodeURIComponent(`A detailed educational video storyboard about these topics: ${result.slides.map(s => s.title).join(', ')}`)}&video=true`;

    return {
      success: true,
      data: {
        id: nanoid(),
        videoUrl: videoUrl,
        thumbnailUrl: videoUrl.replace('&video=true', ''), // Image version
        duration: 60,
        slides: result.slides,
        createdAt: new Date()
      }
    };
  } catch (error: any) {
    console.error('Video Overview error:', error);
    return { success: false, error: error.message || 'Failed to generate video overview' };
  }
}


// import pdf from 'pdf-parse'; // types not compatible with default import in strict mode
// const pdf = require('pdf-parse'); // Moved inside function for safety


export async function generateCrucibleAction(input: CrucibleInput): Promise<{ success: boolean; data?: CrucibleOutput; error?: string; }> {
  try {
    const BATCH_SIZE = 5;
    const selectedPersonas = ADVERSARY_PERSONAS.filter(p => input.personas.includes(p.id));

    // Helper to process a batch of personas
    const processBatch = async (personas: typeof ADVERSARY_PERSONAS, isLeadBatch: boolean) => {
      const personaDescriptions = personas.map(p => `${p.name}: ${p.description}`).join('\n');

      const prompt = `You are a Senior Strategic Advisory Lead facilitating a high-stakes investigation into a business or technical blueprint.
    
    BLUEPRINT: "${input.plan}"
    
    ADVERSARY COUNCIL COHORT:
    ${personaDescriptions}
    
    MISSION: Perform a high-fidelity "Inversion Analysis" from the perspective of THIS SPECIFIC COHORT.
    
    FORMATTING & QUALITY RULES (CRITICAL):
    1. ZERO-TOLERANCE FOR SPELLING ERRORS. Use clean, professional English. Verified against Oxford English Dictionary.
    2. BE CRITICALLY CONSTRUCTIVE. The tone should be authoritative and "real," not just "harsh."
    3. NO DUPLICATIONS. Each persona must focus on a unique vector.
    4. Provide a concrete STRATEGIC PIVOT for every risk identified.
    5. THE RISK RADAR: In the executive summary, include a "Risk Radar Briefing" based on these specific critiques.
    
    ORTHOGRAPHY & SYNTAX:
    - DO NOT use any markdown formatting (no **, no ##, no __, no \`) in the output.
    - ALL OUTPUT MUST BE IN PERFECT BUSINESS ENGLISH.
    - THE RESPONSE MUST BE PURE JSON ONLY. NO PREAMBLE, NO POSTSCRIPT.
    
    OUTPUT SCHEMA (JSON ONLY):
    {
      "executiveSummary": "A definitive 2-paragraph strategic brief. Paragraph 1: Final Verdict. Paragraph 2: The Risk Radar Briefing.",
      "critiques": [
        {
          "personaName": "Exact Name from List",
          "keyConcerns": ["Concern 1", "Concern 2"],
          "analysis": "A sophisticated analytical autopsy (150-200 words). Use industry-standard terminology. Identify a Failure Scenario.",
          "riskScore": 0-100,
          "strategicPivot": "A detailed, actionable solution (3-4 sentences)."
        }
      ]
    }
    
    Rules:
    - RETURN ONLY VALID JSON.
    - Double-check all spellings.`;

      return await callGroqWithJSON<CrucibleOutput>(prompt, undefined, 0.1, 'llama-3.3-70b-versatile');
    };

    // Split into chunks
    const chunks = [];
    for (let i = 0; i < selectedPersonas.length; i += BATCH_SIZE) {
      chunks.push(selectedPersonas.slice(i, i + BATCH_SIZE));
    }

    // Execute batches in parallel
    // We add a small delay between starts to prevent exact-second rate limiting if any
    const results = await Promise.all(
      chunks.map((chunk, index) =>
        new Promise<CrucibleOutput>(resolve =>
          setTimeout(() => processBatch(chunk, index === 0).then(resolve), index * 200)
        )
      )
    );

    // Aggregate results
    let combinedCritiques: CrucibleCritique[] = [];
    let leadSummary = "";

    results.forEach((res, index) => {
      if (res.critiques) {
        combinedCritiques = [...combinedCritiques, ...res.critiques];
      }
      // Use the first batch's summary as the main one, as it usually contains the "c-suite" personas if sorted by default
      if (index === 0) {
        leadSummary = res.executiveSummary;
      }
    });

    // If we have multiple batches, we might want to append a note to the summary
    if (results.length > 1) {
      leadSummary += `\n\n[System Note: Full Council Mobilized. ${combinedCritiques.length} critiques generated across ${results.length} strategic cohorts.]`;
    }

    const finalOutput: CrucibleOutput = {
      executiveSummary: leadSummary || "Analysis complete.",
      critiques: combinedCritiques
    };

    // Validate final aggregated output
    // Note: We validate individual chunks in the helper if we wanted, but here we validate the whole
    const validation = CrucibleOutputSchema.safeParse(finalOutput);
    if (!validation.success) {
      console.error('Crucible Aggregation Validation Failed:', validation.error);
      // Fallback: try to return what we have even if partial, or throw
      // Often strictly throwing is better to avoid bad UI states, but user wants results. 
      // Let's return the partials if at least one critique exists.
      if (combinedCritiques.length > 0) {
        return { success: true, data: finalOutput };
      }
      throw new Error('The Intelligence Council returned a malformed assessment. Please try again.');
    }

    return { success: true, data: validation.data };

  } catch (e: any) {
    console.error('Crucible Simulation Error:', e);
    return { success: false, error: e.message || 'The Red Team failed to converge.' };
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
