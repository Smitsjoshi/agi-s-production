'use server';
/**
 * @fileOverview Implements the "Aether" flow, an AI-powered dream journal and visualizer.
 *
 * - aetherFlow - The main flow that analyzes a dream description and generates an artistic interpretation.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { AetherInputSchema, AetherOutputSchema, type AetherInput, type AetherOutput } from '@/lib/types';


const analysisPrompt = ai.definePrompt({
    name: 'aetherAnalysisPrompt',
    input: { schema: AetherInputSchema },
    output: { schema: AetherOutputSchema.omit({ imageUrl: true, id: true, timestamp: true }) },
    prompt: `You are Aether, a wise and insightful AI dream interpreter with a deep understanding of Jungian psychology, symbolism, and narrative archetypes.
    
    A user has submitted a dream. Your task is to analyze it and provide a structured interpretation. Do not be generic; be specific, creative, and introspective.
    
    User's Dream: {{{dream}}}
    
    Based on the dream, generate the following content:
    
    1.  **Title**: A short, evocative, and poetic title for the dream.
    2.  **Interpretation**: A detailed psychoanalytical interpretation of the dream. Explore the narrative, the user's potential feelings, and the underlying conflicts or desires. Connect the different symbols and themes into a cohesive analysis.
    3.  **Mood**: A single word or short phrase that captures the primary emotional tone of the dream (e.g., 'Surreal unease', 'Nostalgic joy', 'Anxious urgency').
    4.  **Themes**: A list of 2-4 key abstract themes present in the dream (e.g., "Fear of the unknown", "Desire for freedom", "Unresolved conflict").
    5.  **Symbols**: Identify 3-5 significant symbols from the dream. For each, provide its name and a concise, insightful potential meaning within the context of this specific dream.
    
    Structure your entire response as a single JSON object conforming to the output schema.`,
});


export async function aetherFlow(input: AetherInput): Promise<AetherOutput> {
    // 1. Generate the textual analysis of the dream.
    const analysisResponse = await analysisPrompt(input);
    const analysisData = analysisResponse.output;

    if (!analysisData) {
      throw new Error('Failed to generate dream analysis from the model.');
    }

    // 2. Create a detailed prompt for the image generation model based on the analysis.
    const imagePrompt = `An abstract, surreal, and dreamlike digital painting representing the following dream. 
    Mood: ${analysisData.mood}. 
    Key elements: ${analysisData.symbols.map(s => s.name).join(', ')}. 
    Core themes: ${analysisData.themes.join(', ')}. 
    Style: ethereal, vibrant colors, soft focus, painterly textures, reminiscent of surrealism. Do not include any text or letters.`;

    const { media } = await ai.generate({
        model: googleAI.model('imagen-4.0-fast-generate-001'),
        prompt: imagePrompt,
    });

    if (!media.url) {
        throw new Error('Failed to generate an image for the dream.');
    }

    // 3. Combine the analysis with the generated image URL and add metadata.
    const finalOutput: AetherOutput = {
        ...analysisData,
        id: nanoid(),
        timestamp: new Date().toISOString(),
        imageUrl: media.url,
    };
    
    return finalOutput;
}
