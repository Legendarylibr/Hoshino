import { Platform } from 'react-native';
import { getFunctionUrl } from '../config/firebase';
import { getAuth } from 'firebase/auth';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to get authentication headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Client-ID': 'hoshino-mobile-app'
  };
}

class ChatService {
  private baseUrl: string;
  private userId: string | null = null;

  constructor() {
    // Use centralized Firebase config
    this.baseUrl = getFunctionUrl('chat').replace('/chat', '');
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        ...await getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ChatService request failed:', error);
      throw error;
    }
  }

  async sendMessage(
    message: string, 
    moonlingId: string, 
    conversationId?: string
  ): Promise<any> {
    if (!this.userId) {
      throw new Error('User ID not set. Call setUserId() first.');
    }

    const payload = {
      message,
      moonlingId,
      userId: this.userId,
      ...(conversationId && { conversationId }),
    };

    return this.makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    if (!this.userId) {
      throw new Error('User ID not set. Call setUserId() first.');
    }

    const params = new URLSearchParams({
      conversationId,
      userId: this.userId,
    });

    const response = await this.makeRequest(`/getConversation?${params}`);
    return response.conversation;
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; functions: string[] }> {
    return this.makeRequest('/health');
  }

  // Helper method to get moonling personality info
  getMoonlingInfo(moonlingId: string) {
    const moonlings = {
      lyra: {
        name: 'Lyra',
        description: 'Anime-obsessed celestial maiden',
        traits: ['anime expert', 'emotional', 'jealous', 'comprehensive']
      },
      orion: {
        name: 'Orion',
        description: 'Mystical guardian with moon and stars',
        traits: ['mystical', 'protective', 'wise', 'loyal']
      },
      aro: {
        name: 'Aro',
        description: 'Bright guardian full of celestial energy',
        traits: ['energetic', 'optimistic', 'enthusiastic', 'encouraging']
      },
      sirius: {
        name: 'Sirius',
        description: 'The brightest star guardian',
        traits: ['intense', 'loyal', 'powerful', 'focused']
      },
      zaniah: {
        name: 'Zaniah',
        description: 'Mysterious cosmic entity',
        traits: ['mysterious', 'contemplative', 'wise', 'powerful']
      }
    };

    return moonlings[moonlingId as keyof typeof moonlings] || null;
  }

  // Method to format conversation for display
  formatConversation(messages: ChatMessage[]) {
    return messages.map(msg => ({
      id: `${msg.timestamp}-${msg.role}`,
      text: msg.content,
      isUser: msg.role === 'user',
      timestamp: new Date(msg.timestamp)
    }));
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;
export type { ChatMessage, Conversation }; 