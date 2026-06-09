'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Circle, Wifi, WifiOff } from 'lucide-react';

interface CameraFeedProps {
  onFrameCapture: (imageData: string) => void;
  captureInterval?: number;
  isMonitoring: boolean;
}

export default function CameraFeed({ onFrameCapture, captureInterval = 3000, isMonitoring }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please grant camera permissions.');
      setIsStreaming(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onFrameCapture(imageData);
  }, [onFrameCapture]);

  // Auto-capture frames when monitoring
  useEffect(() => {
    if (isStreaming && isMonitoring) {
      intervalRef.current = setInterval(captureFrame, captureInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming, isMonitoring, captureFrame, captureInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isStreaming) {
      stopCamera();
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  return (
    <div className="space-y-4">
      {/* Camera Feed */}
      <div className="camera-container relative" style={{
        background: 'var(--bg-card)',
        minHeight: '360px',
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-2xl"
          style={{
            display: isStreaming ? 'block' : 'none',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
        />

        {/* Scan overlay */}
        {isStreaming && isMonitoring && (
          <>
            <div className="scan-line" />
            <div className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                border: '2px solid rgba(99, 102, 241, 0.3)',
                boxShadow: 'inset 0 0 30px rgba(99, 102, 241, 0.1)',
              }}
            />
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-indigo-400/50 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-indigo-400/50 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-indigo-400/50 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-indigo-400/50 rounded-br-lg" />
          </>
        )}

        {/* Status badge */}
        {isStreaming && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: isMonitoring ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: isMonitoring ? '#34d399' : '#fbbf24',
              border: `1px solid ${isMonitoring ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              backdropFilter: 'blur(8px)',
            }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Circle className="w-2 h-2 fill-current" />
            </motion.div>
            {isMonitoring ? 'SCANNING' : 'LIVE'}
          </div>
        )}

        {/* Placeholder when camera is off */}
        {!isStreaming && !error && (
          <div className="flex flex-col items-center justify-center h-[360px] text-center space-y-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-6 rounded-2xl"
              style={{ background: 'rgba(99, 102, 241, 0.1)' }}
            >
              <Camera className="w-12 h-12" style={{ color: '#818cf8' }} />
            </motion.div>
            <div>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Camera Feed Offline
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Click &quot;Start Camera&quot; to begin monitoring
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center h-[360px] text-center space-y-4 px-6">
            <div className="p-6 rounded-2xl" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <CameraOff className="w-12 h-12 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-red-400">Camera Error</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isStreaming ? (
          <button onClick={startCamera} className="glow-btn flex items-center gap-2 flex-1 justify-center">
            <Wifi className="w-4 h-4" />
            Start Camera
          </button>
        ) : (
          <button onClick={stopCamera} className="glow-btn glow-btn-danger flex items-center gap-2 flex-1 justify-center">
            <WifiOff className="w-4 h-4" />
            Stop Camera
          </button>
        )}

        {isStreaming && (
          <>
            <button
              onClick={toggleCamera}
              className="glow-btn px-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              title="Switch Camera"
            >
              🔄
            </button>
            <button
              onClick={captureFrame}
              className="glow-btn px-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              title="Capture Frame"
            >
              📸
            </button>
          </>
        )}
      </div>
    </div>
  );
}
