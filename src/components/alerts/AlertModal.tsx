'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CheckCircle, Clock, Camera } from 'lucide-react';
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
            style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md glass-card overflow-hidden" style={{
              background: 'rgba(26, 26, 46, 0.95)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 0 60px rgba(239, 68, 68, 0.2)',
            }}>
              {/* Header */}
              <div className="relative p-6 pb-4" style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
              }}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    <AlertTriangle className="w-7 h-7 text-red-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-red-400">MATCH FOUND</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Potential missing person detected
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Person Info */}
                <div className="flex items-center gap-4">
                  {matchData.personPhoto && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-red-400/30">
                      <Image
                        src={matchData.personPhoto}
                        alt={matchData.personName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {matchData.personName}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Missing Person Match
                    </p>
                  </div>
                </div>

                {/* Confidence */}
                <div className="glass-card p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Match Confidence
                    </span>
                    <span className="text-2xl font-bold" style={{
                      color: matchData.confidence >= 0.8 ? '#34d399' : matchData.confidence >= 0.6 ? '#fbbf24' : '#f87171'
                    }}>
                      {formatConfidence(matchData.confidence)}
                    </span>
                  </div>
                  <div className="confidence-meter">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${matchData.confidence * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="confidence-meter-fill"
                      style={{
                        background: matchData.confidence >= 0.8
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : matchData.confidence >= 0.6
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #ef4444, #f87171)',
                      }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Time</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {new Date(matchData.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="glass-card p-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <Camera className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Source</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Browser Cam
                      </p>
                    </div>
                  </div>
                </div>

                {/* Captured Image */}
                {matchData.capturedImage && (
                  <div className="relative rounded-xl overflow-hidden border border-white/5">
                    <Image
                      src={matchData.capturedImage}
                      alt="Captured frame"
                      width={400}
                      height={300}
                      className="w-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(0,0,0,0.7)', color: '#f87171' }}>
                      📸 Captured Frame
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={onSaveDetection} className="glow-btn-success glow-btn flex-1 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Save Detection
                  </button>
                  <button onClick={onClose} className="glow-btn flex-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Dismiss
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
