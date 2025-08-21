import React from 'react';
import { Camera, Loader2 } from 'lucide-react';

const VideoContainer = ({ 
  localVideoRef, 
  cameraOn, 
  isProcessing, 
  sessionActive, 
  serverResponse 
}) => {
  return (
    <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
        <div className={`w-2 h-2 rounded-full ${cameraOn ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
        <span className="text-xs text-white">{cameraOn ? 'LIVE' : 'OFFLINE'}</span>
      </div>

      {isProcessing && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-blue-600/90 backdrop-blur-sm rounded-lg border border-blue-500/50 animate-pulse">
          <Loader2 className="w-4 h-4 text-white animate-spin" />
          <span className="text-xs text-white font-medium">Analyzing...</span>
        </div>
      )}

      {serverResponse?.dominantEmotion && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
          <span className="text-xs text-white capitalize">
            😊 {serverResponse.dominantEmotion} ({parseFloat(serverResponse.emotions[serverResponse.dominantEmotion]).toFixed(1)}%)
          </span>
        </div>
      )}

      {sessionActive && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3 py-2 bg-red-600/90 backdrop-blur-sm rounded-lg border border-red-500/50">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-xs text-white font-medium">REC</span>
        </div>
      )}

      <div className="aspect-video relative">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {!cameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Camera not active</p>
              <p className="text-gray-500 text-sm">Start your camera to begin facial analysis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoContainer;