'use server';

import { adminDb } from '@/lib/firebase/admin';

export async function submitFeedback(data: {
    messageId: string;
    feedback: 'up' | 'down';
    reason?: string;
    content?: string; // Capturing content for analysis
    conversationId?: string;
}) {
    console.log('[Feedback Action] Received:', data);

    if (!adminDb) {
        console.warn('[Feedback Action] Admin DB not initialized. Skipping save.');
        return { success: false, error: 'Database connection unavailable' };
    }

    try {
        const feedbackRef = adminDb.collection('feedback').doc();
        await feedbackRef.set({
            ...data,
            timestamp: new Date().toISOString(),
            userAgent: 'AGI-S Client'
        });

        console.log('[Feedback Action] Saved feedback:', feedbackRef.id);
        return { success: true, id: feedbackRef.id };
    } catch (error: any) {
        console.error('[Feedback Action] Error saving feedback:', error);
        return { success: false, error: error.message };
    }
}
