import { openDB, DBSchema, IDBPDatabase } from 'idb';
import Fuse from 'fuse.js';

interface MemoryItem {
    id: string;
    type: 'message' | 'file' | 'link';
    content: string;
    metadata: any;
    timestamp: number;
    conversationId: string;
    tags: string[];
}

interface AGISMemoryDB extends DBSchema {
    memories: {
        key: string;
        value: MemoryItem;
        indexes: { 'by-type': string; 'by-conversation': string };
    };
}

class MemoryService {
    private dbPromise: Promise<IDBPDatabase<AGISMemoryDB>>;
    private fuse: Fuse<MemoryItem> | null = null;
    private isInitialized = false;

    constructor() {
        this.dbPromise = openDB<AGISMemoryDB>('agi-s-memory', 1, {
            upgrade(db) {
                const store = db.createObjectStore('memories', { keyPath: 'id' });
                store.createIndex('by-type', 'type');
                store.createIndex('by-conversation', 'conversationId');
            },
        });
        this.initSearchIndex();
    }

    // Load all memories into Fuse.js for fast client-side fuzzy search
    // In a real production app with millions of records, we'd use a server-side vector DB.
    // For a "Local AGI", this is incredibly fast and private.
    private async initSearchIndex() {
        const db = await this.dbPromise;
        const allMemories = await db.getAll('memories');

        this.fuse = new Fuse(allMemories, {
            keys: ['content', 'metadata.fileName', 'tags'],
            threshold: 0.4, // Fuzzy match threshold
            includeScore: true,
        });
        this.isInitialized = true;
    }

    async addMemory(item: Omit<MemoryItem, 'id' | 'timestamp'>) {
        const db = await this.dbPromise;
        const memory: MemoryItem = {
            ...item,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        await db.put('memories', memory);

        // Update local search index
        if (this.fuse) {
            this.fuse.add(memory);
        }
    }

    async recall(query: string, limit = 5): Promise<MemoryItem[]> {
        if (!this.fuse) await this.initSearchIndex();

        // 1. Keyword/Fuzzy Recall
        const results = this.fuse!.search(query);

        // 2. Return top matches
        return results.slice(0, limit).map(r => r.item);
    }

    async getAllContextForConversation(conversationId: string): Promise<MemoryItem[]> {
        const db = await this.dbPromise;
        return db.getAllFromIndex('memories', 'by-conversation', conversationId);
    }

    async clearMemory() {
        const db = await this.dbPromise;
        await db.clear('memories');
        this.initSearchIndex();
    }
}

export const memoryService = new MemoryService();
