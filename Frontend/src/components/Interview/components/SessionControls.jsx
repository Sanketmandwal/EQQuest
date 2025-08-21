import React from 'react';
import { PlayCircle, StopCircle, BarChart3, Download } from 'lucide-react';

const SessionControls = ({ 
  sessionActive, 
  startSession, 
  endSession, 
  cameraOn, 
  frameDataHistory, 
  setShowAnalytics,
  onDownloadCSV,
  sessionStartTimeRef 
}) => {
  const getSessionDuration = () => {
    if (sessionActive && sessionStartTimeRef.current) {
      return Math.floor((new Date() - sessionStartTimeRef.current) / 1000);
    }
    return 0;
  };

  return (
    <div className="mb-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">
            <span className="font-medium">Session Status:</span> {sessionActive ? 'Active' : 'Inactive'}
          </div>
          {sessionActive && (
            <div className="text-sm text-gray-300">
              <span className="font-medium">Duration:</span> {getSessionDuration()}s
            </div>
          )}
          <div className="text-sm text-gray-300">
            <span className="font-medium">Frames Recorded:</span> {frameDataHistory.length}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!sessionActive ? (
            <button
              onClick={startSession}
              disabled={!cameraOn}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
            >
              <PlayCircle className="w-4 h-4" />
              Start Session
            </button>
          ) : (
            <button
              onClick={endSession}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
            >
              <StopCircle className="w-4 h-4" />
              End Session
            </button>
          )}
          
          {frameDataHistory.length > 0 && (
            <>
              <button
                onClick={() => setShowAnalytics(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </button>
              
              <button
                onClick={onDownloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionControls;