// File: src/components/InputPage.js
import React, { useState, useRef ,useEffect} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSafety } from '../contexts/safetyContext'; // Changed to lowercaseimport { useSearchParams, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import axios from 'axios';
import { FaTimes,FaKeyboard, FaCamera, FaMicrophone, FaCheck, FaSpinner, FaLeaf,FaExclamationTriangle } from 'react-icons/fa';
import '../styles/InputPage.css';
import ReactMarkdown from 'react-markdown';

// Constants
const MAX_RECORDING_TIME = 60; // 60 seconds max
const AUDIO_CONFIG = {
    audio: {
        channelCount: 1,        // Mono audio
        sampleRate: 16000,      // 16 kHz sample rate
        sampleSize: 16,         // 16-bit depth
        echoCancellation: true,
        noiseSuppression: true
    }
};

const InputPage = () => {
    const { accounts } = useMsal();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [inputType, setInputType] = useState(searchParams.get('type') || 'text');
    const [textInput, setTextInput] = useState('');
    const [safetyAlert, setSafetyAlert] = useState({ show: false, message: '' });
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const { checkContent } = useSafety();

    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
                if (mediaRecorderRef.current.stream) {
                    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                }
            }
        };
    }, [isRecording]);

// Remove or comment out this useEffect
/* useEffect(() => {
    if (safetyAlert.show) {
        const timer = setTimeout(() => {
            setSafetyAlert({ show: false, message: '' });
        }, 5000);

        return () => clearTimeout(timer);
    }
}, [safetyAlert.show]); */

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONFIG);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
                audioBitsPerSecond: 256000
            });
            mediaRecorderRef.current = mediaRecorder;

            const audioChunks = [];
            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const wavBlob = await convertToWav(audioBlob);
                setAudioBlob(wavBlob);

                // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());
            });

            mediaRecorder.start(1000); // Record in 1-second chunks
            setIsRecording(true);

            // Start timer
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= MAX_RECORDING_TIME - 1) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check permissions.');
        }
    };

    const convertToWav = async (webmBlob) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });

            const arrayBuffer = await webmBlob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Create WAV buffer
            const numberOfChannels = 1;
            const length = audioBuffer.length;
            const wavBuffer = audioContext.createBuffer(numberOfChannels, length, 16000);

            // Copy audio data to new buffer
            const channelData = audioBuffer.getChannelData(0);
            wavBuffer.copyToChannel(channelData, 0);

            // Convert to WAV blob
            const wavBlob = await audioBufferToWav(wavBuffer);
            return new Blob([wavBlob], { type: 'audio/wav' });
        } catch (error) {
            console.error('Error converting audio:', error);
            throw new Error('Failed to convert audio format');
        }
    };

    const audioBufferToWav = (buffer) => {
        const numberOfChannels = 1;
        const sampleRate = 16000;
        const bitsPerSample = 16;
        const bytesPerSample = bitsPerSample / 8;
        const blockAlign = numberOfChannels * bytesPerSample;
        const byteRate = sampleRate * blockAlign;
        const dataSize = buffer.length * blockAlign;
        const arrayBuffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(arrayBuffer);

        // WAV header
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);

        // Write audio data
        const channelData = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < channelData.length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }

        return arrayBuffer;
    };

    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let fileUrl = null;

            // If we have a file to upload (image or audio)
            if ((inputType === 'image' && imageFile) || (inputType === 'voice' && audioBlob)) {
                const formData = new FormData();
                if (inputType === 'image') {
                    formData.append('file', imageFile);
                } else if (inputType === 'voice') {
                    formData.append('file', audioBlob, 'recording.wav');
                }

                // Upload the file
                const uploadResponse = await axios.post(
                    `${process.env.REACT_APP_API_URL}/upload`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'x-functions-key': process.env.REACT_APP_FUNCTION_KEY
                        }
                    }
                );

                fileUrl = uploadResponse.data.url;
            }
            
            if(inputType=='text')
            {
                 // Content Safety Check
                const isSafe = await checkContent({ text: textInput });
                if (!isSafe) {
                    setSafetyAlert({
                        show: true,
                        message: 'Content contains inappropriate material. Please revise.'
                    });                    setIsSubmitting(false);
                    return;
                }
            }
            // Prepare input data based on type
            const inputData = {
                userId: accounts[0].localAccountId,
                inputType: inputType,
                text: inputType === 'text' ? textInput : null,
                imageUrl: inputType === 'image' ? fileUrl : null,
                voiceUrl: inputType === 'voice' ? fileUrl : null
            };

            // Send for analysis
            const analysisResponse = await axios.post(
                `${process.env.REACT_APP_API_URL}/analyze`,
                inputData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-functions-key': process.env.REACT_APP_FUNCTION_KEY
                    }
                }
            );

            setResult(analysisResponse.data);
            setIsSubmitting(false);

        } catch (error) {
            console.error('Error submitting input:', error);
            alert('There was an error processing your input. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleTabChange = (type) => {
        setInputType(type);
        setResult(null);
        setTextInput('');
        setImagePreview(null);
        setImageFile(null);
        setAudioBlob(null);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="input-page">
            <h1>Log Your Eco Activity</h1>

            <div className="input-tabs">
                <button
                    className={inputType === 'text' ? 'active' : ''}
                    onClick={() => handleTabChange('text')}
                >
                    <FaKeyboard /> Text
                </button>
                <button
                    className={inputType === 'image' ? 'active' : ''}
                    onClick={() => handleTabChange('image')}
                >
                    <FaCamera /> Image
                </button>
                <button
                    className={inputType === 'voice' ? 'active' : ''}
                    onClick={() => handleTabChange('voice')}
                >
                    <FaMicrophone /> Voice
                </button>
            </div>

            {!result ? (
                <form onSubmit={handleSubmit} className="input-form">
                    {inputType === 'text' && (
                        <div className="text-input-container">
                            <label htmlFor="text-input">
                                Describe your eco activities or habits:
                            </label>
                            <textarea
                                id="text-input"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Example: I biked to work today instead of driving, and I used my reusable water bottle."
                                required
                            />
                        </div>
                    )}
        
        {safetyAlert.show && (
    <div className="safety-alert">
        <FaExclamationTriangle size={24} className="safety-alert-icon" />
        <div className="safety-alert-content">
            <div className="safety-alert-message">{safetyAlert.message}</div>
            <button 
                className="safety-alert-close"
                onClick={() => setSafetyAlert({ show: false, message: '' })}
            >
                Acknowledge and Close
            </button>
        </div>
    </div>
)}
                    {inputType === 'image' && (
                        <div className="image-input-container">
                            <label>
                                Upload a photo related to your eco activities:
                                <small>Take a photo of your groceries, waste, transportation, etc.</small>
                            </label>
                            {!imagePreview ? (
                                <>
                                    <button
                                        type="button"
                                        className="upload-button"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <FaCamera /> Select Image
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </>
                            ) : (
                                <div className="image-preview-container">
                                    <img src={imagePreview} alt="Preview" className="image-preview" />
                                    <button
                                        type="button"
                                        className="change-image-button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setImageFile(null);
                                        }}
                                    >
                                        Change Image
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {inputType === 'voice' && (
                        <div className="voice-input-container">
                            <label>
                                Record your voice explaining your eco activities:
                                <small>Share what you've done today for sustainability.</small>
                            </label>
                            {!audioBlob ? (
                                <div className="recorder-controls">
                                    {!isRecording ? (
                                        <button
                                            type="button"
                                            className="record-button"
                                            onClick={startRecording}
                                        >
                                            <FaMicrophone /> Start Recording
                                        </button>
                                    ) : (
                                        <>
                                            <div className="recording-indicator">Recording... {formatTime(recordingTime)}</div>
                                            <button
                                                type="button"
                                                className="stop-button"
                                                onClick={stopRecording}
                                            >
                                                Stop Recording
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="recording-preview">
                                    <audio controls src={URL.createObjectURL(audioBlob)}></audio>
                                    <button
                                        type="button"
                                        onClick={() => setAudioBlob(null)}
                                        className="discard-recording"
                                    >
                                        Discard and Record Again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={
                            isSubmitting ||
                            (inputType === 'text' && !textInput) ||
                            (inputType === 'image' && !imageFile) ||
                            (inputType === 'voice' && !audioBlob)
                        }
                    >
                        {isSubmitting ? <FaSpinner className="spinner" /> : <FaCheck />}
                        {isSubmitting ? 'Analyzing...' : 'Get Eco Advice'}
                    </button>
                </form>
            ) : (
                <div className="result-container">
                    <div className="result-card">
                        <h2>Your Eco Analysis</h2>

                        {result.transcription && (
                            <div className="transcription-section">
                                <h3>Your Recording Transcription:</h3>
                                <p className="transcription">{result.transcription}</p>
                            </div>
                        )}
                        <div className="eco-advice">
                            <h3>Analysis Details:</h3>
                            <p><ReactMarkdown>{result.analysisDetails}</ReactMarkdown></p>
                        </div>
                        <div className="eco-advice">
                            <h3>Eco Advice:</h3>
                            <p>{result.advice}</p>
                        </div>

                        {result.ecoPoints && (
                                <div className={`eco-points ${result.ecoPoints > 0 ? 'positive' : 'negative'}`}>
                                    <span className="points-icon">
                                        {result.ecoPoints > 0 ? <FaLeaf /> : <FaExclamationTriangle />}
                                    </span>
                                    <span className="points-value">{result.ecoPoints}</span>
                                    <span className="points-label">
                                        {result.ecoPoints > 0 ? 'Eco Points Earned' : 'Environmental Impact Points'}
                                    </span>
                                </div>
                            )}
                       
                        <div className="result-actions">
                            <button onClick={() => setResult(null)} className="new-input-button">
                                Log Another Activity
                            </button>
                            <button onClick={() => navigate('/')} className="return-button">
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InputPage;