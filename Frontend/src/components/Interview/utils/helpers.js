export const generateFeedback = (faceData, dominantEmotion) => {
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

export const processAPIResponse = (apiResponse) => {
  if (!apiResponse.success || !apiResponse.data?.data?.[0]) {
    throw new Error('Invalid API response structure');
  }

  const faceData = apiResponse.data.data[0];
  const emotions = faceData.emotions || {};
  const dominantEmotion = Object.keys(emotions).reduce((a, b) =>
    parseFloat(emotions[a]) > parseFloat(emotions[b]) ? a : b
  );

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

export const getMockApiResponse = () => ({
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
});