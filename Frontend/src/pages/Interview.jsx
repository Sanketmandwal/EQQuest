import React, { useEffect, useRef, useState } from "react";
import {
    Camera,
    CameraOff,
    Play,
    Square,
    Send,
    Settings,
    Activity,
    Eye,
    Zap,
    Brain,
    Pause,
    RotateCcw,
    CheckCircle,
    AlertCircle,
    Clock,
    TrendingUp,
    Sparkles,
    User,
    Smile,
    EyeIcon,
    Loader2,
    Download,
    BarChart3,
    PieChart,
    LineChart,
    FileText,
    PlayCircle,
    StopCircle
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

const Interview = () => {
    // DOM refs
    const localVideoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const autoCaptureTimerRef = useRef(null);
    const sendLockRef = useRef(false);
    const sessionStartTimeRef = useRef(null);

    // state
    const [cameraOn, setCameraOn] = useState(false);
    const [status, setStatus] = useState("Ready to start your interview");
    const [lastImageUrl, setLastImageUrl] = useState(null);
    const [autoCapture, setAutoCapture] = useState(false);
    const [autoSend, setAutoSend] = useState(false);
    const [autoIntervalMs, setAutoIntervalMs] = useState(1000);
    const [serverResponse, setServerResponse] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sessionActive, setSessionActive] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    
    // CSV Data Storage
    const [frameDataHistory, setFrameDataHistory] = useState([]);
    
    const [sessionStats, setSessionStats] = useState({
        framesAnalyzed: 0,
        avgHappiness: 0,
        avgEngagement: 0,
        sessionDuration: 0,
        startTime: null,
        endTime: null
    });

    // API Configuration
    const PROXY_ENDPOINT = "http://localhost:3001/api/proxy/worqhat";
    const WORQAT_DIRECT_URL = "https://api.worqhat.com/flows/file/350326ce-22b0-4fed-b77b-0f748d81218d";
    const WORQHAT_API_KEY = "wh_meh6avuwhYmsbR6DxTWAXfNA4DNXHk5LgJ9IZFveti";

    // CSV Utilities
    const convertToCSV = (data) => {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    // Handle nested objects and arrays
                    if (typeof value === 'object' && value !== null) {
                        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                    }
                    // Escape commas and quotes in strings
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    };

    const downloadCSV = (data, filename = 'interview_session_data.csv') => {
        const csv = convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const formatFrameDataForCSV = (processedResponse, timestamp, frameNumber) => {
        const baseData = {
            frameNumber,
            timestamp,
            sessionDuration: sessionStartTimeRef.current ? 
                Math.round((new Date(timestamp) - sessionStartTimeRef.current) / 1000) : 0,
            
            // Overall metrics
            overallEngagement: processedResponse.metrics?.engagement || 0,
            confidence: processedResponse.confidence || 0,
            dominantEmotion: processedResponse.dominantEmotion || '',
            
            // Individual emotions
            emotion_happy: processedResponse.emotions?.happy || 0,
            emotion_calm: processedResponse.emotions?.calm || 0,
            emotion_surprised: processedResponse.emotions?.surprised || 0,
            emotion_fear: processedResponse.emotions?.fear || 0,
            emotion_angry: processedResponse.emotions?.angry || 0,
            emotion_confused: processedResponse.emotions?.confused || 0,
            emotion_sad: processedResponse.emotions?.sad || 0,
            emotion_disgusted: processedResponse.emotions?.disgusted || 0,
            
            // Metrics
            eyeContact: processedResponse.metrics?.eyeContact || 0,
            facialExpression: processedResponse.metrics?.facialExpression || 0,
            smile: processedResponse.metrics?.smile || 0,
            
            // Raw detection data
            age_low: processedResponse.rawData?.age_range?.low || '',
            age_high: processedResponse.rawData?.age_range?.high || '',
            gender: processedResponse.rawData?.gender?.value || '',
            gender_confidence: processedResponse.rawData?.gender?.confidence || '',
            eyes_open: processedResponse.rawData?.eyes_open?.value || false,
            eyes_open_confidence: processedResponse.rawData?.eyes_open?.confidence || '',
            smile_detected: processedResponse.rawData?.smile?.value || false,
            smile_confidence: processedResponse.rawData?.smile?.confidence || '',
            mouth_open: processedResponse.rawData?.mouth_open?.value || false,
            mouth_open_confidence: processedResponse.rawData?.mouth_open?.confidence || '',
            face_occluded: processedResponse.rawData?.face_occluded?.value || false,
            face_occluded_confidence: processedResponse.rawData?.face_occluded?.confidence || '',
            brightness: processedResponse.rawData?.quality?.brightness || '',
            sharpness: processedResponse.rawData?.quality?.sharpness || '',
            beard: processedResponse.rawData?.beard?.value || false,
            eyeglasses: processedResponse.rawData?.eyeglasses?.value || false,
            mustache: processedResponse.rawData?.mustache?.value || false,
            sunglasses: processedResponse.rawData?.sunglasses?.value || false,
            
            // Feedback summary
            feedback_count: processedResponse.feedback?.length || 0,
            primary_feedback: processedResponse.feedback?.[0] || ''
        };

        return baseData;
    };

    const startSession = () => {
        setSessionActive(true);
        sessionStartTimeRef.current = new Date();
        setSessionStats(prev => ({
            ...prev,
            startTime: sessionStartTimeRef.current.toISOString(),
            sessionDuration: 0
        }));
        setFrameDataHistory([]);
        setStatus("Interview session started - data recording active");
    };

    const endSession = () => {
        setSessionActive(false);
        const endTime = new Date();
        setSessionStats(prev => ({
            ...prev,
            endTime: endTime.toISOString(),
            sessionDuration: sessionStartTimeRef.current ? 
                Math.round((endTime - sessionStartTimeRef.current) / 1000) : prev.sessionDuration
        }));
        stopAutoCapture();
        setStatus("Interview session ended - ready for review");
    };

    // Simulated API functions (replace with your actual implementation)
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, frameRate: 30 },
                audio: false,
            });
            streamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                await localVideoRef.current.play();
            }
            setCameraOn(true);
            setStatus("Camera active - Ready to analyze");
        } catch (err) {
            console.error("getUserMedia error", err);
            setStatus("Unable to access camera");
        }
    };

    const stopCamera = () => {
        try {
            streamRef.current?.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
            if (localVideoRef.current) localVideoRef.current.srcObject = null;
        } catch (e) {
            console.warn(e);
        }
        setCameraOn(false);
        setStatus("Camera stopped");
        stopAutoCapture();
        if (sessionActive) {
            endSession();
        }
    };

    const captureFrame = async () => {
        const video = localVideoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) {
            setStatus("No video available");
            return null;
        }

        // Ensure canvas matches video dimensions
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setLastImageUrl(dataUrl);
        setStatus("Frame captured - analyzing...");

        return { dataUrl, canvas };
    };

    // Helper function to create blob with optional resizing
    const getBlobForSending = (canvas, { width = null, height = null, quality = 0.75 } = {}) => {
        return new Promise((resolve) => {
            let targetCanvas = canvas;

            // If resizing is needed
            if (width && height) {
                targetCanvas = document.createElement('canvas');
                targetCanvas.width = width;
                targetCanvas.height = height;

                const ctx = targetCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, 0, width, height);
            }

            targetCanvas.toBlob(resolve, 'image/jpeg', quality);
        });
    };

    // Send frame to proxy endpoint
    const sendFrameToProxy = async (canvas, { resize = true, width = 224, height = 224, quality = 0.75 } = {}) => {
        try {
            const blob = await getBlobForSending(canvas, {
                width: resize ? width : null,
                height: resize ? height : null,
                quality
            });

            if (!blob) {
                throw new Error("Failed to create blob");
            }

            const formData = new FormData();
            formData.append("file", blob);

            console.log("Sending frame to proxy", blob);

            const response = await fetch(PROXY_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${WORQHAT_API_KEY}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Worqhat response:", response.status, data);

            return { status: response.status, data };

        } catch (error) {
            console.error('Proxy API call failed:', error);
            throw error;
        }
    };

    // Process the real API response
    const processAPIResponse = (apiResponse) => {
        if (!apiResponse.success || !apiResponse.data?.data?.[0]) {
            throw new Error('Invalid API response structure');
        }

        const faceData = apiResponse.data.data[0];

        // Extract emotions and find dominant emotion
        const emotions = faceData.emotions || {};
        const dominantEmotion = Object.keys(emotions).reduce((a, b) =>
            parseFloat(emotions[a]) > parseFloat(emotions[b]) ? a : b
        );

        // Calculate engagement score based on multiple factors
        const eyesOpen = faceData.eyes_open?.value ? parseFloat(faceData.eyes_open.confidence) / 100 : 0;
        const smile = faceData.smile?.value ? parseFloat(faceData.smile.confidence) / 100 : 0;
        const happiness = parseFloat(emotions.happy || 0) / 100;
        const faceNotOccluded = faceData.face_occluded?.value ? 0 : parseFloat(faceData.face_occluded.confidence) / 100;

        const engagement = (eyesOpen + smile + happiness + faceNotOccluded) / 4;

        return {
            confidence: engagement,
            metrics: {
                eyeContact: eyesOpen,
                facialExpression: happiness,
                engagement: engagement,
                smile: smile
            },
            feedback: generateFeedback(faceData, dominantEmotion),
            timestamp: new Date().toISOString(),
            rawData: faceData,
            dominantEmotion,
            emotions
        };
    };

    // Generate feedback based on API data
    const generateFeedback = (faceData, dominantEmotion) => {
        const feedback = [];

        if (faceData.eyes_open?.value && parseFloat(faceData.eyes_open.confidence) > 90) {
            feedback.push("Excellent eye contact maintained");
        } else if (!faceData.eyes_open?.value) {
            feedback.push("Try to keep your eyes open and maintain eye contact");
        }

        if (faceData.smile?.value && parseFloat(faceData.smile.confidence) > 80) {
            feedback.push("Great natural smile - shows confidence");
        } else if (!faceData.smile?.value) {
            feedback.push("Consider a subtle smile to appear more approachable");
        }

        if (dominantEmotion === 'happy' && parseFloat(faceData.emotions.happy) > 80) {
            feedback.push("Positive emotional expression detected");
        } else if (dominantEmotion === 'calm') {
            feedback.push("Calm demeanor - good for professional settings");
        } else if (['angry', 'sad', 'fear'].includes(dominantEmotion)) {
            feedback.push("Try to relax and maintain a neutral to positive expression");
        }

        if (faceData.face_occluded?.value) {
            feedback.push("Ensure your face is clearly visible");
        }

        const brightness = parseFloat(faceData.quality?.brightness || 0);
        if (brightness < 50) {
            feedback.push("Consider improving lighting for better visibility");
        } else if (brightness > 90) {
            feedback.push("Lighting might be too bright - try to balance it");
        }

        return feedback.length > 0 ? feedback : ["Looking good! Keep up the professional demeanor"];
    };

    const captureFrameAndSend = async () => {
        const result = await captureFrame();
        if (!result) {
            setStatus("Capture failed");
            return;
        }

        if (sendLockRef.current) {
            setStatus("Analysis in progress...");
            return;
        }

        try {
            sendLockRef.current = true;
            setIsProcessing(true);
            setStatus("Analyzing facial expressions and emotions...");

            let processedResponse;
            
            try {
                const apiResponse = await sendFrameToProxy(result.canvas, {
                    resize: true,
                    width: 224,
                    height: 224,
                    quality: 0.75
                });

                processedResponse = processAPIResponse(apiResponse.data);

            } catch (error) {
                console.warn("Proxy API failed, using mock data:", error);

                // Fallback to mock data if proxy fails
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockApiResponse = {
                    success: true,
                    statusCode: "200",
                    data: {
                        data: [{
                            age_range: { high: "34", low: "26" },
                            beard: { value: true, confidence: "99.73488617" },
                            emotions: {
                                happy: (Math.random() * 50 + 50).toFixed(8),
                                calm: (Math.random() * 20).toFixed(8),
                                surprised: (Math.random() * 10).toFixed(8),
                                fear: (Math.random() * 5).toFixed(8),
                                angry: (Math.random() * 5).toFixed(8),
                                confused: (Math.random() * 5).toFixed(8),
                                sad: (Math.random() * 5).toFixed(8),
                                disgusted: (Math.random() * 5).toFixed(8)
                            },
                            eyeglasses: { confidence: "99.99120331", value: false },
                            eyes_open: { confidence: (Math.random() * 20 + 80).toFixed(8), value: true },
                            face_occluded: { confidence: "99.95767212", value: false },
                            gender: { confidence: "99.82041931", value: "Male" },
                            mouth_open: { confidence: "99.19053650", value: Math.random() > 0.5 },
                            mustache: { confidence: "58.71515274", value: false },
                            quality: {
                                brightness: (Math.random() * 40 + 50).toFixed(8),
                                sharpness: (Math.random() * 40 + 50).toFixed(8)
                            },
                            smile: { confidence: (Math.random() * 30 + 70).toFixed(8), value: true },
                            sunglasses: { confidence: "99.99562836", value: false }
                        }]
                    },
                    message: "Workflow triggered successfully with file upload"
                };

                processedResponse = processAPIResponse(mockApiResponse);
            }

            setServerResponse(processedResponse);

            // Add to CSV data if session is active
            if (sessionActive) {
                const frameNumber = frameDataHistory.length + 1;
                const csvData = formatFrameDataForCSV(processedResponse, processedResponse.timestamp, frameNumber);
                setFrameDataHistory(prev => [...prev, csvData]);
            }

            // Update session stats
            setSessionStats(prev => {
                const newHappiness = parseFloat(processedResponse?.emotions?.happy || 0) / 100;
                const newEngagement = processedResponse?.metrics?.engagement || 0;
                return {
                    ...prev,
                    framesAnalyzed: prev.framesAnalyzed + 1,
                    avgHappiness: prev.framesAnalyzed === 0 ? newHappiness : (prev.avgHappiness + newHappiness) / 2,
                    avgEngagement: prev.framesAnalyzed === 0 ? newEngagement : (prev.avgEngagement + newEngagement) / 2,
                    sessionDuration: sessionStartTimeRef.current ? 
                        Math.round((new Date() - sessionStartTimeRef.current) / 1000) : prev.sessionDuration
                };
            });

            setStatus("Analysis complete - detailed feedback ready");

        } catch (err) {
            console.error("Analysis failed:", err);
            setStatus("Analysis failed - please try again");
        } finally {
            sendLockRef.current = false;
            setIsProcessing(false);
        }
    };

    const startAutoCapture = () => {
        if (autoCaptureTimerRef.current) return;
        autoCaptureTimerRef.current = setInterval(async () => {
            if (autoSend) {
                await captureFrameAndSend();
            } else {
                await captureFrame();
            }
        }, Math.max(500, autoIntervalMs));
        setAutoCapture(true);
        setStatus("Auto-analysis started");
    };

    const stopAutoCapture = () => {
        if (autoCaptureTimerRef.current) {
            clearInterval(autoCaptureTimerRef.current);
            autoCaptureTimerRef.current = null;
        }
        setAutoCapture(false);
        setStatus("Auto-analysis stopped");
    };

    useEffect(() => {
        return () => {
            stopAutoCapture();
            stopCamera();
        };
    }, []);

    const getStatusIcon = () => {
        if (isProcessing) return <Activity className="w-4 h-4 animate-spin text-blue-400" />;
        if (cameraOn && autoCapture) return <CheckCircle className="w-4 h-4 text-green-400" />;
        if (cameraOn) return <Eye className="w-4 h-4 text-blue-400" />;
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    };

    // Analytics Components
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

        // Calculate emotion totals and averages with error handling
        const emotionTotals = frameDataHistory.reduce((acc, frame) => {
            // Ensure all emotion values are properly parsed as numbers
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
            happy: 0, 
            calm: 0, 
            surprised: 0, 
            fear: 0, 
            angry: 0, 
            sad: 0, 
            confused: 0, 
            disgusted: 0 
        });

        // Calculate averages
        const frameCount = frameDataHistory.length;
        const emotionColors = {
            happy: '#10B981',    // Green
            calm: '#3B82F6',     // Blue
            surprised: '#F59E0B', // Amber
            fear: '#EF4444',     // Red
            angry: '#F97316',    // Orange
            sad: '#8B5CF6',      // Purple
            confused: '#06B6D4', // Cyan
            disgusted: '#84CC16' // Lime
        };

        // Convert to chart data, filtering out emotions with 0 values
        const chartData = Object.entries(emotionTotals)
            .map(([emotion, total]) => ({
                name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
                value: parseFloat((total / frameCount).toFixed(1)),
                fill: emotionColors[emotion] || '#6B7280'
            }))
            .filter(item => item.value > 0) // Only show emotions that have values
            .sort((a, b) => b.value - a.value); // Sort by value descending

        // If no emotions have values, show a message
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

    if (showAnalytics) {
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
                                        onClick={() => downloadCSV(frameDataHistory)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download CSV
                                    </button>
                                    <button
                                        onClick={() => setShowAnalytics(false)}
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
                                {getStatusIcon()}
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
                    <div className="mb-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-300">
                                    <span className="font-medium">Session Status:</span> {sessionActive ? 'Active' : 'Inactive'}
                                </div>
                                {sessionActive && sessionStartTimeRef.current && (
                                    <div className="text-sm text-gray-300">
                                        <span className="font-medium">Duration:</span> {Math.floor((new Date() - sessionStartTimeRef.current) / 1000)}s
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
                                            onClick={() => downloadCSV(frameDataHistory)}
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

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Side - Video and Controls (2/3 width) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Video Container */}
                            <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                                    <div className={`w-2 h-2 rounded-full ${cameraOn ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                                    <span className="text-xs text-white">{cameraOn ? 'LIVE' : 'OFFLINE'}</span>
                                </div>

                                {/* Processing indicator - small popup instead of overlay */}
                                {isProcessing && (
                                    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-blue-600/90 backdrop-blur-sm rounded-lg border border-blue-500/50 animate-pulse">
                                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                                        <span className="text-xs text-white font-medium">Analyzing...</span>
                                    </div>
                                )}

                                {/* Emotion indicator */}
                                {serverResponse?.dominantEmotion && (
                                    <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                                        <span className="text-xs text-white capitalize">
                                            😊 {serverResponse.dominantEmotion} ({parseFloat(serverResponse.emotions[serverResponse.dominantEmotion]).toFixed(1)}%)
                                        </span>
                                    </div>
                                )}

                                {/* Session recording indicator */}
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

                            {/* Processing Status Card - Alternative indicator */}
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

                            {/* Controls */}
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
                                        onClick={captureFrameAndSend}
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
                                            min="500"
                                            max="3000"
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

                            {/* Bottom Row - Latest Capture and Session Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Latest Capture */}
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

                                {/* Session Stats */}
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
                                            <span className="font-bold text-green-400">
                                                {frameDataHistory.length ? 
                                                    (frameDataHistory.reduce((sum, frame) => sum + parseFloat(frame.emotion_happy || 0), 0) / frameDataHistory.length).toFixed(1)
                                                    : (sessionStats.avgHappiness * 100).toFixed(1)
                                                }%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Avg Engagement</span>
                                            <span className="font-bold text-blue-400">
                                                {frameDataHistory.length ? 
                                                    (frameDataHistory.reduce((sum, frame) => sum + (frame.overallEngagement || 0), 0) / frameDataHistory.length * 100).toFixed(1)
                                                    : (sessionStats.avgEngagement * 100).toFixed(1)
                                                }%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Session Time</span>
                                            <span className="font-bold text-white">
                                                {sessionStartTimeRef.current ? 
                                                    Math.floor((new Date() - sessionStartTimeRef.current) / 1000)
                                                    : sessionStats.sessionDuration
                                                }s
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Indicators */}
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Happiness</span>
                                            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-400 transition-all duration-500"
                                                    style={{ 
                                                        width: `${frameDataHistory.length ? 
                                                            (frameDataHistory.reduce((sum, frame) => sum + parseFloat(frame.emotion_happy || 0), 0) / frameDataHistory.length)
                                                            : sessionStats.avgHappiness * 100
                                                        }%` 
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Engagement</span>
                                            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-400 transition-all duration-500"
                                                    style={{ 
                                                        width: `${frameDataHistory.length ? 
                                                            (frameDataHistory.reduce((sum, frame) => sum + (frame.overallEngagement || 0), 0) / frameDataHistory.length * 100)
                                                            : sessionStats.avgEngagement * 100
                                                        }%` 
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Emotion Analysis and AI Feedback (1/3 width) */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Emotion Analysis */}
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
                                                            className={`h-full rounded-full transition-all duration-500 ${emotion === 'happy' ? 'bg-green-400' :
                                                                emotion === 'calm' ? 'bg-blue-400' :
                                                                    emotion === 'surprised' ? 'bg-yellow-400' :
                                                                        emotion === 'fear' ? 'bg-red-400' :
                                                                            emotion === 'angry' ? 'bg-orange-400' :
                                                                                'bg-gray-400'
                                                                }`}
                                                            style={{ width: `${Math.min(parseFloat(value), 100)}%` }}
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

                            {/* AI Feedback */}
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
                                                            className={`h-full rounded-full transition-all duration-500 ${value > 0.8 ? 'bg-green-400' : value > 0.6 ? 'bg-yellow-400' : 'bg-red-400'
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