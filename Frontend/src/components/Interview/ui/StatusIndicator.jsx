import React from 'react';
import { Activity, Eye, CheckCircle, AlertCircle } from 'lucide-react';

const StatusIndicator = ({ isProcessing, cameraOn, autoCapture }) => {
  const getStatusIcon = () => {
    if (isProcessing) return <Activity className="w-4 h-4 animate-spin text-blue-400" />;
    if (cameraOn && autoCapture) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (cameraOn) return <Eye className="w-4 h-4 text-blue-400" />;
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  return getStatusIcon();
};

export default StatusIndicator;