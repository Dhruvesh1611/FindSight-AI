'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Maximize, ScanFace, SwitchCamera, Wifi, WifiOff } from 'lucide-react';

interface CameraFeedProps {
  onFrameCapture?: (imageData: string) => void;
  captureInterval?: number;
  isMonitoring: boolean;
}

export default function CameraFeed({ onFrameCapture, captureInterval = 3000, isMonitoring }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceDetectorRef = useRef<FaceDetector | null>(null);
  const intervalRef = useRef<number | null>(null);
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

      const windowWithDetector = window as unknown as {
        FaceDetector?: new (options?: { fastMode: boolean; maxDetectedFaces: number }) => FaceDetector;
      };
      const Detector = windowWithDetector.FaceDetector;
      if (Detector) {
        try {
          faceDetectorRef.current = new Detector({ fastMode: true, maxDetectedFaces: 1 });
        } catch (faceError) {
          console.warn('FaceDetector initialization failed:', faceError);
          faceDetectorRef.current = null;
        }
      } else {
        faceDetectorRef.current = null;
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
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);
  const detectionIntervalRef = useRef<number | null>(null);
  const facePresentRef = useRef(false);

  // Capture a full-resolution frame and send to handler
  const captureFullFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !onFrameCapture) return;

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

  // Detection loop: run on a small canvas to check for face presence
  const detCanvasRef = useRef<HTMLCanvasElement>(null);

  const detectLoop = useCallback(async () => {
    if (!videoRef.current || !detCanvasRef.current || !faceDetectorRef.current) return;

    const video = videoRef.current;
    const detCanvas = detCanvasRef.current;
    const dctx = detCanvas.getContext('2d');
    if (!dctx) return;

    // Downscale for faster detection
    const targetW = 320;
    const ratio = video.videoHeight && video.videoWidth ? video.videoHeight / video.videoWidth : 0.5625;
    const targetH = Math.max(240, Math.round(targetW * ratio));
    detCanvas.width = targetW;
    detCanvas.height = targetH;
    dctx.drawImage(video, 0, 0, targetW, targetH);

    try {
      const faces = await faceDetectorRef.current.detect(detCanvas);
      const found = Array.isArray(faces) && faces.length > 0;
        if (found && !facePresentRef.current) {
        facePresentRef.current = true;
        // start full-frame capture every captureInterval
        if (!intervalRef.current) {
          // eslint-disable-next-line react-hooks/immutability
          intervalRef.current = window.setInterval(captureFullFrame, captureInterval);
        }
      } else if (!found && facePresentRef.current) {
        facePresentRef.current = false;
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      console.warn('Face detection error in loop:', err);
    }
  }, [captureFullFrame, captureInterval]);

  useEffect(() => {
    const DETECTION_INTERVAL_MS = 700;
    // If we have a native detector, run detect loop frequently; otherwise fall back to regular captures
    if (isStreaming && isMonitoring && onFrameCapture) {
      if (faceDetectorRef.current) {
        // start detect loop
        if (!detectionIntervalRef.current) {
          // eslint-disable-next-line react-hooks/immutability
          detectionIntervalRef.current = window.setInterval(detectLoop, DETECTION_INTERVAL_MS);
        }
      } else {
        // fallback: capture at the configured captureInterval
        if (!intervalRef.current) {
          intervalRef.current = window.setInterval(captureFullFrame, captureInterval);
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isStreaming, isMonitoring, onFrameCapture, detectLoop, captureFullFrame, captureInterval]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (isMonitoring && !isStreaming) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void startCamera();
    }
  }, [isMonitoring, isStreaming, startCamera]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  useEffect(() => {
    if (isStreaming) {
      const timer = window.setTimeout(() => {
        stopCamera();
        void startCamera();
      }, 0);

      return () => window.clearTimeout(timer);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  return (
    <div className="space-y-5">
      <div className={`camera-container ${isMonitoring ? 'monitoring' : ''}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            display: isStreaming ? 'block' : 'none',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.48)_100%)]" />

        {isStreaming && isMonitoring && (
          <>
            <div className="scan-line" />
            <div className="pointer-events-none absolute inset-8 border border-violet-300/15" />
            <div className="pointer-events-none absolute left-8 top-8 h-16 w-16 border-l-2 border-t-2 border-violet-200/70" />
            <div className="pointer-events-none absolute right-8 top-8 h-16 w-16 border-r-2 border-t-2 border-violet-200/70" />
            <div className="pointer-events-none absolute bottom-8 left-8 h-16 w-16 border-b-2 border-l-2 border-violet-200/70" />
            <div className="pointer-events-none absolute bottom-8 right-8 h-16 w-16 border-b-2 border-r-2 border-violet-200/70" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/20" />
          </>
        )}

        {isStreaming && (
          <div className="absolute left-5 top-5 flex flex-wrap items-center gap-3">
            <div className={`status-badge ${isMonitoring ? 'border-violet-300/40 text-violet-200' : 'border-emerald-300/40 text-emerald-200'}`}>
              <span className={`live-dot ${isMonitoring ? 'text-violet-300' : 'text-emerald-300'}`} />
              {isMonitoring ? 'AI scanning active' : 'Live feed'}
            </div>
            <div className="status-badge border-white/10 text-slate-300">
              {facingMode === 'user' ? 'Front camera' : 'Environment camera'}
            </div>
          </div>
        )}

        {isStreaming && (
          <div className="absolute right-5 top-5 flex items-center gap-2">
            <button
              type="button"
              onClick={captureFullFrame}
              className="btn-ghost min-h-0 bg-black/35 px-3 py-3"
              title="Manual capture"
            >
              <ScanFace className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={toggleCamera}
              className="btn-ghost min-h-0 bg-black/35 px-3 py-3"
              title="Switch camera"
            >
              <SwitchCamera className="h-5 w-5" />
            </button>
          </div>
        )}

        {!isStreaming && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <motion.div
              animate={{ scale: [1, 1.04, 1], opacity: [0.86, 1, 0.86] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-7 grid h-24 w-24 place-items-center rounded-md border border-white/10 bg-white/[0.04]"
            >
              <Camera className="h-9 w-9 text-slate-400" />
            </motion.div>
            <h2 className="text-card-title text-white">Camera feed offline</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
              Initialize the browser camera connection to begin live surveillance monitoring.
            </p>
            <button type="button" onClick={startCamera} className="glow-btn mt-8">
              <Wifi className="h-4 w-4" />
              Initialize Connection
            </button>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <div className="mb-7 grid h-24 w-24 place-items-center rounded-md border border-red-400/20 bg-red-500/10">
              <CameraOff className="h-9 w-9 text-red-300" />
            </div>
            <h2 className="text-card-title text-red-200">Connection failed</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">{error}</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={detCanvasRef} className="hidden" />

      {isStreaming && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Maximize className="h-4 w-4" />
            <span>Stream online</span>
          </div>
          <button
            type="button"
            onClick={stopCamera}
            className="btn-ghost hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
          >
            <WifiOff className="h-4 w-4" />
            Disconnect Feed
          </button>
        </div>
      )}
    </div>
  );
}
