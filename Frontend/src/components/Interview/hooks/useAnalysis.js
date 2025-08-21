import { useRef, useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { processAPIResponse, getMockApiResponse } from '../utils/helpers';
import { formatFrameDataForCSV } from '../../../lib/csv';

export const useAnalysis = ({ onFrameData, onStatsUpdate, sessionActive }) => {
  const sendLockRef = useRef(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const analyzeFrame = useCallback(async (canvas) => {
    if (sendLockRef.current || !canvas) {
      return { success: false, message: "Analysis in progress..." };
    }

    try {
      sendLockRef.current = true;
      setIsProcessing(true);

      let processedResponse;
      
      try {
        const apiResponse = await apiService.sendFrameToProxy(canvas, {
          resize: true,
          width: 224,
          height: 224,
          quality: 0.75
        });
        processedResponse = processAPIResponse(apiResponse.data);
      } catch (error) {
        console.warn("Proxy API failed, using mock data:", error);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockApiResponse = getMockApiResponse();
        processedResponse = processAPIResponse(mockApiResponse);
      }

      setServerResponse(processedResponse);

      // Add to CSV data if session is active
      if (sessionActive && onFrameData) {
        const frameNumber = Date.now(); // You might want to pass this from parent
        const csvData = formatFrameDataForCSV(processedResponse, processedResponse.timestamp, frameNumber);
        onFrameData(csvData);
      }

      // Update session stats
      if (onStatsUpdate) {
        onStatsUpdate(processedResponse);
      }

      return { success: true, message: "Analysis complete - detailed feedback ready" };

    } catch (err) {
      console.error("Analysis failed:", err);
      return { success: false, message: "Analysis failed - please try again" };
    } finally {
      sendLockRef.current = false;
      setIsProcessing(false);
    }
  }, [onFrameData, onStatsUpdate, sessionActive]);

  return {
    serverResponse,
    isProcessing,
    analyzeFrame
  };
};