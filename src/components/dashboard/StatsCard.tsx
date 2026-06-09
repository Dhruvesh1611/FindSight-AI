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
    bg: 'rgba(124, 58, 237, 0.04)',
    border: 'rgba(124, 58, 237, 0.15)',
    iconBg: 'rgba(124, 58, 237, 0.15)',
    iconColor: '#a78bfa',
    glow: 'rgba(124, 58, 237, 0.3)',
    text: '#c4b5fd',
  },
  emerald: {
    bg: 'rgba(16, 185, 129, 0.04)',
    border: 'rgba(16, 185, 129, 0.15)',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#34d399',
    glow: 'rgba(16, 185, 129, 0.3)',
    text: '#6ee7b7',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.04)',
    border: 'rgba(245, 158, 11, 0.15)',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.3)',
    text: '#fcd34d',
  },
  rose: {
    bg: 'rgba(239, 68, 68, 0.04)',
    border: 'rgba(239, 68, 68, 0.15)',
    iconBg: 'rgba(239, 68, 68, 0.15)',
    iconColor: '#f87171',
    glow: 'rgba(239, 68, 68, 0.3)',
    text: '#fca5a5',
  },
  cyan: {
    bg: 'rgba(6, 182, 212, 0.04)',
    border: 'rgba(6, 182, 212, 0.15)',
    iconBg: 'rgba(6, 182, 212, 0.15)',
    iconColor: '#22d3ee',
    glow: 'rgba(6, 182, 212, 0.3)',
    text: '#67e8f9',
  },
};

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, color = 'indigo' }: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-8 cursor-default relative overflow-hidden"
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
    >
      {/* Top Accent Gradient */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]" 
        style={{ 
          background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`,
          opacity: 0.5 
        }} 
      />

      {/* Subtle Background Glow */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl"
        style={{ background: colors.glow, opacity: 0.15 }}
      />

      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          <div
            className="p-3 rounded-xl shadow-inner"
            style={{ 
              background: colors.iconBg,
              border: `1px solid ${colors.border}` 
            }}
          >
            <Icon className="w-5 h-5" style={{ color: colors.iconColor }} />
          </div>
        </div>

        <div className="mt-auto">
          <p className="stat-value" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          
          {trend && (
            <div className="flex items-center gap-2 mt-3">
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
                style={{ 
                  background: trendUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: trendUp ? '#34d399' : '#f87171' 
                }}
              >
                {trendUp ? '↑' : '↓'} {trend}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                vs last month
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
