import { useRef, useState, useCallback } from 'react';
import { CANVAS_CONFIG } from '../utils/constants';

export const useFrameCapture = () => {
  const canvasRef = useRef(null);
  const [lastImageUrl, setLastImageUrl] = useState(null);

  const captureFrame = useCallback(async (videoRef) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      return { success: false, message: "No video available" };
    }

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", CANVAS_CONFIG.quality);
    setLastImageUrl(dataUrl);

    return { 
      success: true, 
      message: "Frame captured - analyzing...",
      dataUrl, 
      canvas 
    };
  }, []);

  return {
    canvasRef,
    lastImageUrl,
    captureFrame
  };
};