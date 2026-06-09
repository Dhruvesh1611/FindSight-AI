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
    fetchDetections();
  }, [fetchDetections]);

  const filteredDetections = detections.filter((d) => {
    if (!searchQuery) return true;
    const name = d.personId?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="skeleton h-10 w-64 mb-8" />
          <div className="skeleton h-12 rounded-xl mb-6" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

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
            <div className="p-3 rounded-xl" style={{ background: 'rgba(167, 139, 250, 0.15)' }}>
              <ClipboardList className="w-7 h-7" style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Detection History
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {filteredDetections.length} detection{filteredDetections.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by person name..."
              className="glass-input pl-11"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="glass-select w-40"
            >
              <option value="all">All Status</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </motion.div>

        {/* Detection List */}
        {filteredDetections.length > 0 ? (
          <div className="space-y-3">
            {filteredDetections.map((detection, index) => (
              <motion.div
                key={detection._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                {/* Person Photo */}
                <div
                  className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  onClick={() => setSelectedImage(detection.personId?.photoUrl || null)}
                >
                  {detection.personId?.photoUrl ? (
                    <Image
                      src={detection.personId.photoUrl}
                      alt={detection.personId?.name || 'Person'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                      <ScanSearch className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {detection.personId?.name || 'Unknown Person'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Clock className="w-3 h-3" />
                      {formatDate(detection.timestamp)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      📷 {detection.cameraSource || 'browser-camera'}
                    </span>
                  </div>
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-xl font-bold ${getConfidenceColor(detection.confidenceScore)}`}>
                      {formatConfidence(detection.confidenceScore)}
                    </p>
                    <div className="confidence-meter w-20 mt-1">
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

                  {/* Verified badge */}
                  <div className="flex-shrink-0">
                    {detection.verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <XCircle className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>

                  {/* View captured image */}
                  {detection.capturedImage && (
                    <button
                      onClick={() => setSelectedImage(detection.capturedImage)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
                      title="View captured image"
                    >
                      <Eye className="w-4 h-4" />
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
            className="glass-card p-16 text-center"
          >
            <ScanSearch className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              No Detections Found
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {searchQuery ? 'Try adjusting your search query' : 'Start monitoring to begin detecting matches'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]"
              style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSelectedImage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className="relative max-w-2xl w-full">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 p-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Image
                    src={selectedImage}
                    alt="Preview"
                    width={800}
                    height={600}
                    className="w-full object-contain"
                    style={{ maxHeight: '70vh' }}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
