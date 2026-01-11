/**
 * Iterative Code Refinement System
 * Auto-fixes code until it works perfectly
 */

import { routeToModel } from './multi-model';

export interface RefinementResult {
    code: string;
    success: boolean;
    attempts: number;
    errors: string[];
    improvements: string[];
}

export interface ExecutionResult {
    success: boolean;
    error?: string;
    output?: string;
}

/**
 * Refine code iteratively until it works
 */
export async function refineUntilPerfect(
    code: string,
    maxAttempts: number = 5
): Promise<RefinementResult> {
    let currentCode = code;
    const errors: string[] = [];
    const improvements: string[] = [];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Simulate execution (in real implementation, use WebContainer)
        const result = await simulateExecution(currentCode);

        if (result.success) {
            return {
                code: currentCode,
                success: true,
                attempts: attempt,
                errors,
                improvements
            };
        }

        // Log error
        errors.push(`Attempt ${attempt}: ${result.error}`);

        // Auto-fix using AI
        const errorType = detectErrorType(result.error!);
        const fixed = await fixError(currentCode, result.error!, errorType);

        improvements.push(`Fixed ${errorType} error`);
        currentCode = fixed;
    }

    // Max attempts reached
    return {
        code: currentCode,
        success: false,
        attempts: maxAttempts,
        errors,
        improvements
    };
}

/**
 * Detect type of error for targeted fixing
 */
export function detectErrorType(error: string): 'syntax' | 'runtime' | 'logic' | 'type' {
    if (error.includes('SyntaxError') || error.includes('Unexpected token')) {
        return 'syntax';
    }
    if (error.includes('TypeError') || error.includes('is not a function')) {
        return 'type';
    }
    if (error.includes('ReferenceError') || error.includes('is not defined')) {
        return 'runtime';
    }
    return 'logic';
}

/**
 * Fix specific error type
 */
export async function fixError(
    code: string,
    error: string,
    errorType: 'syntax' | 'runtime' | 'logic' | 'type'
): Promise<string> {
    const prompts = {
        syntax: `Fix this syntax error and return ONLY the corrected code:\n\nError: ${error}\n\nCode:\n${code}`,
        runtime: `Fix this runtime error and return ONLY the corrected code:\n\nError: ${error}\n\nCode:\n${code}`,
        type: `Fix this TypeScript type error and return ONLY the corrected code:\n\nError: ${error}\n\nCode:\n${code}`,
        logic: `Fix this logic error and return ONLY the corrected code:\n\nError: ${error}\n\nCode:\n${code}`
    };

    const fixed = await routeToModel('debugging', prompts[errorType]);

    // Extract code from response (remove markdown if present)
    return extractCode(fixed);
}

/**
 * Extract clean code from AI response
 */
function extractCode(response: string): string {
    // Remove markdown code blocks
    const codeBlockRegex = /```(?:typescript|javascript|tsx|jsx)?\n([\s\S]*?)\n```/g;
    const matches = [...response.matchAll(codeBlockRegex)];

    if (matches.length > 0) {
        return matches[0][1].trim();
    }

    // If no code blocks, return as-is (might be plain code)
    return response.trim();
}

/**
 * Simulate code execution (placeholder for WebContainer integration)
 */
async function simulateExecution(code: string): Promise<ExecutionResult> {
    // TODO: Integrate with WebContainer for real execution
    // For now, do basic syntax validation

    try {
        // Check for common syntax errors
        if (code.includes('function(') && !code.includes(')')) {
            return {
                success: false,
                error: 'SyntaxError: Missing closing parenthesis'
            };
        }

        if (code.includes('{') && !code.includes('}')) {
            return {
                success: false,
                error: 'SyntaxError: Missing closing brace'
            };
        }

        // Assume success for now
        return {
            success: true,
            output: 'Code executed successfully'
        };
    } catch (e: any) {
        return {
            success: false,
            error: e.message
        };
    }
}

/**
 * Code healing - detect and fix issues proactively
 */
export async function healCode(code: string): Promise<{
    healed: string;
    issues: string[];
    fixes: string[];
}> {
    const issues: string[] = [];
    const fixes: string[] = [];
    let healed = code;

    // Detect common issues
    const detectedIssues = await detectIssues(code);

    for (const issue of detectedIssues) {
        issues.push(issue.description);

        // Auto-fix
        const fixed = await routeToModel('optimization',
            `Fix this issue in the code:\n\nIssue: ${issue.description}\n\nCode:\n${healed}`
        );

        healed = extractCode(fixed);
        fixes.push(`Fixed: ${issue.description}`);
    }

    return { healed, issues, fixes };
}

/**
 * Detect potential issues in code
 */
async function detectIssues(code: string): Promise<Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
}>> {
    const issues: Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }> = [];

    // Check for console.logs (should be removed in production)
    if (code.includes('console.log')) {
        issues.push({
            type: 'debug',
            description: 'Console.log statements found (should be removed)',
            severity: 'low'
        });
    }

    // Check for missing error handling
    if (code.includes('fetch(') && !code.includes('catch')) {
        issues.push({
            type: 'error-handling',
            description: 'Fetch call without error handling',
            severity: 'high'
        });
    }

    // Check for any type usage
    if (code.includes(': any')) {
        issues.push({
            type: 'type-safety',
            description: 'Using "any" type (should be specific)',
            severity: 'medium'
        });
    }

    return issues;
}

/**
 * Optimize code for production
 */
export async function optimizeForProduction(code: string): Promise<string> {
    const optimizations = [
        'Remove all console.log statements',
        'Add proper TypeScript types',
        'Add error boundaries where needed',
        'Optimize performance (memoization, lazy loading)',
        'Add input validation'
    ];

    let optimized = code;

    for (const opt of optimizations) {
        const result = await routeToModel('optimization',
            `${opt} in this code. Return ONLY the modified code:\n\n${optimized}`
        );
        optimized = extractCode(result);
    }

    return optimized;
}
