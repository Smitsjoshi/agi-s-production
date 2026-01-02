import { nanoid } from 'nanoid';

export interface ComfyUIPrompt {
    prompt: any;
    client_id: string;
}

export interface VideoServiceConfig {
    baseUrl: string; // e.g., "http://127.0.0.1:8188" or ngrok URL
}

class VideoService {
    private baseUrl: string = "http://127.0.0.1:8188";
    private clientId: string = nanoid();

    setBaseUrl(url: string) {
        this.baseUrl = url.replace(/\/$/, "");
    }

    async checkConnection(): Promise<boolean> {
        try {
            const res = await fetch(`${this.baseUrl}/system_stats`);
            return res.ok;
        } catch (e) {
            return false;
        }
    }

    async queuePrompt(workflow: any): Promise<{ prompt_id: string }> {
        const res = await fetch(`${this.baseUrl}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: workflow,
                client_id: this.clientId
            })
        });

        if (!res.ok) throw new Error('Failed to queue prompt');
        return res.json();
    }

    async getHistory(promptId: string) {
        const res = await fetch(`${this.baseUrl}/history/${promptId}`);
        if (!res.ok) throw new Error('Failed to get history');
        return res.json();
    }

    async getImage(filename: string, subfolder: string, type: string) {
        const params = new URLSearchParams({
            filename,
            subfolder,
            type
        });
        return `${this.baseUrl}/view?${params.toString()}`;
    }
}

export const videoService = new VideoService();

// Pollinations.ai Service for Free Cloud Generation
export class PollinationsService {
    /**
     * Generates a video using Pollinations.ai
     * Note: As of early 2025, Pollinations offers experimental video support via 'model=luma' or similar.
     * This is a best-effort integration.
     */
    async generateVideo(prompt: string): Promise<string> {
        // Construct the URL. Pollinations uses GET requests usually.
        // We try to force a video model.
        // Common pattern: https://pollinations.ai/p/[prompt]?width=1024&height=576&model=luma&seed=[random]
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(prompt);

        // We use a specific endpoint or parameter if documented. 
        // Based on search, 'model=luma' or 'model=video' is the key.
        // We will try `model=luma` (Luma Dream Machine via Pollinations)
        const url = `https://pollinations.ai/p/${encodedPrompt}?width=1280&height=720&model=luma&seed=${seed}&nolog=true`;

        // Pollinations usually returns the image/video binary directly. 
        // We can just return this URL as the src for the video tag!
        // However, we should verify it exists or is valid.

        return url;
    }
}

export const cloudVideoService = new PollinationsService();
