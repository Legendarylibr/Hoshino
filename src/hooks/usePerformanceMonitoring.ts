import { useState, useEffect } from 'react';
import FirebaseService from '../services/FirebaseService';

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState({
    requestCount: 0,
    averageResponseTime: 0,
    uptime: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        const performanceMetrics = FirebaseService.getPerformanceMetrics();
        setMetrics(performanceMetrics);
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
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
  };

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics
  };
};
