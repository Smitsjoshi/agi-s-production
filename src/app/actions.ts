'use server';

import { cosmicFlow } from '@/ai/cosmic-node';
import { addChatMessage } from '@/lib/firebase/firestore';
import type { AiMode, SynthesisOutput, CrucibleOutput, CrucibleInput, CatalystOutput, CatalystInput, ContinuumInput, ContinuumOutput, AetherInput, AetherOutput, CosmosInput, CosmosOutput, AudioInput, AudioOutput, VideoInput, VideoOutput } from '@/lib/types';
import { ADVERSARY_PERSONAS } from '@/lib/personas';
import { nanoid } from 'nanoid';

export async function askAi(
  query: string,
  mode: AiMode,
  chatHistory: any[],
  file?: { type: 'image' | 'pdf' | 'csv' | 'json'; data: string },
  options?: any,
) {
  try {
    // Basic validation
    if (!query && !file) {
      throw new Error("Either a query or a file must be provided.");
    }

    // Here, you would add more complex logic based on the `mode` and `file` type.
    // For this example, we'll just use the cosmicFlow.
    
    const result = await cosmicFlow(query, mode, chatHistory, file, options);
    const answer = result.text();

    // Save chat to Firestore
    await addChatMessage({
      query,
      answer,
      timestamp: new Date(),
    });

    return { answer };

  } catch (error: any) {
    console.error("[askAi Error]", error);
    // Log the error to your preferred logging service

    return { 
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An unexpected error occurred. Please try again.'
    };
  }
}

export async function createAgentAction(data: { name: string; persona: string; knowledgeBaseUrls: string[] }) {
    console.log('Creating agent with data:', data);
    // In a real application, you would save this to a database.
    // For now, we'll just simulate a successful creation.
    return { success: true };
}

export async function generateSynthesisAction(input: {
  query: string;
  type: 'csv' | 'json';
  data: string;
}): Promise<SynthesisOutput> {
  console.log('Generating synthesis with input:', input.query);

  // In a real application, you would call your AI flow here with the input.
  // const result = await synthesisFlow(input);
  // For now, we'll return a mock, structured result.

  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

  const mockOutput: SynthesisOutput = {
    content: [
      {
        type: 'text',
        content: `Based on your query "${input.query}" and the provided ${input.type.toUpperCase()} data, here is the generated analysis. This summary highlights the key findings and visualizations from your dataset.`,
      },
      {
        type: 'chart',
        title: 'Sales Distribution by Region',
        chartType: 'bar',
        data: [
          { name: 'North', sales: 4000, profit: 2400 },
          { name: 'South', sales: 3000, profit: 1398 },
          { name: 'East', sales: 2000, profit: 9800 },
          { name: 'West', sales: 2780, profit: 3908 },
        ],
      },
      {
        type: 'table',
        title: 'Detailed Regional Data',
        headers: ['Region', 'Sales', 'Profit', 'Units Sold'],
        rows: [
          ['North', 4000, 2400, 800],
          ['South', 3000, 1398, 650],
          ['East', 2000, 9800, 400],
          ['West', 2780, 3908, 720],
          ['Central', 1890, 4800, 500],
        ],
      },
      {
        type: 'text',
        content: 'The analysis indicates a strong performance in the East region in terms of profit, despite having lower sales. Further investigation into profit margins per unit in this region is recommended.',
      },
    ],
  };

  return mockOutput;
}

