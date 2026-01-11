/**
 * Multi-Model AI Orchestration System
 * Routes coding tasks to the best AI model for each specific job
 */

export type CodeTask =
    | 'planning'
    | 'frontend'
    | 'backend'
    | 'testing'
    | 'optimization'
    | 'documentation'
    | 'debugging';

export interface ModelConfig {
    name: string;
    endpoint: string;
    strengths: string[];
}

// Model registry - best AI for each task
const MODEL_REGISTRY: Record<CodeTask, string> = {
    planning: 'llama-3.3-70b',        // Fast, free, good at breaking down tasks
    frontend: 'deepseek-coder',       // Specialized for UI/React code
    backend: 'llama-3.3-70b',         // Good for API logic
    testing: 'llama-3.3-70b',         // Edge case detection
    optimization: 'llama-3.3-70b',    // Performance improvements
    documentation: 'llama-3.3-70b',   // Clear explanations
    debugging: 'deepseek-coder'       // Error analysis
};

/**
 * Route a coding task to the optimal AI model
 */
export async function routeToModel(
    task: CodeTask,
    prompt: string,
    context?: string
): Promise<string> {
    const modelId = MODEL_REGISTRY[task];

    // Build enhanced prompt with task-specific instructions
    const enhancedPrompt = buildTaskPrompt(task, prompt, context);

    // Call the selected model
    return await callGroqModel(modelId, enhancedPrompt);
}

/**
 * Build task-specific prompts for better results
 */
function buildTaskPrompt(task: CodeTask, prompt: string, context?: string): string {
    const taskInstructions: Record<CodeTask, string> = {
        planning: `You are a software architect. Break down this task into clear, actionable steps.
Focus on: file structure, dependencies, and implementation order.`,

        frontend: `You are a React/Next.js expert. Generate clean, modern UI code.
Use: TypeScript, Tailwind CSS, shadcn/ui components.
Focus on: responsive design, accessibility, performance.`,

        backend: `You are a backend engineer. Generate robust API code.
Use: Next.js API routes, TypeScript, proper error handling.
Focus on: security, validation, scalability.`,

        testing: `You are a QA engineer. Generate comprehensive tests.
Use: Jest, React Testing Library, edge cases.
Focus on: coverage, reliability, maintainability.`,

        optimization: `You are a performance engineer. Optimize this code.
Focus on: speed, memory usage, best practices.
Provide: specific improvements with explanations.`,

        documentation: `You are a technical writer. Document this code clearly.
Focus on: usage examples, API reference, edge cases.
Use: JSDoc format, clear explanations.`,

        debugging: `You are a debugging expert. Analyze and fix this error.
Focus on: root cause, fix, prevention.
Provide: exact code changes needed.`
    };

    const instruction = taskInstructions[task];
    const contextSection = context ? `\n\nContext:\n${context}` : '';

    return `${instruction}\n\nTask:\n${prompt}${contextSection}`;
}

/**
 * Call Groq API with specified model
 */
async function callGroqModel(modelId: string, prompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error('GROQ_API_KEY not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: modelId,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert software engineer. Provide precise, production-ready code.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3, // Lower for more consistent code
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Model API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

/**
 * Orchestrate a full-stack app generation
 * Uses multiple models in sequence for best results
 */
export async function generateFullStack(description: string): Promise<{
    plan: string;
    frontend: string;
    backend: string;
    tests: string;
}> {
    // Step 1: Plan with fast model
    const plan = await routeToModel('planning',
        `Create a detailed implementation plan for: ${description}`
    );

    // Step 2: Generate frontend with specialist
    const frontend = await routeToModel('frontend',
        `Generate React components based on this plan:\n${plan}`,
        description
    );

    // Step 3: Generate backend
    const backend = await routeToModel('backend',
        `Generate API routes based on this plan:\n${plan}`,
        description
    );

    // Step 4: Generate tests
    const tests = await routeToModel('testing',
        `Generate tests for this application`,
        `Frontend:\n${frontend}\n\nBackend:\n${backend}`
    );

    return { plan, frontend, backend, tests };
}

/**
 * Smart code improvement using multi-model approach
 */
export async function improveCode(
    code: string,
    goal: 'performance' | 'readability' | 'security'
): Promise<string> {
    const task = goal === 'performance' ? 'optimization' : 'debugging';

    const prompts = {
        performance: `Optimize this code for speed and efficiency:\n${code}`,
        readability: `Improve code readability and maintainability:\n${code}`,
        security: `Fix security vulnerabilities in this code:\n${code}`
    };

    return await routeToModel(task, prompts[goal]);
}
