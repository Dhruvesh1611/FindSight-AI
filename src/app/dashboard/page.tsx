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
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import StatsCard from '@/components/dashboard/StatsCard';
import { formatDate, formatConfidence, getStatusColor, getConfidenceColor } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
      <div className="section-spacing">
        <div className="container-main space-y-8">
          <div className="skeleton h-12 w-72 mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Calculate "found" persons (total - active)
  const foundPersons = stats ? (stats.totalPersons - stats.activeSearches) : 0;

  return (
    <div className="section-spacing">
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl shadow-inner" style={{ 
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(167, 139, 250, 0.05))',
              border: '1px solid rgba(124, 58, 237, 0.2)' 
            }}>
              <LayoutDashboard className="w-8 h-8" style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-overline">Overview</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot"></span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Dashboard
              </h1>
            </div>
          </div>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="glow-btn flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Register New Case
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats Cards - 4 Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard
            title="Registered Cases"
            value={stats?.totalPersons || 0}
            icon={Users}
            color="indigo"
          />
          <StatsCard
            title="Active Searches"
            value={stats?.activeSearches || 0}
            icon={Activity}
            color="amber"
          />
          <StatsCard
            title="Total Detections"
            value={stats?.totalDetections || 0}
            icon={ScanSearch}
            color="emerald"
          />
          <StatsCard
            title="Found Persons"
            value={foundPersons}
            icon={ShieldCheck}
            color="cyan"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section (Spans 2 columns) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-card p-8 lg:col-span-2 card-accent-top flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
                  <Activity className="w-5 h-5" style={{ color: '#a78bfa' }} />
                </div>
                <h2 className="text-card-title" style={{ color: 'var(--text-primary)' }}>
                  Detection Activity
                </h2>
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full" 
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                Last 7 Days
              </span>
            </div>

            <div className="flex-1 min-h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--text-muted)" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(17, 17, 25, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: 'var(--text-primary)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)',
                      }}
                      itemStyle={{ color: '#c4b5fd' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="detections" 
                      stroke="#a78bfa" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorDetections)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <Activity className="w-12 h-12 mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    No detection activity yet
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Start monitoring to see results
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Detections Section (Spans 1 column) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="glass-card p-8 card-accent-top flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <Eye className="w-5 h-5" style={{ color: '#34d399' }} />
                </div>
                <h2 className="text-card-title" style={{ color: 'var(--text-primary)' }}>
                  Live Feed
                </h2>
              </div>
              <Link
                href="/detections"
                className="text-xs font-semibold flex items-center gap-1 transition-colors hover:text-white"
                style={{ color: 'var(--accent-secondary)' }}
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '350px' }}>
              {stats?.recentDetections && stats.recentDetections.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentDetections.map((detection, i) => (
                    <motion.div
                      key={detection._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="glass-card-subtle p-3 flex items-center gap-4 group"
                    >
                      {/* Person Photo */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-white/10 transition-colors">
                        {detection.personId?.photoUrl ? (
                          <Image
                            src={detection.personId.photoUrl}
                            alt={detection.personId?.name || 'Person'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <Users className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                          </div>
                        )}
                        {/* Status indicator dot */}
                        <div className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-black ${detection.personId?.status === 'found' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {detection.personId?.name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {formatDate(detection.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Confidence */}
                      <div className="text-right flex-shrink-0 flex flex-col items-end">
                        <p className={`text-sm font-bold ${getConfidenceColor(detection.confidenceScore)}`}>
                          {formatConfidence(detection.confidenceScore)}
                        </p>
                        <span className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
                          Match
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <ScanSearch className="w-10 h-10 mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    No detections yet
                  </p>
                  <p className="text-xs mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>
                    Camera feeds are currently quiet
                  </p>
                  <Link href="/monitor">
                    <button className="btn-ghost py-2 px-4 text-xs flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Open Monitor
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