export async function generateCrucibleAction(input: CrucibleInput): Promise<{ success: boolean; data?: CrucibleOutput; error?: string; }> {
  console.log('Running crucible simulation with plan:', input.plan);
  console.log('Selected personas:', input.personas);

  // In a real app, this would call the Crucible AI flow.
  // For now, we simulate the AI analysis with a delay.
  await new Promise(resolve => setTimeout(resolve, 3000));

  const selectedPersonasDetails = ADVERSARY_PERSONAS.filter(p => input.personas.includes(p.id));

  const mockCritiques = selectedPersonasDetails.map(persona => {
    switch (persona.id) {
      case 'cfo':
        return {
          personaName: persona.name,
          keyConcerns: ['High Burn Rate', 'Unclear ROI', 'Subscription Churn'],
          analysis: `Your plan to launch a new productivity app is concerning from a financial standpoint. The proposed subscription model of $5/month seems optimistic given the competitive landscape. We need a more detailed financial projection, including customer acquisition costs (CAC) and lifetime value (LTV). The initial development and marketing budget seems insufficient, which could lead to a high burn rate without a clear path to profitability.`
        };
      case 'competitor_ceo':
        return {
          personaName: persona.name,
          keyConcerns: ['Feature Parity', 'Market Saturation', 'Easy to Replicate'],
          analysis: `This market is already saturated with established players. Your core features can be easily replicated by our team in a single quarter. We can leverage our existing user base to offer a similar, or even better, product at a lower price point or as a free add-on to our current suite. Your go-to-market strategy doesn't present a significant barrier to entry.`
        };
      case 'ethicist':
          return {
            personaName: persona.name,
            keyConcerns: ['Data Privacy', 'Algorithmic Bias', 'Potential for Misuse'],
            analysis: `The plan to collect user data for productivity analysis raises significant ethical questions. How will you ensure user privacy and prevent this data from being used for surveillance? There's also a risk of algorithmic bias, where the app might unfairly penalize certain work styles. We must consider the potential for this tool to be used by employers in ways that harm employee well-being.`
          }
      default:
        return {
          personaName: persona.name,
          keyConcerns: ['General Concern 1', 'General Concern 2'],
          analysis: `This is a generic critique for the ${persona.name}. A more specific, AI-generated critique would be dynamically created based on the user's actual plan.`
        };
    }
  });

  const mockOutput: CrucibleOutput = {
    executiveSummary: `The proposed plan to launch a new productivity app faces significant financial, competitive, and ethical challenges. The Red Team analysis indicates a high risk of market rejection and unsustainable financial performance unless key strategic changes are made.`,
    critiques: mockCritiques,
  };

  return { success: true, data: mockOutput };
}

