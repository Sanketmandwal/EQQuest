

import { useRef, useState, useCallback } from 'react';

export const useSession = () => {
  const sessionStartTimeRef = useRef(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [frameDataHistory, setFrameDataHistory] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    framesAnalyzed: 0,
    avgHappiness: 0,
    avgEngagement: 0,
    sessionDuration: 0,
    startTime: null,
    endTime: null
  });

  const startSession = useCallback(() => {
    setSessionActive(true);
    sessionStartTimeRef.current = new Date();
    setSessionStats(prev => ({
      ...prev,
      startTime: sessionStartTimeRef.current.toISOString(),
      sessionDuration: 0
    }));
    setFrameDataHistory([]);
    return "Interview session started - data recording active";
  }, []);

  const endSession = useCallback(() => {
    setSessionActive(false);
    const endTime = new Date();
    setSessionStats(prev => ({
      ...prev,
      endTime: endTime.toISOString(),
      sessionDuration: sessionStartTimeRef.current ? 
        Math.round((endTime - sessionStartTimeRef.current) / 1000) : prev.sessionDuration
    }));
    return "Interview session ended - ready for review";
  }, []);

  const addFrameData = useCallback((csvData) => {
    setFrameDataHistory(prev => [...prev, csvData]);
  }, []);

  const updateSessionStats = useCallback((processedResponse) => {
    setSessionStats(prev => {
      const newHappiness = parseFloat(processedResponse?.emotions?.happy || 0) / 100;
      const newEngagement = processedResponse?.metrics?.engagement || 0;
      return {
        ...prev,
        framesAnalyzed: prev.framesAnalyzed + 1,
        avgHappiness: prev.framesAnalyzed === 0 ? newHappiness : (prev.avgHappiness + newHappiness) / 2,
        avgEngagement: prev.framesAnalyzed === 0 ? newEngagement : (prev.avgEngagement + newEngagement) / 2,
        sessionDuration: sessionStartTimeRef.current ? 
          Math.round((new Date() - sessionStartTimeRef.current) / 1000) : prev.sessionDuration
      };
    });
  }, []);

  return {
    sessionStartTimeRef,
    sessionActive,
    frameDataHistory,
    sessionStats,
    startSession,
    endSession,
    addFrameData,
    updateSessionStats
  };
};