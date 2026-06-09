'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Camera,
  Clock,
  Cpu,
  Database,
  Gauge,
  Image as ImageIcon,
  Play,
  Scan,
  ShieldAlert,
  Square,
  Users,
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
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchResult | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [activePersons, setActivePersons] = useState<ActivePerson[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertData, setAlertData] = useState<{
    personName: string;
    confidence: number;
    capturedImage: string;
    timestamp: string;
    personPhoto?: string;
  } | null>(null);

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

    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }

    if (isDemoMode && isMonitoring && activePersons.length > 0) {
      const interval = setInterval(async () => {
        const randomPerson = activePersons[Math.floor(Math.random() * activePersons.length)];
        const confidence = 0.80 + Math.random() * 0.19;

        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 30%)`;
          ctx.fillRect(0, 0, 1280, 720);
          ctx.fillStyle = '#ffffff';
          ctx.font = '24px Inter, sans-serif';
          ctx.fillText('Demo Surveillance Frame - ' + new Date().toLocaleTimeString(), 40, 60);
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
          },
        });
      }, 6000 + Math.random() * 4000);

      demoIntervalRef.current = interval;
    }

    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
    };
  }, [isDemoMode, isMonitoring, activePersons]);

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
            },
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

  const confidence = lastMatch?.confidence || 0;
  const confidenceStyle = { '--value': `${confidence * 100}%` } as CSSProperties;
  const statusLabel = isMonitoring ? (isProcessing ? 'Analyzing frame' : 'Live monitoring') : 'Standby';

  return (
    <div className="page-shell">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="page-header"
        >
          <div className="page-title-group">
            <div className="page-icon">
              <ShieldAlert className="h-7 w-7 text-emerald-200" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="eyebrow text-emerald-200">Command Center</span>
                <span className={`live-dot ${isMonitoring ? 'text-emerald-300' : 'text-slate-500'}`} />
              </div>
              <h1 className="text-page-title text-white">Surveillance Monitor</h1>
              <p className="mt-3 max-w-2xl text-body">
                Watch the live camera feed, track detection confidence, and review matching activity in real time.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`btn-ghost ${isDemoMode ? 'border-amber-300/30 bg-amber-500/10 text-amber-200' : ''}`}
              title="Toggle demo mode for simulated detections"
            >
              <Zap className="h-4 w-4" />
              Simulation
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={isMonitoring ? 'glow-btn glow-btn-danger' : 'glow-btn glow-btn-success'}
            >
              {isMonitoring ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop Scan
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Scan
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        <div className="monitor-grid">
          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="glass-card-static card-accent-top p-2"
            >
              <CameraFeed
                onFrameCapture={isDemoMode ? undefined : handleFrameCapture}
                captureInterval={2000}
                isMonitoring={isMonitoring}
              />
            </motion.section>

            <AnimatePresence mode="wait">
              {isDemoMode && isMonitoring ? (
                <motion.div
                  key="demo"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card-static flex items-start gap-4 border-amber-300/20 bg-amber-500/10 p-5"
                >
                  <div className="feature-icon mb-0 h-11 w-11 border-amber-300/20 bg-amber-500/10">
                    <Zap className="h-5 w-5 text-amber-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-100">Simulation mode active</h3>
                    <p className="mt-1 text-sm leading-6 text-amber-100/70">
                      Synthetic frame matches are being generated from active profiles for demonstration.
                    </p>
                  </div>
                </motion.div>
              ) : isProcessing && !isDemoMode ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card-static flex items-start gap-4 border-violet-300/20 bg-violet-500/10 p-5"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                    className="feature-icon mb-0 h-11 w-11 border-violet-300/20 bg-violet-500/10"
                  >
                    <Scan className="h-5 w-5 text-violet-200" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-violet-100">Neural analysis running</h3>
                    <p className="mt-1 text-sm leading-6 text-violet-100/70">
                      Current frame is being compared against active case embeddings.
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <aside className="space-y-6">
            <motion.section
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.5, ease: 'easeOut' }}
              className="glass-card-static monitor-panel card-accent-top"
            >
              <div className="panel-title-row">
                <div className="flex items-center gap-3">
                  <div className="feature-icon mb-0 h-11 w-11">
                    <Gauge className="h-5 w-5 text-violet-200" />
                  </div>
                  <div>
                    <h2 className="text-card-title text-white">Live Status</h2>
                    <p className="mt-1 text-sm text-slate-500">{statusLabel}</p>
                  </div>
                </div>
                <span className={`status-badge ${isMonitoring ? 'border-emerald-300/30 text-emerald-200' : 'border-white/10 text-slate-400'}`}>
                  <span className={`live-dot ${isMonitoring ? 'text-emerald-300' : 'text-slate-500'}`} />
                  {isMonitoring ? 'Online' : 'Idle'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
                <div className="confidence-ring" style={confidenceStyle}>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${lastMatch ? getConfidenceColor(confidence) : 'text-slate-500'}`}>
                      {formatConfidence(confidence)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">confidence</div>
                  </div>
                </div>
                <div className="w-full flex-1">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-300">Match confidence</span>
                    <span className={lastMatch ? getConfidenceColor(confidence) : 'text-slate-500'}>
                      {lastMatch ? formatConfidence(confidence) : 'No signal'}
                    </span>
                  </div>
                  <div className="confidence-meter">
                    <div
                      className="confidence-meter-fill"
                      style={{
                        width: `${confidence * 100}%`,
                        background: confidence >= 0.8
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : confidence >= 0.6
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                      }}
                    />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="glass-card-subtle p-4">
                      <div className="text-3xl font-bold text-white">{String(frameCount).padStart(4, '0')}</div>
                      <div className="mt-1 text-sm text-slate-500">Frames</div>
                    </div>
                    <div className="glass-card-subtle p-4">
                      <div className={`text-3xl font-bold ${matchCount > 0 ? 'text-rose-200' : 'text-emerald-200'}`}>
                        {String(matchCount).padStart(2, '0')}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">Matches</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.14, duration: 0.5, ease: 'easeOut' }}
              className="glass-card-static monitor-panel card-accent-top"
            >
              <div className="panel-title-row">
                <div className="flex items-center gap-3">
                  <div className="feature-icon mb-0 h-11 w-11">
                    <Activity className="h-5 w-5 text-cyan-200" />
                  </div>
                  <div>
                    <h2 className="text-card-title text-white">Detection Activity</h2>
                    <p className="mt-1 text-sm text-slate-500">Latest vector result.</p>
                  </div>
                </div>
              </div>

              {lastMatch ? (
                <div className={`rounded-md border p-4 ${lastMatch.matched ? 'border-rose-300/25 bg-rose-500/10' : 'border-white/[0.08] bg-white/[0.03]'}`}>
                  {lastMatch.matched ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="feature-icon mb-0 h-11 w-11 border-rose-300/20 bg-rose-500/10">
                          <AlertTriangle className="h-5 w-5 text-rose-200" />
                        </div>
                        <div>
                          <p className="font-bold text-rose-100">Positive hit</p>
                          <p className="mt-1 text-sm text-rose-100/70">{lastMatch.person_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${getConfidenceColor(lastMatch.confidence)}`}>
                          {formatConfidence(lastMatch.confidence)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">confidence</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="feature-icon mb-0 h-11 w-11">
                        <Scan className="h-5 w-5 text-emerald-200" />
                      </div>
                      <p className="text-sm leading-6 text-slate-300">
                        {lastMatch.message || 'No vectors crossed threshold'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-card-subtle flex min-h-24 items-center justify-center p-4 text-center">
                  <p className="text-sm text-slate-500">Awaiting first detection cycle.</p>
                </div>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
              className="glass-card-static card-accent-top overflow-hidden"
            >
              <div className="border-b border-white/[0.06] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="feature-icon mb-0 h-10 w-10">
                      <Database className="h-5 w-5 text-amber-200" />
                    </div>
                    <div>
                      <h2 className="text-card-title text-white">Monitoring Panel</h2>
                      <p className="mt-1 text-sm text-slate-500">Active search profiles.</p>
                    </div>
                  </div>
                  <span className="status-badge border-white/10 text-slate-300">{activePersons.length} active</span>
                </div>
              </div>

              <div className="max-h-[360px] overflow-y-auto p-4">
                {activePersons.length > 0 ? (
                  <div className="space-y-3">
                    {activePersons.map((person) => (
                      <div key={person._id} className="glass-card-subtle flex items-center gap-4 p-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-white/10">
                          <Image src={person.photoUrl} alt={person.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{person.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            ID {person._id.substring(person._id.length - 6).toUpperCase()}
                          </p>
                        </div>
                        <span className="live-dot text-emerald-300" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-44 flex-col items-center justify-center text-center">
                    <Users className="mb-4 h-10 w-10 text-slate-600" />
                    <p className="font-semibold text-slate-300">No active profiles</p>
                    <p className="mt-2 text-sm text-slate-500">Register cases to begin matching.</p>
                  </div>
                )}
              </div>
            </motion.section>

            {lastCapturedImage && (
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card-static monitor-panel card-accent-top"
              >
                <div className="panel-title-row">
                  <div className="flex items-center gap-3">
                    <div className="feature-icon mb-0 h-10 w-10">
                      <ImageIcon className="h-5 w-5 text-violet-200" />
                    </div>
                    <div>
                      <h2 className="text-card-title text-white">Frame Buffer</h2>
                      <p className="mt-1 text-sm text-slate-500">Latest captured frame.</p>
                    </div>
                  </div>
                  <Clock className="h-4 w-4 text-slate-500" />
                </div>
                <div className="relative aspect-video overflow-hidden rounded-md border border-white/10">
                  <Image src={lastCapturedImage} alt="Last captured frame" fill className="object-cover" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
                </div>
              </motion.section>
            )}

            <motion.section
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.26, duration: 0.5, ease: 'easeOut' }}
              className="glass-card-static monitor-panel"
            >
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="glass-card-subtle p-3">
                  <Cpu className="mx-auto mb-2 h-4 w-4 text-violet-200" />
                  <p className="text-xs text-slate-500">Model</p>
                  <p className="mt-1 text-sm font-bold text-white">Face AI</p>
                </div>
                <div className="glass-card-subtle p-3">
                  <Camera className="mx-auto mb-2 h-4 w-4 text-emerald-200" />
                  <p className="text-xs text-slate-500">Source</p>
                  <p className="mt-1 text-sm font-bold text-white">Browser</p>
                </div>
                <div className="glass-card-subtle p-3">
                  <Scan className="mx-auto mb-2 h-4 w-4 text-cyan-200" />
                  <p className="text-xs text-slate-500">Interval</p>
                  <p className="mt-1 text-sm font-bold text-white">2s</p>
                </div>
              </div>
            </motion.section>
          </aside>
        </div>
      </div>

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        matchData={alertData}
        onSaveDetection={handleSaveDetection}
      />
    </div>
  );
}
