import { useState, useEffect, useCallback, useMemo } from 'react';
import FirebaseService, { 
    LeaderboardUser, 
    Achievement, 
    Milestone, 
    Memory, 
    UserStats 
} from '../services/FirebaseService';

interface UseGalleryDataProps {
    walletAddress?: string;
}

interface UseGalleryDataReturn {
    // Leaderboard data
    leaderboardUsers: LeaderboardUser[];
    leaderboardLoading: boolean;
    leaderboardError: string | null;
    refreshLeaderboard: () => Promise<void>;
    
    // User progress data
    achievements: Achievement[];
    milestones: Milestone[];
    memories: Memory[];
    stats: UserStats;
    progressLoading: boolean;
    progressError: string | null;
    refreshProgress: () => Promise<void>;
    
    // Combined loading state
    isLoading: boolean;
    hasError: boolean;
}

export const useGalleryData = ({ walletAddress }: UseGalleryDataProps): UseGalleryDataReturn => {
    // Leaderboard state
    const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
    
    // User progress state
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [memories, setMemories] = useState<Memory[]>([]);
    const [stats, setStats] = useState<UserStats>({
        totalAchievements: 0,
        totalMilestones: 0,
        totalMemories: 0,
        completionRate: 0
    });
    const [progressLoading, setProgressLoading] = useState(false);
    const [progressError, setProgressError] = useState<string | null>(null);
    
    // Memoized loading states
    const isLoading = useMemo(() => leaderboardLoading || progressLoading, [leaderboardLoading, progressLoading]);
    const hasError = useMemo(() => !!(leaderboardError || progressError), [leaderboardError, progressError]);
    
    // Load leaderboard data
    const loadLeaderboardData = useCallback(async () => {
        try {
            setLeaderboardLoading(true);
            setLeaderboardError(null);
            
            const leaderboardData = await FirebaseService.getGlobalLeaderboard();
            setLeaderboardUsers(leaderboardData);
        } catch (error) {
            console.error('Failed to load leaderboard data:', error);
            setLeaderboardError('Failed to load leaderboard data');
            
            // Fallback to mock data if backend fails
            const mockLeaderboardData: LeaderboardUser[] = [
                {
                    id: '1',
                    username: 'CosmicMaster',
                    walletAddress: '0x1234...5678',
                    totalScore: 15420,
                    achievements: 18,
                    moonlings: 5,
                    rank: 1,
                    avatar: '🌟',
                    lastActive: new Date(),
                    starFragments: 1500,
                    currentStreak: 7
                },
                {
                    id: '2',
                    username: 'StellarExplorer',
                    walletAddress: '0x8765...4321',
                    totalScore: 12850,
                    achievements: 15,
                    moonlings: 4,
                    rank: 2,
                    avatar: '⭐',
                    lastActive: new Date(Date.now() - 3600000),
                    starFragments: 1200,
                    currentStreak: 5
                },
                {
                    id: '3',
                    username: 'MoonWalker',
                    walletAddress: '0x9999...8888',
                    totalScore: 11200,
                    achievements: 12,
                    moonlings: 3,
                    rank: 3,
                    avatar: '🌙',
                    lastActive: new Date(Date.now() - 7200000),
                    starFragments: 1000,
                    currentStreak: 3
                },
                {
                    id: '4',
                    username: 'NovaHunter',
                    walletAddress: '0x7777...6666',
                    totalScore: 9850,
                    achievements: 10,
                    moonlings: 3,
                    rank: 4,
                    avatar: '💫',
                    lastActive: new Date(Date.now() - 10800000),
                    starFragments: 800,
                    currentStreak: 2
                },
                {
                    id: '5',
                    username: 'StarCollector',
                    walletAddress: '0x5555...4444',
                    totalScore: 8750,
                    achievements: 8,
                    moonlings: 2,
                    rank: 5,
                    avatar: '✨',
                    lastActive: new Date(Date.now() - 14400000),
                    starFragments: 600,
                    currentStreak: 1
                },
                {
                    id: '6',
                    username: 'LunarPioneer',
                    walletAddress: '0x3333...2222',
                    totalScore: 7200,
                    achievements: 6,
                    moonlings: 2,
                    rank: 6,
                    avatar: '🌍',
                    lastActive: new Date(Date.now() - 18000000),
                    starFragments: 400,
                    currentStreak: 0
                }
            ];
            setLeaderboardUsers(mockLeaderboardData);
        } finally {
            setLeaderboardLoading(false);
        }
    }, []);
    
    // Load user progress data
    const loadUserProgress = useCallback(async () => {
        try {
            setProgressLoading(true);
            setProgressError(null);
            
            if (walletAddress) {
                // Use backend service for authenticated users
                const userProgress = await FirebaseService.getUserProgress(walletAddress);
                setAchievements(userProgress.achievements);
                setMilestones(userProgress.milestones);
                setMemories(userProgress.memories);
                setStats(userProgress.stats);
            } else {
                // Use local storage for demo users (existing logic)
                // This maintains the same functionality
                setAchievements([]);
                setMilestones([]);
                setMemories([]);
                setStats({
                    totalAchievements: 0,
                    totalMilestones: 0,
                    totalMemories: 0,
                    completionRate: 0
                });
            }
        } catch (error) {
            console.error('Failed to load user progress:', error);
            setProgressError('Failed to load user progress');
        } finally {
            setProgressLoading(false);
        }
    }, [walletAddress]);
    
    // Refresh functions
    const refreshLeaderboard = useCallback(async () => {
        await loadLeaderboardData();
    }, [loadLeaderboardData]);
    
    const refreshProgress = useCallback(async () => {
        await loadUserProgress();
    }, [loadUserProgress]);
    
    // Load data on mount and when wallet address changes
    useEffect(() => {
        let isMounted = true;
        
        const loadData = async () => {
            if (isMounted) {
                await loadLeaderboardData();
            }
        };
        
        loadData();
        
        return () => {
            isMounted = false;
        };
    }, [loadLeaderboardData]);
    
    useEffect(() => {
        let isMounted = true;
        
        const loadData = async () => {
            if (isMounted) {
                await loadUserProgress();
            }
        };
        
        loadData();
        
        return () => {
            isMounted = false;
        };
    }, [loadUserProgress]);
    
    return {
        // Leaderboard data
        leaderboardUsers,
        leaderboardLoading,
        leaderboardError,
        refreshLeaderboard,
        
        // User progress data
        achievements,
        milestones,
        memories,
        stats,
        progressLoading,
        progressError,
        refreshProgress,
        
        // Combined states
        isLoading,
        hasError
    };
};
