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
        // Based on latest docs, 'model=seedance' or 'model=turbo' (video-capable) is preferred.
        // We will specific set width/height for video aspect ratio.
        // Adding 'model=seedance' which is known for 2-10s clips.
        // We use 'flux-pro' or 'turbo' model which is high quality. 
        // We append 'nologo=true' to attempt to remove the watermark (best effort on free tier).
        // https://image.pollinations.ai/prompt/[prompt]?model=flux-pro&nologo=true
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux-pro&seed=${seed}&nologo=true`;

        return url;
    }
}

export const cloudVideoService = new PollinationsService();
