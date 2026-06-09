'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Camera,
  ChevronRight,
  Eye,
  Radio,
  Scan,
  Search,
  Shield,
  Sparkles,
  Upload,
  Users,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Case Registration',
    description: 'Create missing person profiles with photo evidence and structured details ready for AI-assisted monitoring.',
    tone: 'text-violet-200',
  },
  {
    icon: Camera,
    title: 'Live Feed Monitoring',
    description: 'Analyze camera streams continuously and surface match events without interrupting the operator workflow.',
    tone: 'text-emerald-300',
  },
  {
    icon: Brain,
    title: 'Face Intelligence',
    description: 'Compare detected faces against registered profiles using generated embeddings and confidence scoring.',
    tone: 'text-cyan-200',
  },
  {
    icon: Bell,
    title: 'Critical Alerts',
    description: 'Escalate high-confidence detections with captured frame context, confidence, and case identity.',
    tone: 'text-rose-300',
  },
  {
    icon: BarChart3,
    title: 'Operational Analytics',
    description: 'Track active searches, detection activity, and recent signals from a single command dashboard.',
    tone: 'text-amber-200',
  },
  {
    icon: Shield,
    title: 'Audit Trail',
    description: 'Maintain timestamped detection logs for investigation review and follow-up validation.',
    tone: 'text-teal-200',
  },
];

const stats = [
  {
    icon: Users,
    value: 'Case-ready',
    label: 'Cases Registered',
    description: 'Profiles become searchable as soon as photo and details are submitted.',
  },
  {
    icon: Radio,
    value: '24/7',
    label: 'Active Monitoring',
    description: 'Designed for continuous review across surveillance sources.',
  },
  {
    icon: Activity,
    value: '< 3s',
    label: 'Detections',
    description: 'Fast frame analysis keeps operators close to live events.',
  },
];

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Register',
    description: 'Add a missing person profile with photo, age, gender, and last known location.',
  },
  {
    icon: Scan,
    step: '02',
    title: 'Encode',
    description: 'The system prepares facial embeddings for high-speed similarity matching.',
  },
  {
    icon: Eye,
    step: '03',
    title: 'Monitor',
    description: 'Camera frames are sampled and analyzed against active search profiles.',
  },
  {
    icon: Zap,
    step: '04',
    title: 'Alert',
    description: 'High-confidence matches trigger an operator alert and can be logged for review.',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

function HeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <div className="hero-sweep" />
      <div className="hero-ui-grid">
        <div className="hero-camera-preview">
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
            <span className="live-dot text-emerald-300" />
            LIVE AI SCAN
          </div>
          <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-3">
            {['0.94', '18', '02'].map((value, index) => (
              <div key={value} className="hero-mini-panel min-h-0 bg-black/30 p-3">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="mt-1 text-xs text-slate-400">
                  {index === 0 ? 'confidence' : index === 1 ? 'frames' : 'matches'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-side-panel">
          <div className="hero-mini-panel">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-2 w-24 rounded-full bg-violet-300/50" />
              <div className="h-2 w-12 rounded-full bg-white/[0.15]" />
            </div>
            <div className="space-y-3">
              <div className="h-3 rounded-full bg-white/[0.12]" />
              <div className="h-3 w-4/5 rounded-full bg-white/10" />
              <div className="h-3 w-2/3 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="hero-mini-panel">
            <div className="mb-5 h-2 w-28 rounded-full bg-cyan-300/40" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-8 rounded-sm ${index === 6 ? 'bg-emerald-300/50' : 'bg-white/10'}`}
                />
              ))}
            </div>
          </div>
          <div className="hero-mini-panel">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md border border-violet-300/20 bg-violet-300/15" />
              <div className="flex-1 space-y-3">
                <div className="h-3 rounded-full bg-white/[0.16]" />
                <div className="h-3 w-3/4 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <section className="hero-section">
        <HeroScene />
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="hero-content"
          >
            <div className="hero-badge">
              <Sparkles className="h-4 w-4" />
              AI surveillance intelligence for urgent search operations
              <ChevronRight className="h-4 w-4 text-violet-200/70" />
            </div>

            <h1 className="text-hero text-white">
              FindSight AI
              <span className="mt-2 block gradient-text">Find missing persons with live vision intelligence.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-body text-lg text-slate-300">
              Register cases, monitor camera feeds, and surface high-confidence matches in a polished command center built for fast response.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="glow-btn btn-shimmer px-8 py-4 text-base"
                >
                  <Search className="h-5 w-5" />
                  Register Missing Person
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
              <Link href="/monitor">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-ghost px-8 py-4 text-base"
                >
                  <Camera className="h-5 w-5" />
                  Start Monitoring
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="stats-band section-spacing">
        <div className="container-main">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="glass-card stat-tile">
                <div className="mb-8 flex items-center justify-between">
                  <div className="feature-icon mb-0">
                    <stat.icon className="h-6 w-6 text-violet-200" />
                  </div>
                  <span className="status-badge border-violet-300/25 text-violet-200">Operational</span>
                </div>
                <div className="stat-value text-white">{stat.value}</div>
                <h2 className="mt-3 text-card-title text-white">{stat.label}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{stat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="section-header"
          >
            <span className="eyebrow">Capabilities</span>
            <h2 className="mt-4 text-section-title text-white">
              A real command layer for <span className="gradient-text">AI-assisted search</span>
            </h2>
            <p className="mt-5 text-body">
              Every surface is built around the operator workflow: register, monitor, detect, review.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants} className="glass-card feature-card">
                <div className="feature-icon">
                  <feature.icon className={`h-6 w-6 ${feature.tone}`} />
                </div>
                <h3 className="text-card-title text-white">{feature.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-slate-400">{feature.description}</p>
                <div className="mt-7 h-px w-full bg-gradient-to-r from-violet-400/0 via-violet-300/30 to-cyan-300/0" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-spacing bg-white/[0.015]">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="section-header"
          >
            <span className="eyebrow">How it works</span>
            <h2 className="mt-4 text-section-title text-white">
              From profile to alert in <span className="gradient-text">four focused steps</span>
            </h2>
            <p className="mt-5 text-body">
              The flow stays simple so response teams can move from case intake to active monitoring quickly.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="timeline-wrap grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map((step) => (
              <motion.div key={step.step} variants={itemVariants} className="glass-card-static card-accent-top p-7 text-center">
                <div className="timeline-dot">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm font-bold text-violet-200">Step {step.step}</div>
                <h3 className="mt-3 text-card-title text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="glass-card-static cta-panel mx-auto max-w-4xl card-accent-top"
          >
            <span className="eyebrow justify-center">Launch command center</span>
            <h2 className="mx-auto mt-4 max-w-2xl text-section-title text-white">
              Turn working AI into a product people trust at first glance.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-body">
              Open the dashboard for live metrics, or start by registering a missing person profile for monitoring.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/dashboard">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="glow-btn px-8 py-4 text-base"
                >
                  <BarChart3 className="h-5 w-5" />
                  View Dashboard
                </motion.span>
              </Link>
              <Link href="/register">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-ghost px-8 py-4 text-base"
                >
                  Register a Case
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10">
        <div className="container-main flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="logo-mark h-9 w-9">
              <Search className="h-4 w-4 text-white" />
            </span>
            <span className="font-bold">
              <span className="gradient-text">Find</span>
              <span className="text-white">Sight AI</span>
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Built for faster search operations and clearer response workflows.
          </p>
        </div>
      </footer>
    </div>
  );
}
