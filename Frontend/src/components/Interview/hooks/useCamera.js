import { useRef, useState, useCallback } from 'react';
import { CAMERA_CONFIG } from '../utils/constants';

export const useCamera = () => {
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONFIG);
      streamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play();
      }
      
      setCameraOn(true);
      return { success: true, message: "Camera active - Ready to analyze" };
    } catch (err) {
      console.error("getUserMedia error", err);
      return { success: false, message: "Unable to access camera" };
    }
  }, []);

  const stopCamera = useCallback(() => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    } catch (e) {
      console.warn(e);
    }
    setCameraOn(false);
    return { success: true, message: "Camera stopped" };
  }, []);

  return {
    localVideoRef,
    cameraOn,
    startCamera,
    stopCamera
  };
};