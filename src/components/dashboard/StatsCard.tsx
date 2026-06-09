'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
  indigo: {
    bg: 'rgba(99, 102, 241, 0.1)',
    border: 'rgba(99, 102, 241, 0.2)',
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    glow: 'rgba(99, 102, 241, 0.3)',
  },
  emerald: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#34d399',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  rose: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.2)',
    iconBg: 'rgba(239, 68, 68, 0.15)',
    iconColor: '#f87171',
    glow: 'rgba(239, 68, 68, 0.3)',
  },
};

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, color = 'indigo' }: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 cursor-default"
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          {trend && (
            <p className="text-xs mt-2 font-medium" style={{ color: trendUp ? '#34d399' : '#f87171' }}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ background: colors.iconBg }}
        >
          <Icon className="w-6 h-6" style={{ color: colors.iconColor }} />
        </div>
      </div>
    </motion.div>
  );
}
