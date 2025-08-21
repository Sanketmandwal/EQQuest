import React from 'react';
import { Sparkles, Camera, EyeIcon, Smile } from 'lucide-react';

const LatestCapture = ({ lastImageUrl, serverResponse }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-white">Latest Capture</h3>
      </div>

      <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gray-800">
        {lastImageUrl ? (
          <img src={lastImageUrl} alt="Latest capture" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No capture yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {serverResponse?.rawData && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-black/20 rounded p-2">
            <div className="flex items-center gap-1">
              <EyeIcon className="w-3 h-3" />
              <span>Eyes Open: {serverResponse.rawData.eyes_open?.value ? '✓' : '✗'}</span>
            </div>
          </div>
          <div className="bg-black/20 rounded p-2">
            <div className="flex items-center gap-1">
              <Smile className="w-3 h-3" />
              <span>Smile: {serverResponse.rawData.smile?.value ? '✓' : '✗'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestCapture;