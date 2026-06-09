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
} from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Register Missing Persons',
    description: 'Upload photos and details of missing individuals. The system generates facial embeddings for real-time matching.',
    color: '#818cf8',
    bg: 'rgba(99, 102, 241, 0.1)',
  },
  {
    icon: Camera,
    title: 'Live CCTV Monitoring',
    description: 'Connect any camera as a surveillance feed. Continuous face detection analyzes every frame in real time.',
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  {
    icon: Brain,
    title: 'AI Face Recognition',
    description: 'Advanced face encoding and matching algorithms compare detected faces against registered profiles instantly.',
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  {
    icon: Bell,
    title: 'Instant Alerts',
    description: 'When a match is found above the confidence threshold, the system generates immediate alerts with snapshots.',
    color: '#f87171',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track all registered cases, monitor detection statistics, and review recent alerts from a central dashboard.',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.1)',
  },
  {
    icon: Shield,
    title: 'Detection Logs',
    description: 'Every detection is recorded with timestamps, confidence scores, and captured images for investigation review.',
    color: '#2dd4bf',
    bg: 'rgba(45, 212, 191, 0.1)',
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent)' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent)' }} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
              }}
            >
              <Brain className="w-4 h-4" />
              AI-Powered Surveillance Intelligence
              <ChevronRight className="w-3 h-3" />
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
              <span style={{ color: 'var(--text-primary)' }}>Find Missing Persons</span>
              <br />
              <span className="gradient-text">With AI Vision</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}>
              Leverage real-time face recognition and computer vision to identify missing individuals
              from surveillance feeds — faster, smarter, and more accurate than ever.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glow-btn text-base px-8 py-4 flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Register Missing Person
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/monitor">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2 transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Camera className="w-5 h-5" />
                  Start Monitoring
                </motion.button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {[
                { value: '< 3s', label: 'Detection Time' },
                { value: '95%+', label: 'Accuracy' },
                { value: '24/7', label: 'Monitoring' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
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
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-card p-6 group cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: feature.bg }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
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
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="relative glass-card p-6 text-center"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5"
                    style={{ background: 'rgba(99, 102, 241, 0.3)' }} />
                )}

                <div className="text-4xl font-bold mb-4 gradient-text opacity-30">
                  {step.step}
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                  <step.icon className="w-7 h-7" style={{ color: '#818cf8' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
              borderColor: 'rgba(99, 102, 241, 0.2)',
            }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Ready to Make a <span className="gradient-text">Difference</span>?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Start using FindSight AI to help locate missing persons faster with the power of artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glow-btn text-base px-8 py-4 flex items-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  View Dashboard
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2 transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Register a Case
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} FindSight AI — Built for social good. Hackathon prototype.
        </p>
      </footer>
    </div>
  );
}
