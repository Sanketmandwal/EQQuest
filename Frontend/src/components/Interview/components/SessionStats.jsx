import React from 'react';
import { TrendingUp } from 'lucide-react';

const SessionStats = ({ sessionStats, frameDataHistory, sessionStartTimeRef }) => {
  const getCurrentDuration = () => {
    if (sessionStartTimeRef.current) {
      return Math.floor((new Date() - sessionStartTimeRef.current) / 1000);
    }
    return sessionStats.sessionDuration;
  };

  const getAvgHappiness = () => {
    if (frameDataHistory.length) {
      return (frameDataHistory.reduce((sum, frame) => sum + parseFloat(frame.emotion_happy || 0), 0) / frameDataHistory.length).toFixed(1);
    }
    return (sessionStats.avgHappiness * 100).toFixed(1);
  };

  const getAvgEngagement = () => {
    if (frameDataHistory.length) {
      return (frameDataHistory.reduce((sum, frame) => sum + (frame.overallEngagement || 0), 0) / frameDataHistory.length * 100).toFixed(1);
    }
    return (sessionStats.avgEngagement * 100).toFixed(1);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">Session Overview</h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Frames Analyzed</span>
          <span className="font-bold text-white">{sessionStats.framesAnalyzed}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Frames Recorded</span>
          <span className="font-bold text-purple-400">{frameDataHistory.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Avg Happiness</span>
          <span className="font-bold text-green-400">{getAvgHappiness()}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Avg Engagement</span>
          <span className="font-bold text-blue-400">{getAvgEngagement()}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Session Time</span>
          <span className="font-bold text-white">{getCurrentDuration()}s</span>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Happiness</span>
          <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 transition-all duration-500"
              style={{ width: `${getAvgHappiness()}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Engagement</span>
          <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all duration-500"
              style={{ width: `${getAvgEngagement()}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionStats;