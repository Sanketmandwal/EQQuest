import { useRef, useState, useCallback } from 'react';
import { DEFAULT_AUTO_INTERVAL } from '../utils/constants';

export const useAutoCapture = (captureCallback) => {
  const autoCaptureTimerRef = useRef(null);
  const [autoCapture, setAutoCapture] = useState(false);
  const [autoSend, setAutoSend] = useState(false);
  const [autoIntervalMs, setAutoIntervalMs] = useState(DEFAULT_AUTO_INTERVAL);

  const startAutoCapture = useCallback(() => {
    if (autoCaptureTimerRef.current) return { success: false, message: "Auto-capture already running" };
    
    autoCaptureTimerRef.current = setInterval(async () => {
      if (captureCallback) {
        await captureCallback(autoSend);
      }
    }, Math.max(500, autoIntervalMs));
    
    setAutoCapture(true);
    return { success: true, message: "Auto-analysis started" };
  }, [captureCallback, autoSend, autoIntervalMs]);

  const stopAutoCapture = useCallback(() => {
    if (autoCaptureTimerRef.current) {
      clearInterval(autoCaptureTimerRef.current);
      autoCaptureTimerRef.current = null;
    }
    setAutoCapture(false);
    return { success: true, message: "Auto-analysis stopped" };
  }, []);

  return {
    autoCapture,
    autoSend,
    autoIntervalMs,
    setAutoSend,
    setAutoIntervalMs,
    startAutoCapture,
    stopAutoCapture
  };
};