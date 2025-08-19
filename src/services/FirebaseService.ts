import { db } from '../config/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// Firebase Functions base URLs - using the cloudfunctions.net format
const FIREBASE_FUNCTIONS_BASE_URL = 'https://us-central1-hoshino-996d0.cloudfunctions.net';
const GET_CONVERSATION_URL = 'https://us-central1-hoshino-996d0.cloudfunctions.net/getConversation';
const HEALTH_URL = 'https://us-central1-hoshino-996d0.cloudfunctions.net/health';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  moonlingId: string;
}

export interface Conversation {
  id: string;
  userId: string;
  moonlingId: string;
  messages: ChatMessage[];
  lastUpdated: Date;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  moonlingName: string;
  conversationId: string;
  timestamp: string;
}

// New interfaces for global data
export interface LeaderboardUser {
  id: string;
  username: string;
  walletAddress: string;
  totalScore: number;
  achievements: number;
  moonlings: number;
  rank: number;
  avatar: string;
  lastActive: Date;
  starFragments: number;
  currentStreak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'feeding' | 'sleep' | 'play' | 'chat' | 'crafting' | 'collection';
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'days' | 'feedings' | 'sleeps' | 'crafts' | 'ingredients';
  value: number;
  achievedAt: Date;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  image?: string;
  type: 'daily' | 'special' | 'achievement';
  date: Date;
  mood: number;
  energy: number;
  hunger: number;
}

export interface UserStats {
  totalAchievements: number;
  totalMilestones: number;
  totalMemories: number;
  completionRate: number;
}

export interface UserProgressData {
  totalScore?: number;
  achievements?: number;
  moonlings?: number;
  starFragments?: number;
  currentStreak?: number;
}

class FirebaseService {
  private baseUrl: string;
  private performanceMetrics: {
    requestCount: number;
    averageResponseTime: number;
    lastRequestTime: number;
  } = {
    requestCount: 0,
    averageResponseTime: 0,
    lastRequestTime: 0
  };

  constructor() {
    this.baseUrl = FIREBASE_FUNCTIONS_BASE_URL;
  }

  // Performance monitoring
  private trackRequest(duration: number) {
    this.performanceMetrics.requestCount++;
    this.performanceMetrics.lastRequestTime = Date.now();
    this.performanceMetrics.averageResponseTime = 
      (this.performanceMetrics.averageResponseTime + duration) / 2;
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      uptime: Date.now() - this.performanceMetrics.lastRequestTime
    };
  }

  // Send chat message to Firebase Functions
  async sendChatMessage(
    message: string,
    moonlingId: string,
    userId: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          moonlingId,
          userId,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.trackRequest(Date.now() - startTime);
      return data;
    } catch (error) {
      this.trackRequest(Date.now() - startTime);
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Get conversation history
  async getConversation(conversationId: string, userId: string): Promise<Conversation> {
    try {
      const response = await fetch(
        `${GET_CONVERSATION_URL}?conversationId=${conversationId}&userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${HEALTH_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }

  // NEW: Get global leaderboard
  async getGlobalLeaderboard(): Promise<LeaderboardUser[]> {
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/getGlobalLeaderboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.leaderboard.map((user: any) => ({
          ...user,
          lastActive: new Date(user.lastActive)
        }));
      } else {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      throw error;
    }
  }

  // NEW: Get user achievements, milestones, and memories
  async getUserProgress(walletAddress: string): Promise<{
    achievements: Achievement[];
    milestones: Milestone[];
    memories: Memory[];
    stats: UserStats;
  }> {
    try {
      const response = await fetch(
        `${FIREBASE_FUNCTIONS_BASE_URL}/getUserAchievements?walletAddress=${walletAddress}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return {
          achievements: data.achievements.map((a: any) => ({
            ...a,
            unlockedAt: new Date(a.unlockedAt)
          })),
          milestones: data.milestones.map((m: any) => ({
            ...m,
            achievedAt: new Date(m.achievedAt)
          })),
          memories: data.memories.map((m: any) => ({
            ...m,
            date: new Date(m.date)
          })),
          stats: data.stats
        };
      } else {
        throw new Error(data.error || 'Failed to fetch user progress');
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  // NEW: Update user progress
  async updateUserProgress(
    walletAddress: string,
    type: string,
    progressData: UserProgressData
  ): Promise<boolean> {
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/updateUserProgress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          type,
          data: progressData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  // NEW: Unlock achievement
  async unlockAchievement(
    walletAddress: string,
    achievementId: string,
    achievementData: Partial<Achievement>
  ): Promise<boolean> {
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/unlockAchievement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          achievementId,
          achievementData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  // NEW: Add milestone
  async addMilestone(
    walletAddress: string,
    milestoneId: string,
    milestoneData: Partial<Milestone>
  ): Promise<boolean> {
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/addMilestone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          milestoneId,
          milestoneData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw error;
    }
  }

  // NEW: Add memory
  async addMemory(
    walletAddress: string,
    memoryId: string,
    memoryData: Partial<Memory>
  ): Promise<boolean> {
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/addMemory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          memoryId,
          memoryData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error adding memory:', error);
      throw error;
    }
  }

  // Save conversation to Firestore (local backup)
  async saveConversationToFirestore(conversation: Conversation): Promise<void> {
    try {
      await setDoc(doc(db, 'conversations', conversation.id), {
        ...conversation,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error saving conversation to Firestore:', error);
      throw error;
    }
  }

  // Get conversations from Firestore
  async getConversationsFromFirestore(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('userId', '==', userId),
        orderBy('lastUpdated', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const conversations: Conversation[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        conversations.push({
          id: doc.id,
          userId: data.userId,
          moonlingId: data.moonlingId,
          messages: data.messages || [],
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        });
      });

      return conversations;
    } catch (error) {
      console.error('Error getting conversations from Firestore:', error);
      throw error;
    }
  }
}

export default new FirebaseService(); 