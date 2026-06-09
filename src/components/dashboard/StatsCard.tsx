'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan';
}

const colorMap = {
  indigo: {
    border: 'rgba(139, 92, 246, 0.28)',
    iconBg: 'rgba(139, 92, 246, 0.14)',
    iconColor: '#c4b5fd',
    accent: '#a78bfa',
    wash: 'linear-gradient(135deg, rgba(139, 92, 246, 0.14), rgba(139, 92, 246, 0.02))',
  },
  emerald: {
    border: 'rgba(16, 185, 129, 0.26)',
    iconBg: 'rgba(16, 185, 129, 0.13)',
    iconColor: '#6ee7b7',
    accent: '#34d399',
    wash: 'linear-gradient(135deg, rgba(16, 185, 129, 0.13), rgba(16, 185, 129, 0.02))',
  },
  amber: {
    border: 'rgba(245, 158, 11, 0.27)',
    iconBg: 'rgba(245, 158, 11, 0.13)',
    iconColor: '#fcd34d',
    accent: '#fbbf24',
    wash: 'linear-gradient(135deg, rgba(245, 158, 11, 0.13), rgba(245, 158, 11, 0.02))',
  },
  rose: {
    border: 'rgba(244, 63, 94, 0.28)',
    iconBg: 'rgba(244, 63, 94, 0.13)',
    iconColor: '#fda4af',
    accent: '#fb7185',
    wash: 'linear-gradient(135deg, rgba(244, 63, 94, 0.13), rgba(244, 63, 94, 0.02))',
  },
  cyan: {
    border: 'rgba(34, 211, 238, 0.26)',
    iconBg: 'rgba(34, 211, 238, 0.12)',
    iconColor: '#67e8f9',
    accent: '#22d3ee',
    wash: 'linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(34, 211, 238, 0.02))',
  },
};

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, color = 'indigo' }: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.36, ease: 'easeOut' }}
      className="glass-card card-accent-top flex min-h-[190px] flex-col overflow-hidden p-7"
      style={{
        borderColor: colors.border,
        background: `${colors.wash}, rgba(14, 15, 27, 0.74)`,
      }}
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-slate-400">{title}</p>
          <p className="stat-value mt-5 text-white">{value}</p>
        </div>
        <div
          className="grid h-12 w-12 place-items-center rounded-md border"
          style={{ background: colors.iconBg, borderColor: colors.border }}
        >
          <Icon className="h-5 w-5" style={{ color: colors.iconColor }} />
        </div>
      </div>

      <div className="mt-auto pt-6">
        {trend ? (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border px-2.5 py-1 text-xs font-bold"
              style={{
                background: trendUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                borderColor: trendUp ? 'rgba(16, 185, 129, 0.22)' : 'rgba(244, 63, 94, 0.22)',
                color: trendUp ? '#6ee7b7' : '#fda4af',
              }}
            >
              {trendUp ? '+' : '-'} {trend}
            </span>
            <span className="text-xs text-slate-500">vs last month</span>
          </div>
        ) : (
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
        )}
        <div className="mt-4 h-1 rounded-full bg-white/5">
          <div className="h-full w-2/3 rounded-full" style={{ background: colors.accent }} />
        </div>
      </div>
    </motion.div>
  );
}
