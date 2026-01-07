import { z } from 'zod';
import type { LucideIcon } from 'lucide-react';
import type { AgentStep } from './universal-action-layer';

export type AiMode =
    | 'AGI-S S-1'
    | 'AGI-S S-2'
    | 'Academic Research'
    | 'Deep Dive'
    | 'Canvas'
    | 'Blueprint'
    | 'CodeX'
    | 'Synthesis'
    | 'Crucible'
    | 'Cosmos'
    | 'Catalyst'
    | 'The Strategist'
    | 'The Globetrotter'
    | 'The Storyteller'
    | 'The Game Master'
    | 'The Designer'
    | 'The Gourmet'
    | 'The Forecaster'
    | 'Comparison Analyst'
    | 'The Ethicist';

export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
    pages?: string[];
}

export interface Agent {
    id: string;
    name: string;
    description: string;
    avatar: string;
    isCustom?: boolean;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    createdAt?: number;
    usageCount?: number;
    lastUsed?: number;
    isFavorite?: boolean;
    skills?: string;
    goals?: string;
    constraints?: string;
    personality?: string;
}

// Schema for Blueprint Flow (formerly Canvas)
export const WebAgentInputSchema = z.object({
    goal: z.string().describe('The high-level goal for the AI agent to accomplish.'),
});
export type WebAgentInput = z.infer<typeof WebAgentInputSchema>;

export const WebAgentOutputSchema = z.object({
    title: z.string().describe('A concise, descriptive title for the generated content (e.g., "Paris Budget Trip" or "Chill Drive Playlist").'),
    description: z.string().describe('A 1-2 sentence summary of the content.'),
    items: z.array(z.object({
        title: z.string().describe("The main title of the item (e.g., song title, hotel name, activity)."),
        subtitle: z.string().describe("The secondary detail of the item (e.g., artist, location, category)."),
        description: z.string().describe("A very short (1-line) descriptive blurb about the item's key feature or mood."),
        external_links: z.record(z.string().url()).optional().describe("A dictionary of URLs to the item on external services, where the key is the service name (e.g., 'spotify', 'google_maps')."),
    })).describe('An array of structured items that fulfill the goal.'),
    integrations: z.array(z.object({
        name: z.string().describe('The name of the integrated service (e.g., Spotify, Google Maps).'),
        logo_url: z.string().url().describe("An absolute URL to the service's logo, preferably from a CDN like storage.googleapis.com."),
        action_type: z.enum(['deep_link', 'search', 'oauth_required']).describe('The type of action available for this integration.'),
        action_url: z.string().url().optional().nullable().describe('The base URL for the action, if applicable (e.g., a search query URL).'),
        oauth_required: z.boolean().describe('Whether OAuth is required for deep linking.'),
    })).describe('An array of supported integrations relevant to the generated content.')
});
export type WebAgentOutput = z.infer<typeof WebAgentOutputSchema>;

// Schemas for Live Web Agent (new Canvas)
export const LiveWebAgentInputSchema = z.object({
    goal: z.string().describe("The high-level goal for the agent to accomplish using a live web browser."),
});
export type LiveWebAgentInput = z.infer<typeof LiveWebAgentInputSchema>;

