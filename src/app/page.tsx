'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Camera,
  Shield,
  Brain,
  Bell,
  BarChart3,
  ArrowRight,
  Scan,
  Upload,
  Eye,
  Zap,
  ChevronRight,
  Users,
  Activity,
  Radio,
} from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Register Missing Persons',
    description: 'Upload photos and details of missing individuals. The system generates facial embeddings for real-time matching.',
    color: '#a78bfa',
    bg: 'rgba(124, 58, 237, 0.08)',
    borderAccent: 'rgba(124, 58, 237, 0.15)',
  },
  {
    icon: Camera,
    title: 'Live CCTV Monitoring',
    description: 'Connect any camera as a surveillance feed. Continuous face detection analyzes every frame in real time.',
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.08)',
    borderAccent: 'rgba(16, 185, 129, 0.15)',
  },
  {
    icon: Brain,
    title: 'AI Face Recognition',
    description: 'Advanced face encoding and matching algorithms compare detected faces against registered profiles instantly.',
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.08)',
    borderAccent: 'rgba(245, 158, 11, 0.15)',
  },
  {
    icon: Bell,
    title: 'Instant Alerts',
    description: 'When a match is found above the confidence threshold, the system generates immediate alerts with snapshots.',
    color: '#f87171',
    bg: 'rgba(239, 68, 68, 0.08)',
    borderAccent: 'rgba(239, 68, 68, 0.15)',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track all registered cases, monitor detection statistics, and review recent alerts from a central dashboard.',
    color: '#c4b5fd',
    bg: 'rgba(167, 139, 250, 0.08)',
    borderAccent: 'rgba(167, 139, 250, 0.15)',
  },
  {
    icon: Shield,
    title: 'Detection Logs',
    description: 'Every detection is recorded with timestamps, confidence scores, and captured images for investigation review.',
    color: '#2dd4bf',
    bg: 'rgba(45, 212, 191, 0.08)',
    borderAccent: 'rgba(45, 212, 191, 0.15)',
  },
];

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Photo',
    description: 'Register a missing person with their photo and details',
  },
  {
    icon: Scan,
    step: '02',
    title: 'AI Processes',
    description: 'System generates facial embeddings from the uploaded image',
  },
  {
    icon: Eye,
    step: '03',
    title: 'Monitor Feed',
    description: 'Camera feed analyzes every frame for face detection',
  },
  {
    icon: Zap,
    step: '04',
    title: 'Match & Alert',
    description: 'Instant alert when a face match exceeds confidence threshold',
  },
];

const stats = [
  { icon: Users, value: '24/7', label: 'Active Monitoring', color: '#a78bfa', bg: 'rgba(124, 58, 237, 0.08)' },
  { icon: Activity, value: '< 3s', label: 'Detection Speed', color: '#34d399', bg: 'rgba(16, 185, 129, 0.08)' },
  { icon: Radio, value: '95%+', label: 'Recognition Accuracy', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.08)' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* ========== GLOBAL BACKGROUND ========== */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full hero-glow"
          style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15), transparent 70%)' }}
        />
        <div
          className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full hero-glow-slow"
          style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.1), transparent 70%)' }}
        />
        <div
          className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full hero-glow-slow"
          style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06), transparent 70%)', animationDelay: '4s' }}
        />
      </div>

      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="container-main w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-10 text-sm font-medium border-gradient"
              style={{
                background: 'rgba(124, 58, 237, 0.08)',
                color: '#c4b5fd',
              }}
            >
              <Brain className="w-4 h-4" />
              AI-Powered Surveillance Intelligence
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </motion.div>

            {/* Title */}
            <h1 className="text-hero mb-8">
              <span style={{ color: 'var(--text-primary)' }}>Find Missing Persons</span>
              <br />
              <span className="gradient-text">With AI Vision</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}>
              Leverage real-time face recognition and computer vision to identify missing individuals
              from surveillance feeds — faster, smarter, and more accurate than ever.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="glow-btn btn-shimmer text-base px-10 py-4 flex items-center gap-3 font-semibold"
                >
                  <Search className="w-5 h-5" />
                  Register Missing Person
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/monitor">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-ghost text-base px-10 py-4 flex items-center gap-3 font-semibold"
                >
                  <Camera className="w-5 h-5" />
                  Start Monitoring
                </motion.button>
              </Link>
            </div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card-static flex items-center gap-4 px-6 py-5"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: stat.bg }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="relative section-spacing">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <span className="text-overline mb-4 block">Capabilities</span>
            <h2 className="text-section-title mb-5" style={{ color: 'var(--text-primary)' }}>
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Everything you need to detect, track, and locate missing persons using AI-powered surveillance.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="glass-card p-8 group cursor-default flex flex-col"
                style={{ minHeight: '280px' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ background: feature.bg, border: `1px solid ${feature.borderAccent}` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-card-title mb-3" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="relative section-spacing" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <span className="text-overline mb-4 block">Process</span>
            <h2 className="text-section-title mb-5" style={{ color: 'var(--text-primary)' }}>
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Four simple steps from registration to real-time detection.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="relative"
              >
                {/* Horizontal connector (desktop) */}
                {index < steps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-6 left-[calc(50%+30px)] h-[2px]"
                    style={{
                      width: 'calc(100% - 20px)',
                      background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.4), rgba(124, 58, 237, 0.05))',
                    }}
                  />
                )}

                <div className="glass-card-static p-8 text-center relative overflow-hidden">
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-6 right-6 h-[1px]"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.3), transparent)' }}
                  />

                  {/* Step number */}
                  <div className="flex justify-center mb-5">
                    <div className="timeline-dot">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: 'var(--accent-secondary)' }}>
                    STEP {step.step}
                  </div>

                  <h3 className="text-card-title mb-3" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="relative section-spacing">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="glass-card-static p-12 sm:p-16 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(167, 139, 250, 0.04))',
                borderColor: 'rgba(124, 58, 237, 0.15)',
              }}
            >
              {/* Background orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full hero-glow"
                style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12), transparent 70%)' }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full hero-glow-slow"
                style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.08), transparent 70%)' }} />

              {/* Top gradient line */}
              <div className="absolute top-0 left-12 right-12 h-[1px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.5), transparent)' }} />

              <div className="relative z-10">
                <h2 className="text-section-title mb-5" style={{ color: 'var(--text-primary)' }}>
                  Ready to Make a <span className="gradient-text">Difference</span>?
                </h2>
                <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                  Start using FindSight AI to help locate missing persons faster with the power of artificial intelligence.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="glow-btn btn-shimmer text-base px-10 py-4 flex items-center gap-3 font-semibold"
                    >
                      <BarChart3 className="w-5 h-5" />
                      View Dashboard
                    </motion.button>
                  </Link>
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-ghost text-base px-10 py-4 flex items-center gap-3 font-semibold"
                    >
                      Register a Case
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-12 container-main" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold">
              <span className="gradient-text">Find</span>
              <span style={{ color: 'var(--text-primary)' }}>Sight AI</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} FindSight AI — Built for social good.
          </p>
        </div>
      </footer>
    </div>
  );
}