export async function generateCatalystAction(input: CatalystInput): Promise<{ success: boolean; data?: CatalystOutput; error?: string; }> {
  console.log('Generating catalyst learning path for goal:', input.goal);

  // In a real app, this would call the Catalyst AI flow.
  await new Promise(resolve => setTimeout(resolve, 2500));

  // This is a mock output. A real implementation would generate this dynamically.
  const mockOutput: CatalystOutput = {
    title: `Learning Path: ${input.goal}`,
    description: `A personalized curriculum designed to help you achieve your goal of learning to bake sourdough bread, from beginner to advanced.`,
    modules: [
      {
        title: 'Module 1: The Foundation - Your First Sourdough Starter',
        concepts: [
          {
            name: 'Understanding Sourdough Starters',
            explanation: 'A sourdough starter is a live culture of wild yeast and bacteria. It\'s the heart of your bread, giving it flavor and leavening. We will learn how to create one from just flour and water.',
            resources: [
              { title: 'King Arthur Flour\'s Guide to Sourdough Starter', url: 'https://www.kingarthurbaking.com/recipes/sourdough-starter-recipe', type: 'Article' },
              { title: 'How to Make a Sourdough Starter from Scratch', url: 'https://www.youtube.com/watch?v=sTAiDki7AQA', type: 'Video' },
            ]
          },
          {
            name: 'Feeding and Maintaining Your Starter',
            explanation: 'A starter needs regular \'feedings\' to stay active and healthy. We\'ll cover feeding schedules, signs of a healthy starter, and how to troubleshoot common issues.',
            resources: [
               { title: 'The Perfect Loaf - Sourdough Starter Maintenance', url: 'https://www.theperfectloaf.com/sourdough-starter-maintenance-routine/', type: 'Article' }
            ]
          }
        ],
        project: {
          title: 'Create & Nurture Your Starter',
          description: 'Over the next 7-10 days, you will create your own sourdough starter, feed it daily, and document its growth and activity through a journal.'
        },
        quiz: [
          { question: 'What are the two main ingredients of a sourdough starter?', options: ['Flour and Water', 'Yeast and Sugar', 'Flour and Milk', 'Water and Salt'], correctAnswer: 'Flour and Water' },
          { question: 'How often should you typically feed a new starter?', options: ['Once a week', 'Once a month', 'Every 24 hours', 'Every 4 hours'], correctAnswer: 'Every 24 hours' }
        ]
      },
      {
        title: 'Module 2: Your First Loaf - Mixing, Shaping, and Baking',
        concepts: [
           {
            name: 'Baker\'s Percentages and Basic Dough Formula',
            explanation: 'Learn the fundamentals of dough composition using baker\'s percentages to ensure consistency and allow for easy recipe scaling.',
            resources: [
              { title: 'What Are Baker\'s Percentages?', url: 'https://www.kingarthurbaking.com/pro/reference/bakers-percentage', type: 'Article' },
            ]
          },
          {
            name: 'The Bulk Fermentation and Proofing Process',
            explanation: 'Understand the critical steps of bulk fermentation (the first rise) and final proofing, and how to know when your dough is ready.',
            resources: [
              { title: 'The Importance of Bulk Fermentation', url: 'https://www.youtube.com/watch?v=HlJEjW-QSnQ', type: 'Video' },
            ]
          }
        ],
        project: {
          title: 'Bake a Beginner Sourdough Loaf',
          description: 'Using your active starter, you will mix, ferment, shape, and bake your very first loaf of sourdough bread following a step-by-step recipe.'
        },
        quiz: [
          { question: 'The first rise of the dough is called?', options: ['Proofing', 'Bulk Fermentation', 'Autolyse', 'Scoring'], correctAnswer: 'Bulk Fermentation' },
          { question: 'What is the main purpose of scoring the loaf before baking?', options: ['To make it look pretty', 'To control how the bread expands', 'To reduce the baking time', 'To add flavor'], correctAnswer: 'To control how the bread expands' }
        ]
      }
    ]
  };

  return { success: true, data: mockOutput };
}

