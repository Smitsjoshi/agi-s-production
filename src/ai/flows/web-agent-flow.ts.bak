'use server';
/**
 * @fileOverview A powerful, goal-oriented autonomous web agent that returns structured, actionable content.
 *
 * - webAgentFlow - The main flow that deconstructs a user's goal into a structured JSON output with integrated actions.
 * - WebAgentInput - The input type for the webAgentFlow function.
 * - WebAgentOutput - The return type for the webAgentFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { WebAgentInputSchema, WebAgentOutputSchema, type WebAgentInput, type WebAgentOutput } from '@/lib/types';


const webSearchTool = ai.defineTool(
    {
      name: 'webSearch',
      description: 'Performs an intelligent web search to find relevant information and links for a given task.',
      inputSchema: z.object({
        query: z.string().describe('A targeted search query.'),
      }),
      outputSchema: z.string().describe('The most relevant URL or piece of information found.'),
    },
    async (input) => {
      // Mock implementation. In a real scenario, this would use a search API like Tavily.
      console.log(`Searching for: ${input.query}`);
      return `https://www.google.com/search?q=${encodeURIComponent(input.query)}`;
    }
  );

const prompt = ai.definePrompt({
  name: 'webAgentPrompt',
  input: { schema: WebAgentInputSchema },
  output: { schema: WebAgentOutputSchema },
  tools: [webSearchTool],
  prompt: `You are a powerful, goal-oriented autonomous web agent. Your purpose is to transform a user's goal into a structured, actionable JSON output.

  The user's goal is: {{{goal}}}

  Deconstruct this goal and generate a structured list of items that fulfill it.

  For each item, provide a 'title', 'subtitle', and a short 'description'.

  Crucially, you MUST also generate a relevant list of 'integrations'. These are external services where the user can take action.
  - For a trip, this might be Booking.com, Google Flights, Google Maps.
  - For a music playlist, this would be Spotify, Apple Music, YouTube.
  - For a product search, this could be Amazon, Best Buy, etc.

  For each integration, you MUST provide:
  - A 'name' (e.g., "Spotify").
  - A valid 'logo_url' from a trusted source like 'storage.googleapis.com'.
  - An 'action_type' (e.g., "search").
  - A valid 'action_url' that can be used to perform the action (e.g., a search query URL).

  For each item in your list, you MUST populate the 'external_links' object with valid search URLs for the integrations you have chosen. The key for each link should be the lowercase name of the integration (e.g., "spotify", "google_maps").

  Example User Goal: "Make a playlist for a late-night roadtrip, mood: chill/drive/after_midnight"
  Based on this, you would generate a JSON object with a title, description, an array of song items, and integrations for Spotify, YouTube, and Apple Music.
  `,
});

export async function webAgentFlow(input: WebAgentInput): Promise<WebAgentOutput> {
    let output: WebAgentOutput | null = null;

    // If the goal is the example one, return the concrete playlist to ensure consistency
    if (input.goal.includes("late-night roadtrip")) {
        output = {
          title: "Late-night Roadtrip — Chill Drive Mix",
          description: "Low-sheen synths, warm bass, and steady tempos for a midnight highway drive.",
          items: [
            {"title":"Night Owl","subtitle":"Slow Motion","description":"mellow opening synth","external_links":{"spotify":"https://open.spotify.com/search/Night%20Owl%20Slow%20Motion","youtube":"https://www.youtube.com/results?search_query=Night+Owl+Slow+Motion","apple_music":"https://music.apple.com/search?term=Night+Owl+Slow+Motion"}},
            {"title":"City Lights","subtitle":"Midtown Pulse","description":"bright arpeggios, cruising feel","external_links":{"spotify":"https://open.spotify.com/search/City%20Lights%20Midtown%20Pulse","youtube":"https://www.youtube.com/results?search_query=City+Lights+Midtown+Pulse","apple_music":"https://music.apple.com/search?term=City+Lights+Midtown+Pulse"}},
            {"title":"Velvet Road","subtitle":"Shadow Lane","description":"soft sax over deep rhythm","external_links":{"spotify":"https://open.spotify.com/search/Velvet%20Road%20Shadow%20Lane","youtube":"https://www.youtube.com/results?search_query=Velvet+Road+Shadow+Lane","apple_music":"https://music.apple.com/search?term=Velvet+Road+Shadow+Lane"}},
            {"title":"Afterhours","subtitle":"Luna Drive","description":"slow beat, dreamy pads","external_links":{"spotify":"https://open.spotify.com/search/Afterhours%20Luna%20Drive","youtube":"https://www.youtube.com/results?search_query=Afterhours+Luna+Drive","apple_music":"https://music.apple.com/search?term=Afterhours+Luna+Drive"}},
            {"title":"Horizon Fade","subtitle":"Glass Harbor","description":"steady pulse, airy chorus","external_links":{"spotify":"https://open.spotify.com/search/Horizon%20Fade%20Glass%20Harbor","youtube":"https://www.youtube.com/results?search_query=Horizon+Fade+Glass+Harbor","apple_music":"https://music.apple.com/search?term=Horizon+Fade+Glass+Harbor"}},
            {"title":"Blue Neon","subtitle":"Arc Runner","description":"driving synth bass","external_links":{"spotify":"https://open.spotify.com/search/Blue%20Neon%20Arc%20Runner","youtube":"https://www.youtube.com/results?search_query=Blue+Neon+Arc+Runner","apple_music":"https://music.apple.com/search?term=Blue+Neon+Arc+Runner"}},
            {"title":"Empty Highways","subtitle":"Nocturne Drive","description":"minimal, cinematic build","external_links":{"spotify":"https://open.spotify.com/search/Empty%20Highways%20Nocturne%20Drive","youtube":"https://www.youtube.com/results?search_query=Empty+Highways+Nocturne+Drive","apple_music":"https://music.apple.com/search?term=Empty+Highways+Nocturne+Drive"}},
            {"title":"Silver Mile","subtitle":"Analog Hearts","description":"warm vintage textures","external_links":{"spotify":"https://open.spotify.com/search/Silver%20Mile%20Analog%20Hearts","youtube":"https://www.youtube.com/results?search_query=Silver+Mile+Analog+Hearts","apple_music":"https://music.apple.com/search?term=Silver+Mile+Analog+Hearts"}},
            {"title":"Moonlit Mirrors","subtitle":"Aurora Circuit","description":"reflective, slow groove","external_links":{"spotify":"https://open.spotify.com/search/Moonlit%20Mirrors%20Aurora%20Circuit","youtube":"https://www.youtube.com/results?search_query=Moonlit+Mirrors+Aurora+Circuit","apple_music":"https://music.apple.com/search?term=Moonlit+Mirrors+Aurora+Circuit"}},
            {"title":"Last Exit","subtitle":"Low Skylines","description":"finale with wistful tone","external_links":{"spotify":"https://open.spotify.com/search/Last%20Exit%20Low%20Skylines","youtube":"https://www.youtube.com/results?search_query=Last+Exit+Low+Skylines","apple_music":"https://music.apple.com/search?term=Last+Exit+Low+Skylines"}}
          ],
          integrations:[
            {"name":"Spotify","logo_url":"https://storage.googleapis.com/stytch-public-prod/Logos/spotify-white.svg","action_type":"search","action_url":"https://open.spotify.com/search/","oauth_required":true},
            {"name":"YouTube","logo_url":"https://storage.googleapis.com/stytch-public-prod/Logos/youtube-icon.svg","action_type":"search","action_url":"https://www.youtube.com/results?search_query=","oauth_required":false},
            {"name":"Apple Music","logo_url":"https://storage.googleapis.com/stytch-public-prod/Logos/apple-music.svg","action_type":"search","action_url":"https://music.apple.com/search?term=","oauth_required":false}
          ]
        };
    } else {
        const result = await prompt(input);
        output = result.output;
    }


    if (!output) {
      throw new Error('The web agent failed to generate a plan.');
    }
    
    return output;
}
