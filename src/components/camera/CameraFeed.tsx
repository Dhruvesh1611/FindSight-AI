'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Circle, Wifi, WifiOff, ScanFace, Maximize } from 'lucide-react';

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
          width: { ideal: 1280 },
          height: { ideal: 720 },
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
    <div className="space-y-6">
      {/* Camera Feed */}
      <div 
        className={`camera-container relative bg-black ${isMonitoring ? 'monitoring' : ''}`} 
        style={{ minHeight: '480px' }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover absolute inset-0"
          style={{
            display: isStreaming ? 'block' : 'none',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
        />

        {/* Scan overlay */}
        {isStreaming && isMonitoring && (
          <>
            <div className="scan-line shadow-[0_0_20px_rgba(124,58,237,0.5)]" />
            <div className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 100px rgba(124, 58, 237, 0.15)',
              }}
            />
            {/* Corner brackets */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-accent-primary rounded-tl-xl opacity-70" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-accent-primary rounded-tr-xl opacity-70" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-accent-primary rounded-bl-xl opacity-70" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-accent-primary rounded-br-xl opacity-70" />
            
            {/* Center target UI */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none opacity-20">
              <div className="w-full h-full border border-dashed border-white rounded-full animate-spin-slow" style={{ animationDuration: '20s' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border border-white/30 rounded-full"></div>
            </div>
          </>
        )}

        {/* Status badge */}
        {isStreaming && (
          <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider"
            style={{
              background: isMonitoring ? 'rgba(124, 58, 237, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isMonitoring ? '#c4b5fd' : '#6ee7b7',
              border: `1px solid ${isMonitoring ? 'rgba(124, 58, 237, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Circle className="w-2.5 h-2.5 fill-current drop-shadow-[0_0_8px_currentColor]" />
            </motion.div>
            {isMonitoring ? 'AI SCANNING ACTIVE' : 'LIVE FEED'}
          </div>
        )}

        {/* Action icons */}
        {isStreaming && (
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button
              onClick={captureFrame}
              className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/60 transition-all"
              title="Manual Capture"
            >
              <ScanFace className="w-5 h-5" />
            </button>
            <button
              onClick={toggleCamera}
              className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/60 transition-all"
              title="Switch Camera"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Placeholder when camera is off */}
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/40 backdrop-blur-sm">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-24 h-24 mb-6 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '3s' }}></div>
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md">
                <Camera className="w-8 h-8 text-white/50" />
              </div>
            </motion.div>
            <div>
              <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                System Offline
              </p>
              <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
                Initialize camera connection to begin surveillance feed
              </p>
            </div>
            
            <button 
              onClick={startCamera} 
              className="mt-8 glow-btn flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              Initialize Connection
            </button>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-red-950/20 backdrop-blur-md">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-6">
              <CameraOff className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-400 mb-2">Connection Failed</p>
              <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      {isStreaming && (
        <div className="flex justify-center">
          <button 
            onClick={stopCamera} 
            className="btn-ghost flex items-center gap-2 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
          >
            <WifiOff className="w-4 h-4" />
            Disconnect Feed
          </button>
        </div>
      )}
    </div>
  );
}
