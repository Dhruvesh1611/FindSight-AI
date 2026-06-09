'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  UserPlus,
  Camera,
  ClipboardList,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home', icon: Search },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/register', label: 'Register', icon: UserPlus },
  { href: '/monitor', label: 'Monitor', icon: Camera },
  { href: '/detections', label: 'Detections', icon: ClipboardList },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'rgba(6, 6, 11, 0.7)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    }}>
      <div className="container-main">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="relative flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
              whileHover={{ scale: 1.08, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Search className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: '0 0 30px rgba(124, 58, 237, 0.5)' }} />
            </motion.div>
            <span className="text-xl font-bold tracking-tight">
              <span className="gradient-text">Find</span>
              <span style={{ color: 'var(--text-primary)' }}>Sight</span>
              <span className="text-xs ml-1.5 px-2 py-0.5 rounded-md font-semibold"
                style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#a78bfa', fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                AI
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                  style={{
                    color: isActive ? '#c4b5fd' : 'var(--text-muted)',
                    background: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'rgba(124, 58, 237, 0.1)',
                        border: '1px solid rgba(124, 58, 237, 0.2)',
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2.5 rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden"
            style={{
              background: 'rgba(6, 6, 11, 0.97)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <div className="px-4 pb-5 pt-2 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: isActive ? '#c4b5fd' : 'var(--text-secondary)',
                      background: isActive ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(124, 58, 237, 0.15)' : '1px solid transparent',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
