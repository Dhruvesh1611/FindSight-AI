'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Users,
  Activity,
  AlertTriangle,
  Clock,
  Scan,
  Zap,
  ShieldAlert,
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
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 30%)`;
          ctx.fillRect(0, 0, 1280, 720);
          // Add some text
          ctx.fillStyle = '#ffffff';
          ctx.font = '24px Inter, sans-serif';
          ctx.fillText('Demo Surveillance Frame - ' + new Date().toLocaleTimeString(), 40, 60);
          
          // Draw a face box
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 4;
          ctx.strokeRect(500, 200, 280, 320);
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

        toast.error('CRITICAL MATCH', {
          description: `${randomPerson.name} detected with ${formatConfidence(confidence)} confidence`,
          duration: 8000,
          style: {
            background: 'rgba(153, 27, 27, 0.9)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
          }
        });
      }, 6000 + Math.random() * 4000);

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

          toast.error('CRITICAL MATCH', {
            description: `${result.person_name || 'Person'} detected with ${formatConfidence(result.confidence)} confidence`,
            duration: 8000,
            style: {
              background: 'rgba(153, 27, 27, 0.9)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
            }
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
        toast.success('Detection logged in database');
        setShowAlert(false);
      } else {
        toast.error('Failed to log detection');
      }
    } catch {
      toast.error('Error logging detection');
    }
  };

  return (
    <div className="section-spacing">
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl shadow-inner" style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.05))',
              border: '1px solid rgba(16, 185, 129, 0.2)' 
            }}>
              <ShieldAlert className="w-8 h-8" style={{ color: '#34d399' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-overline tracking-widest text-emerald-400">Command Center</span>
                <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-emerald-500 live-dot' : 'bg-gray-500'}`}></span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Surveillance Terminal
              </h1>
            </div>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsDemoMode(!isDemoMode)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all"
              style={{
                background: isDemoMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: isDemoMode ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: isDemoMode ? '#fcd34d' : 'var(--text-secondary)',
              }}
              title="Toggle demo mode for simulated detections"
            >
              <Zap className="w-4 h-4" />
              <span>SIMULATE</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold tracking-wide transition-all shadow-lg ${
                isMonitoring 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 shadow-red-500/20' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30 shadow-emerald-500/20'
              }`}
            >
              {isMonitoring ? (
                <>
                  <ShieldAlert className="w-5 h-5" />
                  HALT SCAN
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5" />
                  INITIATE SCAN
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed Area (8 columns) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="glass-card p-2 rounded-[28px] card-accent-top">
              <CameraFeed
                onFrameCapture={isDemoMode ? undefined : handleFrameCapture}
                captureInterval={2000} // Faster capture rate for more responsive feel
                isMonitoring={isMonitoring}
              />
            </div>

            {/* System Status Banner */}
            <AnimatePresence mode="wait">
              {isDemoMode && isMonitoring ? (
                <motion.div
                  key="demo"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-5 rounded-2xl flex items-center gap-4 shadow-lg"
                  style={{
                    background: 'linear-gradient(90deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.02))',
                    borderLeft: '4px solid #fbbf24',
                    borderTop: '1px solid rgba(251, 191, 36, 0.2)',
                    borderRight: '1px solid rgba(251, 191, 36, 0.1)',
                    borderBottom: '1px solid rgba(251, 191, 36, 0.1)',
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="p-2 bg-amber-500/20 rounded-lg"
                  >
                    <Zap className="w-6 h-6 text-amber-400" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-amber-400 uppercase tracking-widest text-sm mb-1">Simulation Mode Active</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Generating synthetic frame data and injecting mock face encodings for demonstration.
                    </p>
                  </div>
                </motion.div>
              ) : isProcessing && !isDemoMode ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-5 rounded-2xl flex items-center gap-4"
                  style={{
                    background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.1), rgba(124, 58, 237, 0.02))',
                    borderLeft: '4px solid #7c3aed',
                    borderTop: '1px solid rgba(124, 58, 237, 0.2)',
                    borderRight: '1px solid rgba(124, 58, 237, 0.1)',
                    borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  >
                    <Scan className="w-6 h-6" style={{ color: '#a78bfa' }} />
                  </motion.div>
                  <div>
                    <h3 className="font-bold uppercase tracking-widest text-sm mb-1" style={{ color: '#c4b5fd' }}>Neural Analysis</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Extracting facial embeddings from current frame and computing cosine similarity against active case database...
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Intel Sidebar (4 columns) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Telemetry Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 card-accent-top"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Activity className="w-4 h-4" style={{ color: '#a78bfa' }} />
                Session Telemetry
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass-card-subtle p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Frames Analyzed</p>
                  <p className="text-3xl font-bold font-mono" style={{ color: '#c4b5fd' }}>{String(frameCount).padStart(4, '0')}</p>
                </div>
                <div className="glass-card-subtle p-4 rounded-xl relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${matchCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Matches</p>
                  <p className="text-3xl font-bold font-mono" style={{ color: matchCount > 0 ? '#fca5a5' : '#6ee7b7' }}>
                    {String(matchCount).padStart(2, '0')}
                  </p>
                </div>
              </div>

              {/* Last Match Status */}
              <div className="mt-4 border-t border-white/5 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Latest Vector Result
                </p>
                
                {lastMatch ? (
                  <div className={`p-4 rounded-xl border ${lastMatch.matched ? 'bg-red-500/10 border-red-500/30' : 'glass-card-subtle'}`}>
                    {lastMatch.matched ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-sm font-bold text-red-400">POSITIVE HIT</p>
                            <p className="text-xs text-red-400/70">{lastMatch.person_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold font-mono ${getConfidenceColor(lastMatch.confidence)}`}>
                            {formatConfidence(lastMatch.confidence)}
                          </p>
                          <p className="text-[10px] uppercase text-red-400/50 tracking-wider">Confidence</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Scan className="w-5 h-5 text-emerald-400/50" />
                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {lastMatch.message || 'No vectors crossed threshold'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="glass-card-subtle p-4 rounded-xl flex items-center justify-center h-20">
                    <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>Awaiting first detection cycle</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Target Database */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card flex flex-col overflow-hidden"
              style={{ maxHeight: '400px' }}
            >
              <div className="p-6 pb-4 border-b border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <Users className="w-4 h-4" style={{ color: '#fbbf24' }} />
                  Target Database
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-white/10 text-xs text-white">
                    {activePersons.length}
                  </span>
                </h3>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                {activePersons.length > 0 ? (
                  <div className="space-y-3">
                    {activePersons.map((person) => (
                      <div
                        key={person._id}
                        className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-white/10 transition-colors bg-white/5"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                          <Image
                            src={person.photoUrl}
                            alt={person.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {person.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10" style={{ color: 'var(--text-muted)' }}>
                              ID: {person._id.substring(person._id.length - 6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Database empty
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Register cases to begin matching
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Frame Buffer */}
            {lastCapturedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Camera className="w-3.5 h-3.5" />
                    Frame Buffer
                  </p>
                  <span className="text-[10px] font-mono text-indigo-400">MEM_0x{Math.floor(Math.random() * 10000).toString(16).toUpperCase()}</span>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video">
                  <Image
                    src={lastCapturedImage}
                    alt="Last captured"
                    fill
                    className="object-cover"
                  />
                  {/* Digital overlay grid */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-30 pointer-events-none"></div>
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
