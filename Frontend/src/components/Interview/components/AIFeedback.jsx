import React from 'react';
import { Brain, CheckCircle, Loader2 } from 'lucide-react';

const AIFeedback = ({ serverResponse, isProcessing }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-green-400" />
        <h3 className="font-semibold text-white">AI Feedback</h3>
        {isProcessing && (
          <div className="ml-auto">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {serverResponse ? (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Performance Metrics:</h4>
            {Object.entries(serverResponse.metrics || {}).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-xs text-white">
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      value > 0.8 ? 'bg-green-400' : 
                      value > 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Info */}
          {serverResponse.rawData && (
            <div className="bg-black/20 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Detection Details:</h4>
              <div className="grid grid-cols-1 gap-1 text-xs text-gray-400">
                <div>Age: {serverResponse.rawData.age_range?.low}-{serverResponse.rawData.age_range?.high}</div>
                <div>Gender: {serverResponse.rawData.gender?.value}</div>
                <div>Brightness: {parseFloat(serverResponse.rawData.quality?.brightness || 0).toFixed(0)}%</div>
                <div>Sharpness: {parseFloat(serverResponse.rawData.quality?.sharpness || 0).toFixed(0)}%</div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {serverResponse.feedback && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Suggestions:</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {serverResponse.feedback.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Start analyzing to see AI feedback</p>
          <p className="text-xs text-gray-600 mt-2">
            Real-time facial analysis via proxy endpoint
          </p>
          {isProcessing && (
            <p className="text-xs text-green-400 mt-2 animate-pulse">Generating feedback...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AIFeedback;