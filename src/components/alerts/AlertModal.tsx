'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock, Camera, ShieldAlert, Target } from 'lucide-react';
import Image from 'next/image';
import { formatConfidence } from '@/lib/utils';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchData: {
    personName: string;
    confidence: number;
    capturedImage: string;
    timestamp: string;
    personPhoto?: string;
  } | null;
  onSaveDetection?: () => void;
}

export default function AlertModal({ isOpen, onClose, matchData, onSaveDetection }: AlertModalProps) {
  if (!matchData) return null;

  // Determine threat level based on confidence
  const isHighConfidence = matchData.confidence >= 0.8;
  const isMediumConfidence = matchData.confidence >= 0.6 && matchData.confidence < 0.8;
  
  const themeColor = isHighConfidence ? 'rgba(239, 68, 68' : (isMediumConfidence ? 'rgba(245, 158, 11' : 'rgba(56, 189, 248');
  const hexColor = isHighConfidence ? '#ef4444' : (isMediumConfidence ? '#f59e0b' : '#38bdf8');
  const alertText = isHighConfidence ? 'CRITICAL MATCH' : (isMediumConfidence ? 'POTENTIAL MATCH' : 'LOW CONFIDENCE MATCH');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
            style={{ 
              background: 'rgba(0, 0, 0, 0.85)', 
              backdropFilter: 'blur(8px) saturate(150%)',
              WebkitBackdropFilter: 'blur(8px) saturate(150%)'
            }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="w-full max-w-2xl relative overflow-hidden rounded-[32px]" style={{
              background: 'rgba(11, 11, 17, 0.95)',
              border: `1px solid ${themeColor}, 0.3)`,
              boxShadow: `0 0 80px ${themeColor}, 0.15), inset 0 0 40px ${themeColor}, 0.05)`,
            }}>
              
              {/* Animated Glow Background */}
              <div 
                className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px]"
                style={{ background: `${themeColor}, 0.3)` }}
              />
              <div 
                className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-[80px]"
                style={{ background: `${themeColor}, 0.2)` }}
              />

              {/* Header */}
              <div className="relative px-8 pt-8 pb-6 border-b" style={{
                background: `linear-gradient(180deg, ${themeColor}, 0.1), transparent)`,
                borderColor: 'rgba(255,255,255,0.05)'
              }}>
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full transition-all hover:bg-white/10"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="p-4 rounded-2xl flex-shrink-0 relative"
                    style={{ background: `${themeColor}, 0.15)` }}
                  >
                    <div className="absolute inset-0 rounded-2xl animate-ping opacity-50" style={{ border: `1px solid ${hexColor}` }}></div>
                    <ShieldAlert className="w-8 h-8 relative z-10" style={{ color: hexColor }} />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight" style={{ color: hexColor }}>{alertText}</h3>
                    <p className="text-sm font-medium tracking-wide uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
                      Automated System Alert
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6 relative z-10">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Target Info */}
                  <div className="space-y-6">
                    {/* Person Info Card */}
                    <div className="glass-card-subtle p-5 rounded-2xl flex items-center gap-4 border border-white/5 bg-white/5">
                      {matchData.personPhoto ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-inner flex-shrink-0" style={{ border: `2px solid ${themeColor}, 0.5)` }}>
                          <Image
                            src={matchData.personPhoto}
                            alt={matchData.personName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Target className="w-8 h-8 text-white/30" />
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Identified Target</p>
                        <p className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          {matchData.personName}
                        </p>
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="glass-card-subtle p-5 rounded-2xl border border-white/5 bg-white/5">
                      <div className="flex items-end justify-between mb-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>
                          Similarity Score
                        </span>
                        <span className="text-3xl font-black font-mono leading-none" style={{ color: hexColor }}>
                          {formatConfidence(matchData.confidence)}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-black/50 overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${matchData.confidence * 100}%` }}
                          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${themeColor}, 0.5), ${hexColor})`,
                            boxShadow: `0 0 10px ${hexColor}`
                          }}
                        />
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-card-subtle p-4 rounded-xl border border-white/5 bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                          <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>Time</p>
                        </div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {new Date(matchData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                        </p>
                      </div>
                      <div className="glass-card-subtle p-4 rounded-xl border border-white/5 bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                          <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>Source</p>
                        </div>
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          CAM_MAIN_01
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Captured Evidence */}
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <Target className="w-3 h-3" />
                        Captured Evidence
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: hexColor }}>REC_ACTIVE</span>
                    </div>
                    {matchData.capturedImage ? (
                      <div className="relative flex-1 rounded-2xl overflow-hidden border" style={{ borderColor: `${themeColor}, 0.3)`, minHeight: '200px' }}>
                        <Image
                          src={matchData.capturedImage}
                          alt="Captured evidence frame"
                          fill
                          className="object-cover"
                        />
                        {/* Surveillance overlay */}
                        <div className="absolute inset-0 border-[4px] opacity-30 pointer-events-none" style={{ borderColor: hexColor }}></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-dashed rounded-full pointer-events-none" style={{ borderColor: hexColor }}></div>
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-mono text-white/80">
                          {new Date(matchData.timestamp).toISOString()}
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: hexColor }}></div>
                          <span className="text-[10px] font-mono" style={{ color: hexColor }}>LIVE_CAP</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-center min-h-[200px]">
                        <p className="text-sm text-white/30 font-mono">NO_EVIDENCE_AVAILABLE</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-white/5 mt-6">
                  <button 
                    onClick={onSaveDetection} 
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${hexColor}, ${themeColor}, 0.8))`,
                      color: 'white',
                      boxShadow: `0 8px 30px ${themeColor}, 0.3)`,
                    }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    LOG & CONFIRM DETECTION
                  </button>
                  <button 
                    onClick={onClose} 
                    className="px-8 py-4 rounded-xl font-bold text-sm tracking-wide transition-all btn-ghost"
                  >
                    DISMISS
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
