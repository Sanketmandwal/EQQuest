

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

    export { convertToCSV, downloadCSV, formatFrameDataForCSV };