import React from 'react';
import { Camera, CameraOff, Zap, Send, Play, Pause, Clock, Settings, Loader2 } from 'lucide-react';
import { MIN_INTERVAL, MAX_INTERVAL } from '../utils/constants';

const ControlPanel = ({
  cameraOn,
  isProcessing,
  autoCapture,
  autoSend,
  autoIntervalMs,
  startCamera,
  stopCamera,
  captureFrame,
  analyzeFrame,
  startAutoCapture,
  stopAutoCapture,
  setAutoSend,
  setAutoIntervalMs
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={startCamera}
          disabled={cameraOn}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
        >
          <Camera className="w-4 h-4" />
          Start Camera
        </button>

        <button
          onClick={stopCamera}
          disabled={!cameraOn}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
        >
          <CameraOff className="w-4 h-4" />
          Stop Camera
        </button>

        <button
          onClick={captureFrame}
          disabled={!cameraOn}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
        >
          <Zap className="w-4 h-4" />
          Capture
        </button>

        <button
          onClick={analyzeFrame}
          disabled={!cameraOn || isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isProcessing ? 'Processing...' : 'Analyze Frame'}
        </button>

        <button
          onClick={autoCapture ? stopAutoCapture : startAutoCapture}
          disabled={!cameraOn}
          className={`flex items-center gap-2 px-4 py-2 ${autoCapture
            ? 'bg-orange-600 hover:bg-orange-700'
            : 'bg-indigo-600 hover:bg-indigo-700'
            } disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium`}
        >
          {autoCapture ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {autoCapture ? 'Stop Auto' : 'Start Auto'}
        </button>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="autoSend"
            checked={autoSend}
            onChange={(e) => setAutoSend(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="autoSend" className="text-sm font-medium text-gray-300">
            Auto-analyze captured frames
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <label className="text-sm text-gray-400">Interval:</label>
          <input
            type="range"
            min={MIN_INTERVAL}
            max={MAX_INTERVAL}
            step="100"
            value={autoIntervalMs}
            onChange={(e) => setAutoIntervalMs(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-400 w-12">{autoIntervalMs}ms</span>
        </div>

        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Quality: High</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;