export async function generateContinuumAction(input: ContinuumInput): Promise<{ success: boolean; data?: ContinuumOutput; error?: string; }> {
  console.log('Generating continuum snapshot for event:', input.eventDescription);

  // In a real app, this would call the Continuum AI flow.
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const isFuture = input.eventDescription.includes('20') || input.eventDescription.toLowerCase().includes('future');

  const mockOutput: ContinuumOutput = {
    title: `Simulating: ${input.eventDescription}`,
    era: isFuture ? '2077' : '1969',
    mainImageUrl: 'https://storage.googleapis.com/cosmic-verve-static-assets/continuum-placeholder.png',
    narrative: {
      title: 'An Eyewitness Account',
      story: isFuture 
        ? `The crimson dust of Mars clung to everything. From my viewport in Neo-Olympia, I saw the first city lights flicker to life. We had done it. Humanity was now a multi-planetary species. The air recyclers hummed a constant, reassuring tune, a stark contrast to the silent, cold void outside. It was a moment of triumph, tinged with the immense weight of the unknown that lay ahead of us on this new frontier.`
        : `The static in my headset crackled. \"The Eagle has landed,\" a voice said, a quarter-million miles away. We were holding our breath in Mission Control. The world was. Time seemed to stop. Then, those first, ghostly images appeared on the monitor. A boot, stepping onto the lunar surface. A flag, planted where no flag had flown before. It was a moment that united the entire planet in awe and wonder.`
    },
    report: {
      title: isFuture ? 'The Martian Chronicle' : 'Houston Post-Dispatch',
      content: isFuture
        ? `In a landmark achievement for mankind, the Ares-1 mission successfully established humanity\'s first permanent settlement on Mars today. The 'Neo-Olympia' habitat is now fully operational, according to the United Space Alliance. Mission Commander Eva Rostova confirmed system functionality at 0800 UTC, marking a new chapter in our species\' journey.`
        : `MAN ON MOON. In a feat that will define the 20th century, American astronauts Neil Armstrong and Edwin \"Buzz\" Aldrin Jr. landed on the Moon today at 4:17 PM EDT. The successful landing of the Apollo 11 lunar module, named \"Eagle,\" fulfills the late President John F. Kennedy\'s pledge to land a man on the Moon and return him safely to the Earth before the decade is out.`,
      source: isFuture ? 'Martian News Network (MNN)' : 'Associated Press Wire'
    },
    whatIf: [
      {
        scenario: 'What if the landing had failed?',
        description: isFuture
          ? 'A catastrophic failure would have set back interplanetary colonization by decades and could have bankrupted the United Space Alliance, leaving Earth-bound tensions to fester without a common goal.'
          : 'A disaster on the lunar surface would have been a devastating blow to the American space program and national morale, potentially ceding the Space Race to the Soviet Union indefinitely.'
      },
      {
        scenario: 'What if they discovered microbial life?',
        description: isFuture
          ? 'The discovery of even simple Martian life would have fundamentally altered science, philosophy, and religion overnight, forcing humanity to reconsider its place in the cosmos.'
          : 'Finding life, even microbial, on the Moon would have been the single greatest scientific discovery in history, shifting global priorities towards space exploration and astrobiology research on an unprecedented scale.'
      },
       {
        scenario: 'What if the political climate was different?',
        description: isFuture
          ? 'Without the backdrop of a unified Earth government, the mission could have been a point of conflict, a race for resources and territory rather than a collaborative human endeavor.'
          : 'If the Space Race hadn\'t been fueled by Cold War tensions, the moon landing might have been a slower, more international effort, changing the technological and political landscape of the late 20th century.'
      }
    ]
  };

  return { success: true, data: mockOutput };
}

export async function generateAetherAction(input: AetherInput): Promise<{ success: boolean; data?: AetherOutput; error?: string; }> {
  console.log('Generating aether interpretation for dream:', input.dream);

  // In a real app, this would call the Aether AI flow.
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  const mockOutput: AetherOutput = {
    id: nanoid(),
    timestamp: new Date().toISOString(),
    title: "The Endless Library",
    interpretation: "The dream of an endless library often symbolizes a quest for knowledge, a desire for understanding, or a feeling of being overwhelmed by infinite choices. Your journey through the aisles represents your own path through life, with each book representing a different path, choice, or piece of wisdom. The fact that you couldn't find a specific book may indicate a feeling of being lost or uncertain about your current direction.",
    mood: "Surreal & Inquisitive",
    themes: ["Quest for Knowledge", "Feeling of Being Lost", "Infinite Possibilities"],
    symbols: [
      { name: "Library", meaning: "Represents the querent's mind, knowledge, and memories. An endless library can suggest a feeling of being overwhelmed or a vast, untapped potential." },
      { name: "Flying Books", meaning: "Symbolizes ideas and inspiration that feel just out of reach. They may represent fleeting thoughts or creative concepts that are difficult to grasp." },
      { name: "Labyrinthine Aisles", meaning: "Reflects a complex situation or a period of confusion in the dreamer's life. Navigating the maze is akin to navigating life\'s challenges." }
    ],
    imageUrl: "https://storage.googleapis.com/cosmic-verve-static-assets/aether-placeholder.png",
  };

  return { success: true, data: mockOutput };
}

