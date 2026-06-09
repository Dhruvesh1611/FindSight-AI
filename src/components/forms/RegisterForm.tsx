'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, User, MapPin, Calendar, Loader2, CheckCircle, X, Info } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { imageToBase64 } from '@/lib/utils';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    lastSeenLocation: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photo) {
      toast.error('Please upload a photo of the missing person');
      return;
    }

    if (!formData.name || !formData.age || !formData.lastSeenLocation) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const photoUrl = await imageToBase64(photo);

      // Try to get face encoding from AI service
      let faceEncoding: number[] = [];
      try {
        const encodeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'}/encode`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: photoUrl }),
          }
        );
        if (encodeResponse.ok) {
          const encodeData = await encodeResponse.json();
          if (encodeData.encoding) {
            faceEncoding = encodeData.encoding;
          }
        }
      } catch {
        console.log('AI service unavailable, proceeding without face encoding');
      }

      const response = await fetch('/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          lastSeenLocation: formData.lastSeenLocation,
          photoUrl,
          faceEncoding,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Case Registered Successfully', {
          description: `${formData.name} is now active in the monitoring system.`,
          icon: <CheckCircle className="text-emerald-500" />,
        });
        setFormData({ name: '', age: '', gender: 'male', lastSeenLocation: '' });
        removePhoto();
        onSuccess?.();
      } else {
        toast.error(data.error || 'Failed to register');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit}
      className="glass-card p-10 sm:p-12 relative overflow-hidden"
    >
      {/* Top Accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]" 
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.5), transparent)' }} 
      />

      <div className="flex items-center gap-4 mb-10">
        <div className="p-3.5 rounded-xl border border-indigo-500/20 shadow-inner" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
          <User className="w-6 h-6" style={{ color: '#a78bfa' }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Subject Profile
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Enter details to generate AI facial embeddings
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Photo Upload */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              Primary Photograph <span className="text-red-400">*</span>
            </label>
            <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Required for AI</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-40 h-40 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 group flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: photoPreview ? '1px solid rgba(124, 58, 237, 0.3)' : '1px dashed rgba(255, 255, 255, 0.15)',
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {photoPreview ? (
                <>
                  <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-semibold">Change Photo</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePhoto(); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg transform transition-transform hover:scale-110"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="text-center group-hover:transform group-hover:-translate-y-1 transition-transform">
                  <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Click to upload</p>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            
            <div className="glass-card-subtle p-5 rounded-xl flex-1 w-full border-l-4 border-l-indigo-500/50">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Info className="w-4 h-4 text-indigo-400" />
                Image Requirements
              </h4>
              <ul className="text-sm space-y-2" style={{ color: 'var(--text-muted)' }}>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-indigo-400"></span> Clear, front-facing profile</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-indigo-400"></span> Good lighting, no heavy shadows</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-indigo-400"></span> No sunglasses or large face coverings</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-indigo-400"></span> Max size: 5MB (JPG, PNG)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-6 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className={`relative transition-all duration-300 ${focusedField === 'name' ? 'transform translate-x-1' : ''}`}>
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'name' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter subject's full name"
                className="glass-input pl-12"
                required
              />
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                Age <span className="text-red-400">*</span>
              </label>
              <div className={`relative transition-all duration-300 ${focusedField === 'age' ? 'transform translate-x-1' : ''}`}>
                <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'age' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  onFocus={() => setFocusedField('age')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Subject age"
                  min="0"
                  max="150"
                  className="glass-input pl-12"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                Gender <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                  onFocus={() => setFocusedField('gender')}
                  onBlur={() => setFocusedField(null)}
                  className={`glass-select transition-all duration-300 ${focusedField === 'gender' ? 'transform translate-x-1 border-indigo-400' : ''}`}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Last Seen Location */}
          <div className="space-y-2">
            <label className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              Last Known Location <span className="text-red-400">*</span>
            </label>
            <div className={`relative transition-all duration-300 ${focusedField === 'location' ? 'transform translate-x-1' : ''}`}>
              <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'location' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <input
                type="text"
                value={formData.lastSeenLocation}
                onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
                onFocus={() => setFocusedField('location')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g., Central Station, Platform 4"
                className="glass-input pl-12"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-white/5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="glow-btn btn-shimmer w-full flex items-center justify-center gap-3 py-4 text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:before:hidden"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Profile & Generating Embeddings...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Initialize Search Case
              </>
            )}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
