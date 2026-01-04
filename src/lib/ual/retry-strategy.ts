/**
 * Retry Strategy for UAL Actions
 * Implements exponential backoff and intelligent retries
 */

export interface RetryConfig {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
};

export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG,
    onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
    let lastError: Error;
    let delay = config.initialDelay;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === config.maxRetries) {
                throw lastError;
            }

            if (onRetry) {
                onRetry(attempt + 1, lastError);
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay));

            // Increase delay for next retry
            delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
        }
    }

    throw lastError!;
}

export function isRetryableError(error: Error): boolean {
    const retryableMessages = [
        'timeout',
        'navigation',
        'net::ERR',
        'waiting for',
        'failed to fetch',
    ];

    return retryableMessages.some(msg =>
        error.message.toLowerCase().includes(msg.toLowerCase())
    );
}
