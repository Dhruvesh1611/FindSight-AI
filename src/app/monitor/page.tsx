'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Shield,
  Users,
  Activity,
  AlertTriangle,
  Clock,
  Scan,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import CameraFeed from '@/components/camera/CameraFeed';
import AlertModal from '@/components/alerts/AlertModal';
import { toast } from 'sonner';
import { formatConfidence, getConfidenceColor } from '@/lib/utils';

interface MatchResult {
  matched: boolean;
  confidence: number;
  person_id?: string;
  person_name?: string;
  message?: string;
}

interface ActivePerson {
  _id: string;
  name: string;
  photoUrl: string;
  age: number;
  gender: string;
}

export default function MonitorPage() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchResult | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [activePersons, setActivePersons] = useState<ActivePerson[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [demoInterval, setDemoInterval] = useState<NodeJS.Timeout | null>(null);
  const [alertData, setAlertData] = useState<{
    personName: string;
    confidence: number;
    capturedImage: string;
    timestamp: string;
    personPhoto?: string;
  } | null>(null);

  // Fetch active missing persons
  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const res = await fetch('/api/persons?status=searching');
        const data = await res.json();
        if (data.success) {
          setActivePersons(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch persons:', error);
      }
    };
    fetchPersons();

    // Cleanup demo interval on unmount
    return () => {
      if (demoInterval) clearInterval(demoInterval);
    };
  }, [demoInterval]);

  // Demo mode simulation
  useEffect(() => {
    if (isDemoMode && isMonitoring && activePersons.length > 0) {
      if (demoInterval) clearInterval(demoInterval);

      // Simulate a match every 5-8 seconds
      const interval = setInterval(async () => {
        const randomPerson = activePersons[Math.floor(Math.random() * activePersons.length)];
        const confidence = 0.80 + Math.random() * 0.19; // 0.80 - 0.99

        // Create a dummy captured image (solid color placeholder)
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 30%)`;
          ctx.fillRect(0, 0, 640, 480);
          // Add some text
          ctx.fillStyle = '#ffffff';
          ctx.font = '20px Arial';
          ctx.fillText('Demo Frame - ' + new Date().toLocaleTimeString(), 20, 50);
        }
        const dummyImage = canvas.toDataURL('image/jpeg', 0.8);

        setFrameCount((prev) => prev + 1);
        setLastCapturedImage(dummyImage);
        setMatchCount((prev) => prev + 1);

        const result: MatchResult = {
          matched: true,
          confidence,
          person_id: randomPerson._id,
          person_name: randomPerson.name,
          message: 'Demo match detected',
        };

        setLastMatch(result);
        setAlertData({
          personName: randomPerson.name,
          confidence,
          capturedImage: dummyImage,
          timestamp: new Date().toISOString(),
          personPhoto: randomPerson.photoUrl,
        });
        setShowAlert(true);

        toast.error('🚨 MATCH FOUND!', {
          description: `${randomPerson.name} detected with ${formatConfidence(confidence)} confidence (Demo)`,
          duration: 8000,
        });
      }, 5000 + Math.random() * 3000);

      setDemoInterval(interval);
    } else if (demoInterval && !isDemoMode) {
      clearInterval(demoInterval);
      setDemoInterval(null);
    }

    return () => {
      if (demoInterval) clearInterval(demoInterval);
    };
  }, [isDemoMode, isMonitoring, activePersons, demoInterval]);

  const handleFrameCapture = useCallback(async (imageData: string) => {
    if (isProcessing) return;

    setFrameCount((prev) => prev + 1);
    setLastCapturedImage(imageData);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capturedImage: imageData }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const result: MatchResult = data.data;
        setLastMatch(result);

        if (result.matched && result.confidence > 0.6) {
          setMatchCount((prev) => prev + 1);

          // Find the matched person
          const matchedPerson = activePersons.find((p) => p._id === result.person_id);

          setAlertData({
            personName: result.person_name || matchedPerson?.name || 'Unknown',
            confidence: result.confidence,
            capturedImage: imageData,
            timestamp: new Date().toISOString(),
            personPhoto: matchedPerson?.photoUrl,
          });
          setShowAlert(true);

          toast.error('🚨 MATCH FOUND!', {
            description: `${result.person_name || 'Person'} detected with ${formatConfidence(result.confidence)} confidence`,
            duration: 8000,
          });
        }
      }
    } catch (error) {
      console.error('Match error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, activePersons]);

  const handleSaveDetection = async () => {
    if (!alertData || !lastMatch?.person_id) return;

    try {
      const response = await fetch('/api/detections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId: lastMatch.person_id,
          confidenceScore: lastMatch.confidence,
          capturedImage: alertData.capturedImage,
          cameraSource: 'browser-camera',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Detection saved successfully');
        setShowAlert(false);
      } else {
        toast.error('Failed to save detection');
      }
    } catch {
      toast.error('Error saving detection');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <Camera className="w-7 h-7" style={{ color: '#34d399' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Live Monitor
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Real-time face detection and matching from camera feed
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDemoMode(!isDemoMode)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all"
              style={{
                background: isDemoMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                border: isDemoMode ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid rgba(107, 114, 128, 0.5)',
                color: isDemoMode ? '#fcd34d' : '#d1d5db',
              }}
              title="Toggle demo mode for simulated detections"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Demo Mode</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`glow-btn flex items-center gap-2 ${isMonitoring ? 'glow-btn-danger' : 'glow-btn-success'}`}
            >
              {isMonitoring ? (
                <>
                  <Shield className="w-4 h-4" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  Start Monitoring
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Feed (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <CameraFeed
              onFrameCapture={isDemoMode ? undefined : handleFrameCapture}
              captureInterval={3000}
              isMonitoring={isMonitoring}
            />

            {/* Demo Mode Indicator */}
            {isDemoMode && isMonitoring && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-4 flex items-center gap-3"
                style={{
                  borderColor: 'rgba(251, 191, 36, 0.3)',
                  background: 'rgba(251, 191, 36, 0.05)',
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap className="w-5 h-5" style={{ color: '#fbbf24' }} />
                </motion.div>
                <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>
                  Demo Mode Active — Simulating detections for presentation
                </p>
              </motion.div>
            )}

            {/* Processing Indicator */}
            {isProcessing && !isDemoMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-4 flex items-center gap-3"
                style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Scan className="w-5 h-5" style={{ color: '#818cf8' }} />
                </motion.div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Analyzing frame for face matches...
                </p>
              </motion.div>
            )}
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Monitor Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 space-y-4"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Activity className="w-5 h-5" style={{ color: '#818cf8' }} />
                Monitor Stats
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-2xl font-bold" style={{ color: '#818cf8' }}>{frameCount}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Frames</p>
                </div>
                <div className="glass-card p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-2xl font-bold" style={{ color: matchCount > 0 ? '#f87171' : '#34d399' }}>{matchCount}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Matches</p>
                </div>
              </div>

              {/* Last Match */}
              {lastMatch && (
                <div className="glass-card p-4" style={{
                  background: lastMatch.matched ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)',
                  borderColor: lastMatch.matched ? 'rgba(239, 68, 68, 0.2)' : undefined,
                }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                    Last Result
                  </p>
                  {lastMatch.matched ? (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-semibold text-red-400">Match Found</span>
                      <span className={`ml-auto text-lg font-bold ${getConfidenceColor(lastMatch.confidence)}`}>
                        {formatConfidence(lastMatch.confidence)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {lastMatch.message || 'No match detected'}
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Active Cases */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                <Users className="w-5 h-5" style={{ color: '#fbbf24' }} />
                Active Cases ({activePersons.length})
              </h3>

              {activePersons.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {activePersons.map((person) => (
                    <div
                      key={person._id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Image
                          src={person.photoUrl}
                          alt={person.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {person.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {person.age}y • {person.gender}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-yellow-400 pulse-glow flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    No active cases registered
                  </p>
                </div>
              )}
            </motion.div>

            {/* Last Captured Frame */}
            {lastCapturedImage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-4"
              >
                <p className="text-xs font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3 h-3" />
                  Last Captured Frame
                </p>
                <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Image
                    src={lastCapturedImage}
                    alt="Last captured"
                    width={300}
                    height={200}
                    className="w-full object-cover"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        matchData={alertData}
        onSaveDetection={handleSaveDetection}
      />
    </div>
  );
}
