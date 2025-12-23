import * as admin from 'firebase-admin';

let isInitialized = false;

function initializeAdmin() {
    if (admin.apps.length) {
        isInitialized = true;
        return;
    }

    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
            isInitialized = true;
        } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NODE_ENV === 'production') {
            // Only use default credentials in production environments (like Vercel)
            admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
            isInitialized = true;
        } else {
            console.warn('Firebase Admin: Missing FIREBASE_SERVICE_ACCOUNT_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID. Using in-memory fallback.');
        }
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
        isInitialized = false;
    }
}

initializeAdmin();

export const adminDb = isInitialized ? admin.firestore() : null as any;
export const adminAuth = isInitialized ? admin.auth() : null as any;
export const adminStorage = isInitialized ? admin.storage() : null as any;

export { isInitialized };
