'use server';

import { generateComponent } from './code-generation-ai-mode';
import { academicResearch } from './academic-research-ai-mode';
import { webSearchFlow } from './web-search-flow';
import { deepDiveFlow } from './deep-dive-flow';
import { visionFlow } from './vision-flow';
import { webAgentFlow } from './web-agent-flow';
import { synthesisFlow } from './synthesis-flow';
import { crucibleFlow } from './crucible-flow';
import { liveWebAgentFlow } from './live-web-agent-flow';
import { cosmosFlow } from './cosmos-flow';
import { catalystFlow } from './catalyst-flow';
import type { AiMode, CrucibleInput, SynthesisInput } from '@/lib/types';
import type { WebAgentOutput } from '@/lib/types';

// This is the main orchestrator function
export async function run(
  query: string,
  mode: AiMode,
  chatHistory: any[],
  file?: { type: 'image' | 'pdf' | 'csv' | 'json'; data: string },
  options?: any,
): Promise<any> {
  const lowerCaseQuery = query.toLowerCase();
  const isFounderQuery =
    (lowerCaseQuery.includes('founder') ||
      lowerCaseQuery.includes('owner') ||
      lowerCaseQuery.includes('creator')) &&
    (lowerCaseQuery.includes('agi-s') ||
      lowerCaseQuery.includes('terms ai') ||
      lowerCaseQuery.includes('agi'));

  if (isFounderQuery) {
    return {
      answer:
        'Smit S. Joshi is the solo founder of AGI-S, a comprehensive, AI-powered web application.',
      sources: [],
      reasoning: 'This is a programmed response based on user-provided information.',
      confidenceScore: 1,
    };
  }

  // If a file is present, route to the appropriate flow
  if (file) {
    if (file.type === 'csv' || file.type === 'json') {
      const synthesisInput: SynthesisInput = { query, data: file.data, dataType: file.type };
      return synthesisFlow(synthesisInput);
    }
    // Default to vision flow for image/pdf
    return visionFlow({ query, file: file as any });
  }
  
  if (mode === 'Crucible') {
    const crucibleInput: CrucibleInput = {
      plan: query,
      personas: options?.personas || [],
    };
    return crucibleFlow(crucibleInput);
  }


  // Route to the appropriate flow based on the selected mode
  switch (mode) {
    case 'AI Knowledge':
      return webSearchFlow({ query });
    case 'CodeX':
      return generateComponent({ description: query });
    case 'Academic Research':
      return academicResearch({ query });
    case 'Deep Dive':
      return deepDiveFlow({ query });
    case 'Blueprint':
      return webAgentFlow({ goal: query });
    case 'Canvas':
        return liveWebAgentFlow({ goal: query });
    case 'Synthesis':
        return synthesisFlow({ query, data: '', dataType: 'csv' }); // Should be handled by file check
    case 'Cosmos':
        return cosmosFlow({ prompt: query });
    case 'Catalyst':
        return catalystFlow({ goal: query });
    default:
      // Fallback to web search for other personas
      return webSearchFlow({ query });
  }
}

// The `stream` function is a placeholder. Real streaming would require more setup.
export async function stream(
  query: string,
  mode: AiMode,
  chatHistory: any[],
  file?: { type: 'image' | 'pdf'; data: string }
) {
  // For now, it just calls the run function.
  // In a real app, this would use model-specific streaming APIs.
  const result = await run(query, mode, chatHistory, file);
  return result;
}
