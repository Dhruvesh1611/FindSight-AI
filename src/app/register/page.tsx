'use client';

import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import RegisterForm from '@/components/forms/RegisterForm';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <UserPlus className="w-7 h-7" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Register Missing Person
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Enter the details and upload a clear photo for facial recognition
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <RegisterForm onSuccess={() => router.push('/dashboard')} />

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 mt-6"
          style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.15)' }}
        >
          <h3 className="text-sm font-semibold mb-2" style={{ color: '#818cf8' }}>
            💡 Tips for Best Results
          </h3>
          <ul className="text-sm space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
            <li>• Use a clear, front-facing photo with good lighting</li>
            <li>• Ensure the face is clearly visible and not obscured</li>
            <li>• Higher resolution photos produce better matching results</li>
            <li>• The AI service generates facial encodings automatically</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
