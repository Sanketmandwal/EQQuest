import React, { useEffect, useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { downloadCSV } from '@/lib/csv';

// Hooks
import { useCamera } from './hooks/useCamera';
import { useFrameCapture } from './hooks/useFrameCapture';
import { useSession } from './hooks/useSession';
import { useAnalysis } from './hooks/useAnalysis';
import { useAutoCapture } from './hooks/useAutoCapture';

// Components
import VideoContainer from './components/VideoContainer';
import SessionControls from './components/SessionControls';
import ControlPanel from './components/ControlPanel';
import LatestCapture from './components/LatestCapture';
import SessionStats from './components/SessionStats';
import EmotionAnalysis from './components/EmotionAnalysis';
import AIFeedback from './components/AIFeedback';
import AnalyticsView from './components/AnalyticsView';

// UI Components
import StatusIndicator from './ui/StatusIndicator';

const Interview = () => {
  const [status, setStatus] = useState("Ready to start your interview");
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Custom hooks
  const { localVideoRef, cameraOn, startCamera, stopCamera } = useCamera();
  const { canvasRef, lastImageUrl, captureFrame } = useFrameCapture();
  const { 
    sessionStartTimeRef, 
    sessionActive, 
    frameDataHistory, 
    sessionStats, 
    startSession, 
    endSession, 
    addFrameData, 
    updateSessionStats 
  } = useSession();
  
  const { serverResponse, isProcessing, analyzeFrame } = useAnalysis({
    onFrameData: addFrameData,
    onStatsUpdate: updateSessionStats,
    sessionActive
  });

  // Handle camera operations
  const handleStartCamera = async () => {
    const result = await startCamera();
    setStatus(result.message);
  };

  const handleStopCamera = () => {
    const result = stopCamera();
    setStatus(result.message);
    if (sessionActive) {
      const sessionResult = endSession();
      setStatus(sessionResult);
    }
  };

  // Handle frame capture
  const handleCaptureFrame = async () => {
    const result = await captureFrame(localVideoRef);
    setStatus(result.message);
  };

  // Handle frame analysis
  const handleAnalyzeFrame = async () => {
    const captureResult = await captureFrame(localVideoRef);
    if (!captureResult.success) {
      setStatus(captureResult.message);
      return;
    }

    const analysisResult = await analyzeFrame(captureResult.canvas);
    setStatus(analysisResult.message);
  };

  // Auto capture callback
  const autoCaptureCallback = async (shouldAnalyze) => {
    if (shouldAnalyze) {
      await handleAnalyzeFrame();
    } else {
      await handleCaptureFrame();
    }
  };

  const {
    autoCapture,
    autoSend,
    autoIntervalMs,
    setAutoSend,
    setAutoIntervalMs,
    startAutoCapture,
    stopAutoCapture
  } = useAutoCapture(autoCaptureCallback);

  // Handle auto capture controls
  const handleStartAutoCapture = () => {
    const result = startAutoCapture();
    setStatus(result.message);
  };

  const handleStopAutoCapture = () => {
    const result = stopAutoCapture();
    setStatus(result.message);
  };

  // Handle session controls
  const handleStartSession = () => {
    const result = startSession();
    setStatus(result);
  };

  const handleEndSession = () => {
    const result = endSession();
    handleStopAutoCapture();
    setStatus(result);
  };

  // Handle CSV download
  const handleDownloadCSV = () => {
    downloadCSV(frameDataHistory);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleStopAutoCapture();
      handleStopCamera();
    };
  }, []);

  // Show analytics view
  if (showAnalytics) {
    return (
      <AnalyticsView 
        frameDataHistory={frameDataHistory}
        sessionStats={sessionStats}
        onBack={() => setShowAnalytics(false)}
        onDownloadCSV={handleDownloadCSV}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,200,255,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    AI Interview Coach
                  </h1>
                  <p className="text-gray-400 text-sm">Real-time facial analysis and feedback</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <StatusIndicator 
                  isProcessing={isProcessing}
                  cameraOn={cameraOn}
                  autoCapture={autoCapture}
                />
                <span>{status}</span>
                {sessionActive && (
                  <div className="ml-4 flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-300 text-xs">Recording</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Session Controls */}
          <SessionControls
            sessionActive={sessionActive}
            startSession={handleStartSession}
            endSession={handleEndSession}
            cameraOn={cameraOn}
            frameDataHistory={frameDataHistory}
            setShowAnalytics={setShowAnalytics}
            onDownloadCSV={handleDownloadCSV}
            sessionStartTimeRef={sessionStartTimeRef}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Video and Controls */}
            <div className="lg:col-span-2 space-y-6">
              <VideoContainer
                localVideoRef={localVideoRef}
                cameraOn={cameraOn}
                isProcessing={isProcessing}
                sessionActive={sessionActive}
                serverResponse={serverResponse}
              />

              {/* Processing Status Card */}
              {isProcessing && (
                <div className="bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <div>
                      <p className="text-white font-medium">Analyzing facial expressions and emotions...</p>
                      <p className="text-blue-300 text-sm">Processing frame data via AI analysis</p>
                    </div>
                  </div>
                </div>
              )}

              <ControlPanel
                cameraOn={cameraOn}
                isProcessing={isProcessing}
                autoCapture={autoCapture}
                autoSend={autoSend}
                autoIntervalMs={autoIntervalMs}
                startCamera={handleStartCamera}
                stopCamera={handleStopCamera}
                captureFrame={handleCaptureFrame}
                analyzeFrame={handleAnalyzeFrame}
                startAutoCapture={handleStartAutoCapture}
                stopAutoCapture={handleStopAutoCapture}
                setAutoSend={setAutoSend}
                setAutoIntervalMs={setAutoIntervalMs}
              />

              {/* Bottom Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LatestCapture
                  lastImageUrl={lastImageUrl}
                  serverResponse={serverResponse}
                />
                <SessionStats
                  sessionStats={sessionStats}
                  frameDataHistory={frameDataHistory}
                  sessionStartTimeRef={sessionStartTimeRef}
                />
              </div>
            </div>

            {/* Right Side - Analysis */}
            <div className="lg:col-span-1 space-y-6">
              <EmotionAnalysis
                serverResponse={serverResponse}
                isProcessing={isProcessing}
              />
              <AIFeedback
                serverResponse={serverResponse}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default Interview;