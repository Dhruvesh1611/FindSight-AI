'use client';

import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import RegisterForm from '@/components/forms/RegisterForm';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="section-spacing">
      <div className="container-main max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-colors hover:text-white"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl shadow-inner" style={{ 
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(167, 139, 250, 0.05))',
              border: '1px solid rgba(124, 58, 237, 0.2)' 
            }}>
              <UserPlus className="w-8 h-8" style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-overline tracking-widest text-indigo-400">Database Entry</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Register Target Profile
              </h1>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-8">
            <RegisterForm onSuccess={() => router.push('/dashboard')} />
          </div>
          
          {/* Info Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="glass-card-subtle p-6 rounded-2xl"
              style={{ borderLeft: '4px solid #a78bfa' }}
            >
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#c4b5fd' }}>
                <Zap className="w-4 h-4" />
                AI Processing
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                When you upload a photo, our system uses a deep neural network to extract a 128-dimensional facial embedding. This mathematical representation is used for high-speed similarity matching across all camera feeds.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="glass-card-subtle p-6 rounded-2xl"
              style={{ borderLeft: '4px solid #34d399' }}
            >
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#6ee7b7' }}>
                <Shield className="w-4 h-4" />
                Data Security
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                All uploaded images and resulting facial embeddings are securely stored. The data is only used for internal matching against authorized surveillance feeds within the FindSight system.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
