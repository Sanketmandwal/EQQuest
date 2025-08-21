import React from 'react';
import { BarChart3, Download, PieChart, LineChart, FileText, AlertCircle } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

const AnalyticsView = ({ frameDataHistory, sessionStats, onBack, onDownloadCSV }) => {
  const renderEmotionOverTime = () => {
    if (!frameDataHistory.length) return null;

    const chartData = frameDataHistory.map((frame, index) => ({
      frame: index + 1,
      time: Math.round(frame.sessionDuration),
      happy: parseFloat(frame.emotion_happy),
      calm: parseFloat(frame.emotion_calm),
      engagement: frame.overallEngagement * 100
    }));

    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <LineChart className="w-5 h-5 text-blue-400" />
          Emotions Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="happy" stroke="#10B981" strokeWidth={2} name="Happiness %" />
            <Line type="monotone" dataKey="calm" stroke="#3B82F6" strokeWidth={2} name="Calm %" />
            <Line type="monotone" dataKey="engagement" stroke="#F59E0B" strokeWidth={2} name="Engagement %" />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderEngagementMetrics = () => {
    if (!frameDataHistory.length) return null;

    const avgMetrics = frameDataHistory.reduce((acc, frame) => {
      acc.eyeContact += frame.eyeContact;
      acc.smile += frame.smile;
      acc.engagement += frame.overallEngagement;
      return acc;
    }, { eyeContact: 0, smile: 0, engagement: 0 });

    Object.keys(avgMetrics).forEach(key => {
      avgMetrics[key] = (avgMetrics[key] / frameDataHistory.length * 100).toFixed(1);
    });

    const chartData = [
      { name: 'Eye Contact', value: parseFloat(avgMetrics.eyeContact), fill: '#10B981' },
      { name: 'Smile', value: parseFloat(avgMetrics.smile), fill: '#3B82F6' },
      { name: 'Overall Engagement', value: parseFloat(avgMetrics.engagement), fill: '#F59E0B' }
    ];

    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-400" />
          Average Performance Metrics
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderEmotionDistribution = () => {
    if (!frameDataHistory.length) {
      return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            Average Emotion Distribution
          </h3>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No data available</p>
              <p className="text-xs text-gray-600 mt-1">Start a session to see emotion distribution</p>
            </div>
          </div>
        </div>
      );
    }

    const emotionTotals = frameDataHistory.reduce((acc, frame) => {
      acc.happy += parseFloat(frame.emotion_happy || 0);
      acc.calm += parseFloat(frame.emotion_calm || 0);
      acc.surprised += parseFloat(frame.emotion_surprised || 0);
      acc.fear += parseFloat(frame.emotion_fear || 0);
      acc.angry += parseFloat(frame.emotion_angry || 0);
      acc.sad += parseFloat(frame.emotion_sad || 0);
      acc.confused += parseFloat(frame.emotion_confused || 0);
      acc.disgusted += parseFloat(frame.emotion_disgusted || 0);
      return acc;
    }, { 
      happy: 0, calm: 0, surprised: 0, fear: 0, angry: 0, sad: 0, confused: 0, disgusted: 0 
    });

    const frameCount = frameDataHistory.length;
    const emotionColors = {
      happy: '#10B981', calm: '#3B82F6', surprised: '#F59E0B', fear: '#EF4444',
      angry: '#F97316', sad: '#8B5CF6', confused: '#06B6D4', disgusted: '#84CC16'
    };

    const chartData = Object.entries(emotionTotals)
      .map(([emotion, total]) => ({
        name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: parseFloat((total / frameCount).toFixed(1)),
        fill: emotionColors[emotion] || '#6B7280'
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    if (chartData.length === 0) {
      return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            Average Emotion Distribution
          </h3>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No emotion data detected</p>
              <p className="text-xs text-gray-600 mt-1">Emotions may not be properly analyzed</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-400" />
          Average Emotion Distribution
        </h3>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="w-full lg:w-2/3">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  dataKey="value"
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={30}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value}%`, 'Average']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/3 space-y-2">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Emotion Breakdown:</h4>
            {chartData.map((emotion, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: emotion.fill }}
                  />
                  <span className="text-xs text-gray-300">{emotion.name}</span>
                </div>
                <span className="text-xs text-white font-medium">{emotion.value}%</span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                <p>Total frames: {frameCount}</p>
                <p>Dominant emotion: <span className="text-white">{chartData[0]?.name || 'N/A'}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,200,255,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Analytics Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Interview Session Analytics
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Session completed • {frameDataHistory.length} frames analyzed • {sessionStats.sessionDuration}s duration
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onDownloadCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                >
                  ← Back to Interview
                </button>
              </div>
            </div>
          </header>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-white">{frameDataHistory.length}</div>
              <div className="text-gray-400 text-sm">Frames Analyzed</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-green-400">
                {frameDataHistory.length ? 
                  (frameDataHistory.reduce((sum, frame) => sum + parseFloat(frame.emotion_happy || 0), 0) / frameDataHistory.length).toFixed(1)
                  : '0'
                }%
              </div>
              <div className="text-gray-400 text-sm">Avg Happiness</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {frameDataHistory.length ? 
                  (frameDataHistory.reduce((sum, frame) => sum + (frame.overallEngagement || 0), 0) / frameDataHistory.length * 100).toFixed(1)
                  : '0'
                }%
              </div>
              <div className="text-gray-400 text-sm">Avg Engagement</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-purple-400">{Math.floor(sessionStats.sessionDuration / 60)}:{(sessionStats.sessionDuration % 60).toString().padStart(2, '0')}</div>
              <div className="text-gray-400 text-sm">Session Duration</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {renderEmotionOverTime()}
            {renderEngagementMetrics()}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {renderEmotionDistribution()}
            
            {/* Session Summary */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                Session Summary & Recommendations
              </h3>
              <div className="space-y-4">
                {frameDataHistory.length > 0 && (
                  <>
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-gray-300 font-medium mb-2">Key Insights:</h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Most dominant emotion: <span className="text-white">
                          {Object.entries(
                            frameDataHistory.reduce((acc, frame) => {
                              const emotion = frame.dominantEmotion || 'unknown';
                              acc[emotion] = (acc[emotion] || 0) + 1;
                              return acc;
                            }, {})
                          ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                        </span></li>
                        <li>• Eye contact consistency: <span className="text-white">
                          {frameDataHistory.length ? 
                            (frameDataHistory.filter(f => f.eyes_open === true || f.eyes_open === 'true').length / frameDataHistory.length * 100).toFixed(0)
                            : '0'
                          }%
                        </span></li>
                        <li>• Smile frequency: <span className="text-white">
                          {frameDataHistory.length ? 
                            (frameDataHistory.filter(f => f.smile_detected === true || f.smile_detected === 'true').length / frameDataHistory.length * 100).toFixed(0)
                            : '0'
                          }%
                        </span></li>
                        <li>• Average brightness level: <span className="text-white">
                          {frameDataHistory.length ? 
                            (frameDataHistory.reduce((sum, frame) => sum + parseFloat(frame.brightness || 0), 0) / frameDataHistory.length).toFixed(0)
                            : '0'
                          }%
                        </span></li>
                      </ul>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-gray-300 font-medium mb-2">Recommendations:</h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        {(() => {
                          const avgHappiness = frameDataHistory.reduce((sum, frame) => sum + parseFloat(frame.emotion_happy || 0), 0) / frameDataHistory.length;
                          const avgEngagement = frameDataHistory.reduce((sum, frame) => sum + (frame.overallEngagement || 0), 0) / frameDataHistory.length;
                          const eyeContactRate = frameDataHistory.filter(f => f.eyes_open === true || f.eyes_open === 'true').length / frameDataHistory.length;
                          
                          const recommendations = [];
                          
                          if (avgHappiness < 60) {
                            recommendations.push("• Try to maintain a more positive facial expression during interviews");
                          }
                          if (avgEngagement < 0.7) {
                            recommendations.push("• Work on overall engagement - practice active listening poses");
                          }
                          if (eyeContactRate < 0.8) {
                            recommendations.push("• Maintain better eye contact with the camera/interviewer");
                          }
                          if (recommendations.length === 0) {
                            recommendations.push("• Excellent performance! Keep up the professional demeanor");
                            recommendations.push("• Your facial expressions and engagement levels are well-balanced");
                          }
                          
                          return recommendations.map((rec, i) => <li key={i}>{rec}</li>);
                        })()}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;