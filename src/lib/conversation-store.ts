import { ChatMessage, AiMode } from './types';
import { memoryService } from './memory-service';


export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  mode: AiMode;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  folder?: string;
  pinned?: boolean;
}

const STORAGE_KEY = 'agi-s-conversations';
const CURRENT_CONVERSATION_KEY = 'agi-s-current-conversation';

export class ConversationStore {
  static getAllConversations(): Conversation[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getConversation(id: string): Conversation | null {
    const conversations = this.getAllConversations();
    return conversations.find(c => c.id === id) || null;
  }


  static saveConversation(conversation: Conversation): void {
    const conversations = this.getAllConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);

    conversation.updatedAt = Date.now();

    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));

    // Fire-and-forget indexing to Memory Service (Async)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        conversation.messages.forEach(msg => {
          memoryService.addMemory({
            type: 'message',
            content: msg.content,
            conversationId: conversation.id,
            metadata: { role: msg.role },
            tags: conversation.tags || []
          });
        });
      }, 0);
    }
  }

  static deleteConversation(id: string): void {
    const conversations = this.getAllConversations();
    const filtered = conversations.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  static getCurrentConversationId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(CURRENT_CONVERSATION_KEY);
  }

  static setCurrentConversationId(id: string): void {
    localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
  }

  static searchConversations(query: string): Conversation[] {
    const conversations = this.getAllConversations();
    const lowerQuery = query.toLowerCase();

    return conversations.filter(c =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.messages.some(m => m.content.toLowerCase().includes(lowerQuery)) ||
      c.tags?.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  static getConversationsByFolder(folder: string): Conversation[] {
    const conversations = this.getAllConversations();
    return conversations.filter(c => c.folder === folder);
  }

  static getPinnedConversations(): Conversation[] {
    const conversations = this.getAllConversations();
    return conversations.filter(c => c.pinned);
  }

  static generateTitle(messages: ChatMessage[]): string {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage) return 'New Conversation';

    const content = firstUserMessage.content.substring(0, 50);
    return content.length < firstUserMessage.content.length
      ? content + '...'
      : content;
  }

  static branchConversation(originalId: string, messageId: string, newTitle?: string): Conversation | null {
    const original = this.getConversation(originalId);
    if (!original) return null;

    const messageIndex = original.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return null;

    const newMessages = original.messages.slice(0, messageIndex + 1);

    const newConversation: Conversation = {
      ...original,
      id: crypto.randomUUID(),
      title: newTitle || `${original.title} (Branch)`,
      messages: newMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      folder: original.folder, // Keep in same folder by default
    };

    this.saveConversation(newConversation);
    return newConversation;
  }

  static getFolders(): string[] {
    const conversations = this.getAllConversations();
    const folders = new Set<string>();
    conversations.forEach(c => {
      if (c.folder) folders.add(c.folder);
    });
    return Array.from(folders).sort();
  }

  static moveConversationToFolder(id: string, folder: string | undefined): void {
    const conversation = this.getConversation(id);
    if (conversation) {
      conversation.folder = folder;
      this.saveConversation(conversation);
    }
  }

  static renameFolder(oldName: string, newName: string): void {
    const conversations = this.getAllConversations();
    let changed = false;

    conversations.forEach(c => {
      if (c.folder === oldName) {
        c.folder = newName;
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }

  static deleteFolder(folderName: string): void {
    const conversations = this.getAllConversations();
    let changed = false;

    conversations.forEach(c => {
      if (c.folder === folderName) {
        c.folder = undefined; // Move to root
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }
  static updateMessageFeedback(conversationId: string, messageId: string, feedback: 'up' | 'down', reason?: string): void {
    const conversation = this.getConversation(conversationId);
    if (!conversation) return;

    const message = conversation.messages.find(m => m.id === messageId);
    if (message) {
      message.feedback = feedback;
      message.feedbackReason = reason;
      this.saveConversation(conversation);
    }
  }
}
