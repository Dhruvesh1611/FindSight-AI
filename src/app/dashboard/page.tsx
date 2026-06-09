'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ScanSearch,
  Activity,
  Eye,
  Clock,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import StatsCard from '@/components/dashboard/StatsCard';
import { formatDate, formatConfidence, getStatusColor, getConfidenceColor } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DetectionWithPerson {
  _id: string;
  personId: {
    _id: string;
    name: string;
    age: number;
    gender: string;
    photoUrl: string;
    status: string;
  };
  confidenceScore: number;
  capturedImage: string;
  timestamp: string;
  verified: boolean;
}

interface StatsData {
  totalPersons: number;
  activeSearches: number;
  totalDetections: number;
  recentDetections: DetectionWithPerson[];
  detectionsByDay: { _id: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const chartData = stats?.detectionsByDay?.map((d) => ({
    date: d._id.slice(5),
    detections: d.count,
  })) || [];

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="skeleton h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
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
            <div className="p-3 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <LayoutDashboard className="w-7 h-7" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Dashboard
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Overview of missing person cases and detections
              </p>
            </div>
          </div>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glow-btn flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Register New Case
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Missing Persons"
            value={stats?.totalPersons || 0}
            icon={Users}
            color="indigo"
          />
          <StatsCard
            title="Total Detections"
            value={stats?.totalDetections || 0}
            icon={ScanSearch}
            color="emerald"
          />
          <StatsCard
            title="Active Searches"
            value={stats?.activeSearches || 0}
            icon={Activity}
            color="amber"
          />
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5" style={{ color: '#818cf8' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Detection Activity (Last 7 Days)
            </h2>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 26, 46, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="detections" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Activity className="w-12 h-12 mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No detection activity yet. Start monitoring to see results.
              </p>
            </div>
          )}
        </motion.div>

        {/* Recent Detections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5" style={{ color: '#818cf8' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Recent Detections
              </h2>
            </div>
            <Link
              href="/detections"
              className="text-sm flex items-center gap-1 transition-colors"
              style={{ color: '#818cf8' }}
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats?.recentDetections && stats.recentDetections.length > 0 ? (
            <div className="space-y-3">
              {stats.recentDetections.map((detection) => (
                <motion.div
                  key={detection._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 rounded-xl transition-colors"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  {/* Person Photo */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
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
                        <Users className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {detection.personId?.name || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-3 h-3" />
                        {formatDate(detection.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-bold ${getConfidenceColor(detection.confidenceScore)}`}>
                      {formatConfidence(detection.confidenceScore)}
                    </p>
                    <span className={`status-badge text-xs ${getStatusColor(detection.personId?.status || 'searching')}`}>
                      {detection.personId?.status || 'searching'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ScanSearch className="w-12 h-12 mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                No detections yet
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Start monitoring to detect matches
              </p>
              <Link href="/monitor" className="mt-4">
                <button className="glow-btn flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4" />
                  Start Monitoring
                </button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
