import { useState, useEffect } from 'react';
import FirebaseService from '../services/FirebaseService';

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState({
    requestCount: 0,
    averageResponseTime: 0,
    uptime: 0
  });

  const [backendMetrics, setBackendMetrics] = useState({
    status: 'unknown',
    performance: {},
    database: {},
    optimizations: {}
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isMonitoring) {
      interval = setInterval(async () => {
        try {
          // Get frontend metrics
          const performanceMetrics = FirebaseService.getPerformanceMetrics();
          setMetrics(performanceMetrics);
          
          // Get backend metrics
          const backendData = await FirebaseService.getBackendPerformanceMetrics();
          setBackendMetrics(backendData);
        } catch (error) {
          console.warn('Failed to fetch backend metrics:', error);
        }
      }, 5000); // Update every 5 seconds
    }

    // Cleanup function to clear interval and reset state
    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      // Reset metrics when monitoring stops
      setMetrics({
        requestCount: 0,
        averageResponseTime: 0,
        uptime: 0
      });
      setBackendMetrics({
        status: 'unknown',
        performance: {},
        database: {},
        optimizations: {}
      });
    };
  }, [isMonitoring]);

  const startMonitoring = () => {
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const resetMetrics = () => {
    // Reset metrics by creating new service instance
    // This is a simple way to reset without changing the service
    setMetrics({
      requestCount: 0,
      averageResponseTime: 0,
      uptime: 0
    });
    setBackendMetrics({
      status: 'unknown',
      performance: {},
      database: {},
      optimizations: {}
    });
  };

  return {
    metrics,
    backendMetrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics
  };
};
