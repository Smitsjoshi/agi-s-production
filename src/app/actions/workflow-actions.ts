'use server';

import { nanoid } from 'nanoid';

// We re-implement a safe Groq caller here to avoid circular deps or complex refactors of actions.ts
async function callGroqJSON<T>(prompt: string, model: string = 'openai/gpt-oss-120b'): Promise<T> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);
    const data = await response.json();
    try {
        return JSON.parse(data.choices[0]?.message?.content || '{}') as T;
    } catch (e) {
        throw new Error("Failed to parse AI JSON response");
    }
}

export type GeneratedNode = {
    id: string;
    type: 'custom';
    data: {
        title: string;
        description: string;
        iconName: string; // We will map this to Lucide icons on client
        isTrigger?: boolean;
        config?: {
            prompt?: string;
            url?: string;
        }
    };
    position: { x: number; y: number };
};

export type GeneratedEdge = {
    id: string;
    source: string;
    target: string;
    type: string; // 'smoothstep'
    animated?: boolean;
    label?: string; // For decision branches
};

export type GeneratedWorkflow = {
    nodes: GeneratedNode[];
    edges: GeneratedEdge[];
};

export async function generateWorkflowAction(userPrompt: string): Promise<{ success: boolean; data?: GeneratedWorkflow; error?: string }> {
    try {
        const prompt = `You are an Expert Workflow Architect.
    Create a detailed comprehensive automation workflow based on this request: "${userPrompt}".

    You must output a JSON object representing the graph (Nodes and Edges).
    
    RULES:
    1.  **Nodes**: Create detailed nodes. 
        -   Use 'title' for a short name (e.g. "YouTube Search", "Logic Split", "Slack Alert").
        -   Use 'description' for what it does.
        -   Use 'iconName' to suggest a Lucide icon (e.g. "Search", "Slack", "Brain", "Calculator", "Mail").
        -   Use 'config.prompt' to give specific instructions to that node (e.g. "Search for 'AI Tools'", "Calculate likes/views ratio").
    2.  **Logic & Loops**: If the user implies complex logic (e.g. "if x < y", "retry", "loop"), create a node with title "Logic Check" or "Router".
    3.  **Position**: Layout the nodes visually in a logical flow. Start at x:100, y:100 and move right/down. Spacing x:350, y:150.
    4.  **Edges**: Connect the nodes significantly. logic nodes should have labels on edges if possible (e.g. "True", "False").

    Output Schema:
    {
      "nodes": [
        { "id": "1", "data": { "title": "...", "description": "...", "iconName": "...", "isTrigger": true, "config": { "prompt": "..." } }, "position": { "x": 100, "y": 100 } }
      ],
      "edges": [
        { "id": "e1-2", "source": "1", "target": "2", "label": "optional label" }
      ]
    }`;

        const result = await callGroqJSON<GeneratedWorkflow>(prompt);

        // Post-process to ensure IDs and types are correct
        const processedNodes = result.nodes.map(n => ({
            ...n,
            type: 'custom',
            id: n.id || nanoid(),
            data: {
                ...n.data,
                iconName: n.data.iconName || 'Activity'
            }
        }));

        const processedEdges = result.edges.map(e => ({
            ...e,
            id: e.id || `e${e.source}-${e.target}`,
            type: 'smoothstep',
            animated: true
        }));

        return { success: true, data: { nodes: processedNodes as any, edges: processedEdges as any } };

    } catch (error: any) {
        console.error("Workflow Gen Error:", error);
        return { success: false, error: error.message || "Failed to generate workflow" };
    }
}
