/**
 * AGI-S Universal Action Layer (UAL)™
 * Copyright © 2024-2025 AGI-S Technologies
 * Patent Pending
 * 
 * Foundational technology enabling AI to interact with any web
 * interface through natural language and autonomous execution.
 * 
 * @license Proprietary
 */

export interface WebAction {
    type: 'navigate' | 'click' | 'type' | 'scroll' | 'wait' | 'screenshot' | 'extract' | 'press';
    selector?: string;
    value?: string;
    url?: string;
    timeout?: number;
    key?: string;
}

export interface UALResult {
    success: boolean;
    screenshot?: string;
    domTree?: any;
    data?: any;
    error?: string;
    steps: string[];
}

export interface UALTask {
    goal: string;
    sessionId?: string;
    url?: string;
    actions?: WebAction[];
}

export interface AgentStep {
    type: 'planning' | 'executing' | 'observing' | 'completed' | 'failed';
    message: string;
    screenshot?: string;
    actions?: WebAction[];
    timestamp: number;
}

/**
 * Universal Action Layer - Browser Automation Engine
 * 
 * This is a server-side only implementation that uses Puppeteer
 * to automate browser interactions based on AI-generated plans.
 */
export class UniversalActionLayer {
    private browser: any = null;
    private page: any = null;
    private steps: string[] = [];

    /**
     * Initialize the browser instance
     */
    async initialize() {
        // This will be implemented in the API route
        // Cannot run Puppeteer in client-side code
        throw new Error('UAL must be initialized server-side');
    }

    /**
     * Execute a web automation task
     */
    async executeTask(task: UALTask): Promise<UALResult> {
        // This will be implemented in the API route
        throw new Error('UAL must be executed server-side');
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        // Cleanup implementation
    }
}

/**
 * Client-side UAL interface
 * Communicates with the server-side UAL via API
 */
export class UALClient {
    /**
     * Execute a task via the UAL API
     */
    /**
     * Execute a task via the UAL Browser API
     */
    async executeTask(task: UALTask): Promise<UALResult> {
        // Prepare results
        const steps: string[] = [];
        let screenshot: string | undefined;
        let lastData: any;

        // Execute each action sequentially via the browser/route API
        if (task.actions) {
            for (const action of task.actions) {
                try {
                    // Check if action is supported by BrowserEngine
                    if (['click', 'type', 'navigate', 'scroll', 'wait', 'press'].includes(action.type)) {
                        const response = await fetch('/api/ual/browser', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                action: action.type === 'navigate' ? 'navigate' : 'execute',
                                type: action.type,
                                url: action.url,
                                selector: action.selector,
                                value: action.value,
                                key: action.key
                            }),
                        });

                        if (!response.ok) {
                            throw new Error(`Browser API error: ${response.statusText}`);
                        }

                        const result = await response.json();
                        if (result.screenshot) screenshot = result.screenshot;
                        if (result.domTree) lastData = { ...lastData, domTree: result.domTree };
                        if (result.text) lastData = { ...lastData, text: result.text, title: result.title, url: result.url };

                        steps.push(`Executed ${action.type}: Success`);
                    } else {
                        steps.push(`Skipped unsupported action: ${action.type}`);
                    }
                } catch (e: any) {
                    console.error(`Action failed: ${action.type}`, e);
                    return {
                        success: false,
                        error: `Action ${action.type} failed: ${e.message}`,
                        steps
                    };
                }
            }
        }

        return {
            success: true,
            screenshot,
            data: lastData,
            steps
        };
    }

    /**
     * Plan actions using AI
     */
    async planActions(goal: string, url?: string, state?: any, history?: any[]): Promise<{ actions: WebAction[], status?: string, reasoning?: string, answer?: string }> {
        const response = await fetch('/api/ual/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goal, context: { url, ...state }, history }),
        });

        if (!response.ok) {
            throw new Error(`UAL Planning API error: ${response.statusText}`);
        }

        return await response.json();
    }
}
