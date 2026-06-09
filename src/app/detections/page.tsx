'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Search,
  Filter,
  Clock,
  Eye,
  X,
  ScanSearch,
  CheckCircle,
  XCircle,
  Camera,
} from 'lucide-react';
import Image from 'next/image';
import { formatDate, formatConfidence, getConfidenceColor } from '@/lib/utils';

interface DetectionItem {
  _id: string;
  personId: {
    _id: string;
    name: string;
    age: number;
    gender: string;
    photoUrl: string;
    status: string;
  } | null;
  confidenceScore: number;
  capturedImage: string;
  timestamp: string;
  verified: boolean;
  cameraSource: string;
}

export default function DetectionsPage() {
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchDetections = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterVerified !== 'all') {
        params.set('verified', filterVerified);
      }
      const res = await fetch(`/api/detections?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDetections(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch detections:', error);
    } finally {
      setLoading(false);
    }
  }, [filterVerified]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchDetections();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchDetections]);

  const filteredDetections = detections.filter((d) => {
    if (!searchQuery) return true;
    const name = d.personId?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="section-spacing">
        <div className="container-main space-y-6">
          <div className="skeleton h-16 w-80 mb-10" />
          <div className="skeleton h-20 rounded-2xl mb-8" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      <div className="container-main max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl shadow-inner" style={{ 
              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(196, 181, 253, 0.05))',
              border: '1px solid rgba(167, 139, 250, 0.2)' 
            }}>
              <ClipboardList className="w-8 h-8" style={{ color: '#c4b5fd' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-overline tracking-widest" style={{ color: '#c4b5fd' }}>System Logs</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Detection History
              </h1>
            </div>
          </div>
          <div className="glass-card-subtle px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: '#c4b5fd' }}>{filteredDetections.length}</span>
            <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Total Records
            </span>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-card p-6 mb-8 flex flex-col sm:flex-row gap-5 items-center card-accent-top"
        >
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: searchQuery ? '#a78bfa' : 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search detection logs by subject name..."
              className="glass-input pl-12 text-base py-3.5 bg-white/5 border-white/10 focus:bg-white/10 focus:border-indigo-400"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Filter className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="glass-select w-full sm:w-48 py-3.5 text-base bg-white/5 border-white/10 focus:bg-white/10 focus:border-indigo-400"
            >
              <option value="all">All Statuses</option>
              <option value="true">Verified Hits</option>
              <option value="false">Pending Verification</option>
            </select>
          </div>
        </motion.div>

        {/* Detection List */}
        {filteredDetections.length > 0 ? (
          <div className="space-y-4">
            {filteredDetections.map((detection, index) => (
              <motion.div
                key={detection._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.05) }}
                className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:bg-white/5 transition-colors"
              >
                {/* Person Photo */}
                <div
                  className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer border-2 border-white/10 group-hover:border-indigo-500/50 transition-colors shadow-lg"
                  onClick={() => setSelectedImage(detection.personId?.photoUrl || null)}
                >
                  {detection.personId?.photoUrl ? (
                    <>
                      <Image
                        src={detection.personId.photoUrl}
                        alt={detection.personId?.name || 'Person'}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-500/10">
                      <ScanSearch className="w-8 h-8 text-indigo-400/50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-xl font-bold tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                      {detection.personId?.name || 'Unknown Subject'}
                    </p>
                    {detection.verified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        <XCircle className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 mt-2">
                    <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Clock className="w-4 h-4 text-indigo-400" />
                      {formatDate(detection.timestamp)}
                    </span>
                    <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span className="uppercase tracking-wider text-xs">SOURCE: {detection.cameraSource || 'SYS_CAM_01'}</span>
                    </span>
                  </div>
                </div>

                {/* Confidence & Actions */}
                <div className="flex items-center gap-6 sm:pl-6 sm:border-l border-white/10 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0">
                  <div className="flex-1 sm:flex-none text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Match Score</p>
                    <p className={`text-3xl font-black font-mono leading-none ${getConfidenceColor(detection.confidenceScore)}`}>
                      {formatConfidence(detection.confidenceScore)}
                    </p>
                    <div className="confidence-meter w-full sm:w-24 mt-2 h-1.5">
                      <div
                        className="confidence-meter-fill"
                        style={{
                          width: `${detection.confidenceScore * 100}%`,
                          background: detection.confidenceScore >= 0.8
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : detection.confidenceScore >= 0.6
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                        }}
                      />
                    </div>
                  </div>

                  {/* View captured image */}
                  {detection.capturedImage && (
                    <button
                      onClick={() => setSelectedImage(detection.capturedImage)}
                      className="p-4 rounded-xl transition-all hover:scale-105 flex-shrink-0 border border-white/10 shadow-lg group-hover:border-indigo-500/30"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', color: 'var(--text-primary)' }}
                      title="View captured evidence"
                    >
                      <Eye className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-20 text-center flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <ScanSearch className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              No Records Found
            </h3>
            <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              {searchQuery ? 'We couldn\'t find any detections matching your search criteria. Try adjusting your filters.' : 'The system hasn\'t recorded any matches yet. Start monitoring a camera feed to begin detection.'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Premium Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]"
              style={{ background: 'rgba(6, 6, 11, 0.95)', backdropFilter: 'blur(12px)' }}
              onClick={() => setSelectedImage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-8"
              onClick={() => setSelectedImage(null)}
            >
              <div 
                className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center pointer-events-none">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10">
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono text-white/80 uppercase tracking-wider">Evidence Frame</span>
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors pointer-events-auto text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <Image
                  src={selectedImage}
                  alt="Detection Evidence"
                  width={1280}
                  height={720}
                  className="w-full h-auto max-h-[80vh] object-contain bg-black"
                />
                
                {/* Surveillance UI overlay for modal */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl"></div>
                  <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr"></div>
                  <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl"></div>
                  <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br"></div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
