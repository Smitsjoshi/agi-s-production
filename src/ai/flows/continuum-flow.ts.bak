'use server';
/**
 * @fileOverview Implements the "Continuum" flow, an AI-powered historical and future event simulator.
 *
 * - continuumFlow - The main flow that generates a multi-faceted snapshot of a given event.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { ContinuumInputSchema, ContinuumOutputSchema, type ContinuumInput, type ContinuumOutput } from '@/lib/types';


const eventAnalysisPrompt = ai.definePrompt({
    name: 'eventAnalysisPrompt',
    input: { schema: ContinuumInputSchema },
    output: { schema: ContinuumOutputSchema },
    prompt: `You are a historical and speculative fiction AI named "Continuum". Your purpose is to create an immersive, multi-faceted snapshot of a given event.

    User's Event: {{{eventDescription}}}
    
    Based on the user's event, generate the following content:
    
    1.  **Title and Era**: A concise title for the event and the year/era it takes place.
    2.  **Main Image**: You will generate an image later, but for now, provide a placeholder URL. A fitting URL would be 'https://picsum.photos/seed/event/1200/600'.
    3.  **Narrative**: Write a compelling, first-person narrative from the perspective of an individual experiencing the event. Give it a suitable title.
    4.  **Report**: Create a simulated news report or an official document from that time period. Include a title and a fictional source name (e.g., 'The Martian Chronicle', 'The Boston Post').
    5.  **What If Scenarios**: Generate 3-4 intriguing "What if?" scenarios that explore alternative outcomes of this event. Each scenario needs a short description of the potential consequences.
    
    Structure your entire response as a single JSON object conforming to the output schema.`,
});


export async function continuumFlow(input: ContinuumInput): Promise<ContinuumOutput> {
    // 1. Generate the textual content first
    const analysisResponse = await eventAnalysisPrompt(input);
    let eventData = analysisResponse.output;

    if (!eventData) {
      throw new Error('Failed to generate event analysis from the model.');
    }

    // 2. Generate the image based on the event description
    const imagePrompt = `A cinematic, realistic photograph capturing the essence of: ${eventData.title}, ${eventData.era}. Style: historical photo, high detail, dramatic lighting.`;

    const { media } = await ai.generate({
        model: googleAI.model('imagen-4.0-fast-generate-001'),
        prompt: imagePrompt,
    });

    if (!media.url) {
        throw new Error('Failed to generate an image for the event.');
    }

    // 3. Update the image URL in the final output object
    eventData.mainImageUrl = media.url;
    
    return eventData;
}
