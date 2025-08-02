import React, { createContext, useContext, useEffect, useState } from 'react';
import { LocalGameEngine, GameState, Character } from '../services/LocalGameEngine';
import { SimpleNFTMinter } from '../services/SimpleNFTMinter';
import { Connection } from '@solana/web3.js';

interface GameContextType {
  gameEngine: LocalGameEngine;
  gameState: GameState | null;
  nftMinter: SimpleNFTMinter | null;
  connection: Connection | null;
  isLoading: boolean;
  addNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameEngine] = useState(() => new LocalGameEngine());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [nftMinter, setNftMinter] = useState<SimpleNFTMinter | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Solana connection
  useEffect(() => {
    const initConnection = async () => {
      try {
        const conn = new Connection('https://api.devnet.solana.com', 'confirmed');
        setConnection(conn);
        
        // Initialize NFT minter
        const minter = new SimpleNFTMinter(conn);
        setNftMinter(minter);
      } catch (error) {
        console.error('Failed to initialize Solana connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initConnection();
  }, []);

  // Subscribe to game state changes
  useEffect(() => {
    const unsubscribe = gameEngine.subscribe((state) => {
      setGameState(state);
    });

    return unsubscribe;
  }, [gameEngine]);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      gameEngine.updateStats();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [gameEngine]);

  // Notification function that uses console.log for now
  const addNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  return (
    <GameContext.Provider
      value={{
        gameEngine,
        gameState,
        nftMinter,
        connection,
        isLoading,
        addNotification,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}; 