export const SearchResultSchema = z.object({
    title: z.string().describe("The title of the web page."),
    url: z.string().url().describe("The URL of the web page."),
    snippet: z.string().describe("A short summary or snippet of the page's content."),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

export const LiveWebAgentOutputSchema = z.object({
    summary: z.string().describe("A summary of the findings from the web navigation."),
    results: z.array(SearchResultSchema).describe("An array of the most relevant search results the agent found and used."),
});
export type LiveWebAgentOutput = z.infer<typeof LiveWebAgentOutputSchema>;


// Schemas for Continuum Flow
export const ContinuumInputSchema = z.object({
    eventDescription: z.string().describe('A description of the historical or future event to simulate.'),
});
export type ContinuumInput = z.infer<typeof ContinuumInputSchema>;

export const ContinuumOutputSchema = z.object({
    title: z.string().describe("A compelling title for the event, like 'The Fall of the Berlin Wall'."),
    era: z.string().describe("The year or era of the event, like '1989' or '2077'. "),
    mainImageUrl: z.string().url().describe('A URL for a generated image that visually represents the event.'),
    narrative: z.object({
        title: z.string().describe("Title for the narrative section, e.g., 'An Eyewitness Account'."),
        story: z.string().describe("A first-person narrative from the perspective of someone experiencing the event."),
    }),
    report: z.object({
        title: z.string().describe("Title for the report section, e.g., 'Simulated News Report'."),
        content: z.string().describe('A simulated news article or official report about the event from that time period.'),
        source: z.string().describe("The fictional source of the report, e.g., 'The Berlin Chronicle'."),
    }),
    whatIf: z.array(z.object({
        scenario: z.string().describe('A short "What if..." question exploring an alternative outcome.'),
        description: z.string().describe("A brief description of what might have happened in this alternative scenario."),
    })).describe('An array of "What if?" scenarios to explore alternative histories.'),
});
export type ContinuumOutput = z.infer<typeof ContinuumOutputSchema>;


// Schemas for Aether Flow
export const AetherInputSchema = z.object({
    dream: z.string().describe('A textual description of a dream.'),
});
export type AetherInput = z.infer<typeof AetherInputSchema>;

export const AetherOutputSchema = z.object({
    id: z.string().describe('A unique ID for the dream entry.'),
    timestamp: z.string().describe('The ISO 8601 timestamp of when the dream was recorded.'),
    title: z.string().describe('A short, evocative title for the dream.'),
    interpretation: z.string().describe('A psychoanalytical interpretation of the dream, exploring its themes and symbols.'),
    mood: z.string().describe('The primary emotional mood of the dream (e.g., "Surreal", "Anxious", "Peaceful", "Nostalgic").'),
    themes: z.array(z.string()).describe('A list of key themes identified in the dream (e.g., "loss of control", "childhood memories").'),
    symbols: z.array(z.object({
        name: z.string().describe('The name of a symbol in the dream (e.g., "Falling", "Water", "A Key").'),
        meaning: z.string().describe('The potential psychological meaning of the symbol in this context.'),
    })).describe('An array of significant symbols and their potential meanings.'),
    imageUrl: z.string().url().describe('URL of an AI-generated image visually representing the dream.'),
});
export type AetherOutput = z.infer<typeof AetherOutputSchema>;


// Schemas for Synthesis Flow
export const SynthesisInputSchema = z.object({
    query: z.string().describe('The user\'s question or instruction about the data.'),
    files: z.array(z.object({
        name: z.string().describe('The filename.'),
        dataType: z.enum(['csv', 'json', 'pdf', 'image']).describe('The format of the file.'),
        data: z.string().describe('The raw content of the file.')
    })).describe('An array of uploaded data sources to synthesize.')
});
export type SynthesisInput = z.infer<typeof SynthesisInputSchema>;

// NotebookLM Source Types
export type SourceType = 'pdf' | 'youtube' | 'web' | 'text' | 'csv' | 'json' | 'image';

export interface Source {
    id: string;
    type: SourceType;
    name: string;
    url?: string;
    content: string;
    metadata?: {
        videoId?: string;
        duration?: number;
        author?: string;
        publishedAt?: string;
        [key: string]: any;
    };
    addedAt: Date;
}

// Studio Feature Outputs
export interface AudioOverview {
    id: string;
    script: string;
    audioUrl: string;
    duration: number;
    speakers: Array<{
        name: string;
        voice: string;
    }>;
    createdAt: Date;
}

export interface VideoOverview {
    id: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    slides: Array<{
        title: string;
        content: string[];
        timestamp: number;
    }>;
    createdAt: Date;
}

export interface MindMapNode {
    id: string;
    label: string;
    description?: string;
    children: MindMapNode[];
    level: number;
}

export interface MindMap {
    id: string;
    rootNode: MindMapNode;
    mermaidSyntax: string;
    imageUrl?: string;
    createdAt: Date;
}

export interface Flashcard {
    id: string;
    front: string;
    back: string;
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
}

export interface FlashcardDeck {
    id: string;
    cards: Flashcard[];
    totalCards: number;
    createdAt: Date;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
    id: string;
    questions: QuizQuestion[];
    totalQuestions: number;
    passingScore: number;
    createdAt: Date;
}

export interface Infographic {
    id: string;
    title: string;
    imageUrl: string;
    dataPoints: Array<{
        label: string;
        value: string | number;
        type: 'stat' | 'trend' | 'comparison';
    }>;
    createdAt: Date;
}

export interface SlideContent {
    title: string;
    content: string[];
    notes?: string;
    imageUrl?: string;
}

export interface SlideDeck {
    id: string;
    title: string;
    slides: SlideContent[];
    totalSlides: number;
    pdfUrl?: string;
    createdAt: Date;
}

export interface Report {
    id: string;
    title: string;
    sections: Array<{
        heading: string;
        content: string;
        subsections?: Array<{
            heading: string;
            content: string;
        }>;
    }>;
    executiveSummary: string;
    citations: Array<{
        source: string;
        reference: string;
    }>;
    pdfUrl?: string;
    createdAt: Date;
}

const SynthesisContentBlockSchema = z.union([
    z.object({
        type: z.literal('text'),
        content: z.string().describe('A text block containing insights, summaries, or explanations.'),
    }),
    z.object({
        type: z.literal('table'),
        title: z.string().describe('A title for the table.'),
        headers: z.array(z.string()).describe('The headers for the table columns.'),
        rows: z.array(z.array(z.union([z.string(), z.number()]))).describe('The rows of the table, where each row is an array of values.'),
    }),
    z.object({
        type: z.literal('chart'),
        title: z.string().describe('A title for the chart.'),
        chartType: z.enum(['bar', 'line', 'pie']).describe('The type of chart to render.'),
        data: z.array(z.record(z.union([z.string(), z.number()]))).describe('The data for the chart, typically an array of objects.'),
    }),
]);
export type SynthesisContentBlock = z.infer<typeof SynthesisContentBlockSchema>;

export const SynthesisOutputSchema = z.object({
    title: z.string().optional().describe('A descriptive title for this analysis session.'),
    keyInsights: z.array(z.string()).describe('A collection of high-level insights extracted from the cross-referenced data.'),
    content: z.array(SynthesisContentBlockSchema).describe('An array of content blocks (text, tables, charts) that form the detailed AI response.'),
    suggestedQuestions: z.array(z.string()).describe('Dynamic follow-up questions tailored to the current data context.'),
    citations: z.array(z.object({
        source: z.string().describe('The specific file or source ID.'),
        reference: z.string().describe('The exact row, key, or snippet referenced.'),
    })).optional().describe('Semantic citations linking claims back to the original documentation.'),
});
export type SynthesisOutput = z.infer<typeof SynthesisOutputSchema>;

// Schemas for Crucible Flow
export const AdversaryPersonaIdSchema = z.enum([
    "cfo", "competitor_ceo", "ethicist", "customer", "engineer", "legal",
    "hacker", "visionary", "environmentalist", "logistician", "detective", "disruptor",
    "talent", "pr", "data", "growth",
    "ux", "debt", "community", "hardware"
]);
export type AdversaryPersonaId = z.infer<typeof AdversaryPersonaIdSchema>;

export interface AdversaryPersona {
    id: AdversaryPersonaId;
    name: string;
    description: string;
    icon: LucideIcon;
}

export const CrucibleInputSchema = z.object({
    plan: z.string().describe('The user\'s plan, idea, or strategy to be "red teamed".'),
    personas: z.array(AdversaryPersonaIdSchema).describe('An array of adversary persona IDs to use for the critique.'),
});
export type CrucibleInput = z.infer<typeof CrucibleInputSchema>;

export const CrucibleCritiqueSchema = z.object({
    personaName: z.string().describe('The name of the adversary persona providing the critique.'),
    keyConcerns: z.array(z.string()).describe('A list of 2-3 short bullet points highlighting the main concerns from this persona\'s perspective.'),
    analysis: z.string().describe('A detailed, paragraph-form analysis from the persona\'s point of view, explaining their reasoning and identifying specific flaws or risks.'),
    riskScore: z.number().min(0).max(100).describe('A numerical score representing the severity of the risk identified by this persona (0-100).'),
    strategicPivot: z.string().optional().describe('Actionable solutions and strategic recommendations to overcome the identified risks and succeed in the market.'),
});
export type CrucibleCritique = z.infer<typeof CrucibleCritiqueSchema>;

export const CrucibleOutputSchema = z.object({
    executiveSummary: z.string().describe('A high-level summary of the most critical risks and blind spots found in the plan.'),
    critiques: z.array(CrucibleCritiqueSchema).describe('An array of detailed critiques, one for each selected adversary persona.'),
});
export type CrucibleOutput = z.infer<typeof CrucibleOutputSchema>;

// Schemas for Cosmos Flow
export const CosmosInputSchema = z.object({
    prompt: z.string().describe("A high-concept prompt for a fictional universe."),
});
export type CosmosInput = z.infer<typeof CosmosInputSchema>;

export const CosmosOutputSchema = z.object({
    title: z.string().describe("The name of the generated universe."),
    tagline: z.string().describe("A short, evocative tagline for the world."),
    description: z.string().describe("A paragraph-long overview of the world's core concept."),
    images: z.object({
        main: z.string().url().describe("URL for the main banner image representing the world."),
        map: z.string().url().describe("URL for a generated world map."),
    }),
    history: z.object({
        title: z.string().describe("Title for the history section, e.g., 'Ages of Strife'."),
        content: z.string().describe("A summary of the world's history and timeline."),
    }),
    factions: z.array(z.object({
        name: z.string().describe("Name of the faction."),
        description: z.string().describe("A description of the faction's goals, methods, and power."),
        emblemUrl: z.string().url().describe("URL for a a generated emblem for the faction."),
    })).describe("An array of major factions or powers in the world."),
    characters: z.array(z.object({
        name: z.string().describe("Name of the character."),
        description: z.string().describe("A description of the character's background and role in the world."),
        portraitUrl: z.string().url().describe("URL for a generated portrait of the character."),
    })).describe("An array of notable characters."),
});
export type CosmosOutput = z.infer<typeof CosmosOutputSchema>;

// Schemas for Catalyst Flow
export const CatalystInputSchema = z.object({
    goal: z.string().describe("The learning goal, e.g., 'Learn to bake sourdough bread'."),
});
export type CatalystInput = z.infer<typeof CatalystInputSchema>;

export const CatalystOutputSchema = z.object({
    title: z.string().describe("The title of the learning path."),
    description: z.string().describe("A short description of what the user will learn."),
    estimatedTime: z.string().describe("Estimated total time to complete, e.g., '10 hours'."),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe("The difficulty level of the course."),
    prerequisites: z.array(z.string()).describe("A list of knowledge or skills needed before starting."),
    keyTakeaways: z.array(z.string()).describe("Top 3-5 things the learner will master."),
    modules: z.array(z.object({
        title: z.string().describe("The title of the learning module."),
        description: z.string().describe("Brief overview of this module."),
        concepts: z.array(z.object({
            name: z.string().describe("The name of a specific concept."),
            explanation: z.string().describe("A clear explanation of the concept."),
            resources: z.array(z.object({
                title: z.string().describe("Title of the resource."),
                url: z.string().url().describe("URL to the resource."),
                type: z.enum(['Article', 'Video', 'Book', 'Course', 'Interactive Lab']).describe("The type of the resource."),
            })).describe("A list of curated resources to learn this concept."),
        })).describe("Concepts covered in this module."),
        project: z.object({
            title: z.string().describe("Title of a practical project for this module."),
            description: z.string().describe("Description of what the project entails."),
            steps: z.array(z.string()).optional().describe("Step-by-step instructions for the project."),
        }).describe("A hands-on project to apply the module's concepts."),
        quiz: z.array(z.object({
            question: z.string().describe("A multiple-choice question."),
            options: z.array(z.string()).describe("An array of possible answers."),
            correctAnswer: z.string().describe("The correct answer from the options."),
        })).describe("A short quiz to test understanding of the module."),
    })).describe("An array of learning modules that make up the curriculum."),
    finalExam: z.array(z.object({
        question: z.string().describe("An advanced final exam question."),
        options: z.array(z.string()).describe("An array of possible answers."),
        correctAnswer: z.string().describe("The correct answer from the options."),
    })).optional().describe("A comprehensive final assessment."),
    glossary: z.array(z.object({
        term: z.string().describe("Key term used in the course."),
        definition: z.string().describe("Definition of the term."),
    })).optional().describe("Definitions for technical terms used."),
    studyTips: z.array(z.string()).optional().describe("Effective strategies for learning this specific topic."),
});
export type CatalystOutput = z.infer<typeof CatalystOutputSchema>;


// Type for structured Blueprint output
export type CanvasItem = {
    title: string;
    subtitle: string;
    description: string;
    external_links?: Record<string, string | null>;
};

export type CanvasIntegration = {
    name: string;
    logo_url: string;
    action_type: 'deep_link' | 'search' | 'oauth_required';
    action_url?: string | null;
    oauth_required: boolean;
};

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: { url: string; title: string; preview?: string }[];
    reasoning?: string;
    confidenceScore?: number;

    // Fields for structured Blueprint output
    title?: string;
    description?: string;
    items?: CanvasItem[];
    integrations?: CanvasIntegration[];

    // Fields for structured Synthesis output
    synthesisBlocks?: SynthesisContentBlock[];

    // Fields for Live Web Agent (Canvas) output
    liveWebAgentOutput?: LiveWebAgentOutput;
    agentSteps?: AgentStep[];
}

export interface Extension {
    id: string;
    name: string;
    version: string;
    description: string;
    icon: LucideIcon;
    enabled: boolean;
    connected: boolean;
}
