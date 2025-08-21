import React from 'react';
import { User, Loader2 } from 'lucide-react';
import { EMOTION_COLORS } from '../utils/constants';

const EmotionAnalysis = ({ serverResponse, isProcessing }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-yellow-400" />
        <h3 className="font-semibold text-white">Emotion Analysis</h3>
        {isProcessing && (
          <div className="ml-auto">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          </div>
        )}
      </div>

      {serverResponse?.emotions ? (
        <div className="space-y-3">
          {Object.entries(serverResponse.emotions)
            .sort(([, a], [, b]) => parseFloat(b) - parseFloat(a))
            .slice(0, 6)
            .map(([emotion, value]) => (
              <div key={emotion} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm capitalize">{emotion}</span>
                  <span className="text-xs text-white">
                    {parseFloat(value).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(parseFloat(value), 100)}%`,
                      backgroundColor: EMOTION_COLORS[emotion] || '#6B7280'
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Start analyzing to see emotions</p>
          {isProcessing && (
            <p className="text-xs text-blue-400 mt-2 animate-pulse">Processing emotions...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmotionAnalysis;