'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Clock,
  Eye,
  LayoutDashboard,
  ScanSearch,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StatsCard from '@/components/dashboard/StatsCard';
import { formatConfidence, formatDate, getConfidenceColor } from '@/lib/utils';

interface PersonRecord {
  _id: string;
  name: string;
  age: number;
  gender: string;
  lastSeenLocation: string;
  photoUrl: string;
  status: 'searching' | 'found' | 'closed';
  createdAt: string;
  updatedAt: string;
}

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
  const [persons, setPersons] = useState<PersonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPersons, setLoadingPersons] = useState(true);

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

  const fetchPersons = useCallback(async () => {
    try {
      setLoadingPersons(true);
      const res = await fetch('/api/persons?limit=100');
      const data = await res.json();
      if (data.success) {
        setPersons(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch person directory:', error);
    } finally {
      setLoadingPersons(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchStats();
      void fetchPersons();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchStats, fetchPersons]);

  const chartData = stats?.detectionsByDay?.map((d) => ({
    date: d._id.slice(5),
    detections: d.count,
  })) || [];

  const searchingCount = persons.filter((person) => person.status === 'searching').length;
  const foundCount = persons.filter((person) => person.status === 'found').length;
  const closedCount = persons.filter((person) => person.status === 'closed').length;
  const totalPersons = persons.length;

  if (loading || loadingPersons) {
    return (
      <div className="page-shell">
        <div className="container-main space-y-8">
          <div className="flex items-center gap-5">
            <div className="skeleton h-14 w-14" />
            <div className="space-y-3">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-10 w-72" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-48" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="skeleton h-[440px] lg:col-span-2" />
            <div className="skeleton h-[440px]" />
          </div>
        </div>
      </div>
    );
  }

  const foundPersons = stats ? stats.totalPersons - stats.activeSearches : 0;
  const recentDetections = stats?.recentDetections || [];

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
              <LayoutDashboard className="h-7 w-7 text-violet-200" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="eyebrow">Overview</span>
                <span className="live-dot text-emerald-300" />
              </div>
              <h1 className="text-page-title text-white">Dashboard</h1>
              <p className="mt-3 max-w-2xl text-body">
                Monitor registered cases, active searches, and detection activity from one operational view.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/monitor">
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="btn-ghost">
                <Eye className="h-4 w-4" />
                Open Monitor
              </motion.span>
            </Link>
            <Link href="/register">
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="glow-btn">
                <UserPlus className="h-4 w-4" />
                Register New Case
              </motion.span>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Registered Cases" value={stats?.totalPersons || 0} icon={Users} color="indigo" />
          <StatsCard title="Active Searches" value={stats?.activeSearches || 0} icon={Activity} color="amber" />
          <StatsCard title="Total Detections" value={stats?.totalDetections || 0} icon={ScanSearch} color="emerald" />
          <StatsCard title="Found Persons" value={foundPersons} icon={ShieldCheck} color="cyan" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-4">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5, ease: 'easeOut' }}
            className="glass-card-static card-accent-top flex min-h-[460px] flex-col p-7 xl:col-span-3"
          >
            <div className="panel-title-row">
              <div className="flex items-center gap-3">
                <div className="feature-icon mb-0 h-11 w-11">
                  <Activity className="h-5 w-5 text-violet-200" />
                </div>
                <div>
                  <h2 className="text-card-title text-white">Detection Activity</h2>
                  <p className="mt-1 text-sm text-slate-500">Daily matches captured by the monitoring workflow.</p>
                </div>
              </div>
              <span className="status-badge border-white/10 text-slate-300">Last 7 Days</span>
            </div>

            <div className="min-h-[320px] flex-1">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.38} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.055)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(183,184,199,0.55)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="rgba(183,184,199,0.55)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 16, 29, 0.96)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#f7f7fb',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.42)',
                        backdropFilter: 'blur(14px)',
                      }}
                      itemStyle={{ color: '#c4b5fd' }}
                      labelStyle={{ color: '#b7b8c7' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="detections"
                      stroke="#c4b5fd"
                      strokeWidth={3}
                      fill="url(#colorDetections)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="feature-icon">
                    <Activity className="h-6 w-6 text-slate-500" />
                  </div>
                  <h3 className="text-card-title text-white">No detection activity yet</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                    Start monitoring to populate activity trends and confidence signals.
                  </p>
                </div>
              )}
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5, ease: 'easeOut' }}
            className="glass-card-static card-accent-top flex min-h-[460px] flex-col p-7"
          >
            <div className="panel-title-row">
              <div className="flex items-center gap-3">
                <div className="feature-icon mb-0 h-11 w-11">
                  <Eye className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-card-title text-white">Recent Signals</h2>
                  <p className="mt-1 text-sm text-slate-500">Latest detection events.</p>
                </div>
              </div>
              <Link href="/detections" className="text-sm font-bold text-violet-200 transition-colors hover:text-white">
                View all
              </Link>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {recentDetections.length > 0 ? (
                <div className="space-y-3">
                  {recentDetections.map((detection, index) => (
                    <motion.div
                      key={detection._id}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.24 + index * 0.06, duration: 0.35 }}
                      className="glass-card-subtle flex items-center gap-4 p-3"
                    >
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-white/10">
                        {detection.personId?.photoUrl ? (
                          <Image
                            src={detection.personId.photoUrl}
                            alt={detection.personId?.name || 'Person'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-white/5">
                            <Users className="h-5 w-5 text-slate-500" />
                          </div>
                        )}
                        <span
                          className={`absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-black ${
                            detection.personId?.status === 'found' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">
                          {detection.personId?.name || 'Unknown'}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="truncate">{formatDate(detection.timestamp)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-sm font-bold ${getConfidenceColor(detection.confidenceScore)}`}>
                          {formatConfidence(detection.confidenceScore)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">match</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                  <div className="feature-icon">
                    <ScanSearch className="h-6 w-6 text-slate-500" />
                  </div>
                  <h3 className="text-card-title text-white">No signals recorded</h3>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
                    Camera feeds are quiet. Open the monitor to begin detection.
                  </p>
                  <Link href="/monitor" className="mt-6">
                    <span className="btn-ghost px-4 py-2 text-sm">
                      <Eye className="h-4 w-4" />
                      Open Monitor
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