export async function generateCosmosAction(input: CosmosInput): Promise<{ success: boolean; data?: CosmosOutput; error?: string; }> {
  console.log('Generating cosmos for prompt:', input.prompt);

  await new Promise(resolve => setTimeout(resolve, 4000));

  const mockOutput: CosmosOutput = {
    title: "Aethelgard, the Gilded Kingdom",
    tagline: "Where Clockwork Legions March Under a Steam-Powered Sun",
    description: "Aethelgard is a world of gleaming brass and polished marble, a dieselpunk reimagining of a Roman Empire that never fell. Its legions, now powered by intricate clockwork and steam engines, maintain an iron grip on a continent-spanning empire. Yet, beneath the veneer of gilded progress, whispers of rebellion and the hum of forbidden magic threaten to shatter the eternal city.",
    images: {
      main: "https://storage.googleapis.com/cosmic-verve-static-assets/cosmos-main-placeholder.png",
      map: "https://storage.googleapis.com/cosmic-verve-static-assets/cosmos-map-placeholder.png",
    },
    history: {
      title: "The Unbroken Timeline",
      content: "The 'Great Schism' of 312 AD was not a religious one, but a technological one. While Constantine looked to the heavens, his rival Maxentius delved into the earth, discovering the principles of geothermal power. This pivotal moment led to an industrial revolution centuries ahead of its time. The Roman Empire, rebranded as the Aethelgardian Empire, never crumbled. Instead, it grew, its power cemented not just by the sword, but by the piston and the gear.",
    },
    factions: [
      {
        name: "The Cogwork Senate",
        description: "The ruling body of Aethelgard, a council of engineers, aristocrats, and generals who believe in progress at any cost. They maintain order through their formidable Clockwork Praetorians.",
        emblemUrl: "https://storage.googleapis.com/cosmic-verve-static-assets/faction-cog-placeholder.png",
      },
      {
        name: "The Children of Ludd",
        description: "A secret society of artisans and mystics who see the Empire's reliance on technology as a perversion of nature. They practice forbidden elemental magic and seek to dismantle the steam-powered status quo.",
        emblemUrl: "https://storage.googleapis.com/cosmic-verve-static-assets/faction-ludd-placeholder.png",
      },
    ],
    characters: [
      {
        name: "Praetor Valerius Machina",
        description: "The brilliant, ruthless commander of the IX Clockwork Legion, a man more machine than human after numerous battle-augments.",
        portraitUrl: "https://storage.googleapis.com/cosmic-verve-static-assets/char-praetor-placeholder.png",
      },
      {
        name: "Lyra of the Whispering Woods",
        description: "A powerful druid of the Children of Ludd, capable of weaving illusions and commanding the overgrown, forgotten places of the world.",
        portraitUrl: "https://storage.googleapis.com/cosmic-verve-static-assets/char-lyra-placeholder.png",
      },
      {
        name: "Gaius, the Gutter-Rat Inventor",
        description: "A rogue inventor from the underbelly of Neo-Roma, who crafts ingenious gadgets from scrap metal for the highest bidder.",
        portraitUrl: "https://storage.googleapis.com/cosmic-verve-static-assets/char-gaius-placeholder.png",
      },
    ]
  };

  return { success: true, data: mockOutput };
}

export async function generateAudioAction(input: AudioInput): Promise<{ success: boolean; data?: AudioOutput; error?: string; }> {
    console.log("Generating audio for text:", input.text.substring(0, 50) + "...");
    console.log("Selected voice:", input.voice);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you would call your TTS provider here and get back a real audio URI.
    const mockAudioDataUri = "https://storage.googleapis.com/cosmic-verve-static-assets/mock-audio.mp3";

    return { success: true, data: { audioDataUri: mockAudioDataUri } };
}

export async function generateVideoAction(prompt: VideoInput): Promise<{ success: boolean; data?: VideoOutput; error?: string; }> {
    console.log("Generating video for prompt:", prompt);

    await new Promise(resolve => setTimeout(resolve, 5000));

    // In a real app, you would call your video generation provider here.
    const mockVideoDataUri = "https://storage.googleapis.com/cosmic-verve-static-assets/mock-video.mp4";

    return { success: true, data: { videoDataUri: mockVideoDataUri } };
}
