'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Search,
  UserPlus,
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
    <nav className="nav-shell">
      <div className="container-main">
        <div className="nav-inner">
          <Link href="/" className="group flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <motion.span
              className="logo-mark"
              whileHover={{ scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              <Search className="h-5 w-5 text-white" />
            </motion.span>
            <span className="flex items-center gap-2">
              <span className="text-xl font-bold leading-none">
                <span className="gradient-text">Find</span>
                <span className="text-white">Sight</span>
              </span>
              <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[11px] font-bold text-violet-200">
                AI
              </span>
            </span>
          </Link>

          <div className="nav-desktop-links">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            className="btn-ghost nav-mobile-toggle min-h-0 px-3 py-2"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/5 bg-black/40 md:hidden"
          >
            <div className="container-main py-3">
              <div className="grid gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`nav-link min-h-12 justify-start ${isActive ? 'nav-link-active' : ''}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
