'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, User, MapPin, Calendar, Loader2, CheckCircle, X } from 'lucide-react';
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
        toast.success('Missing person registered successfully!');
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
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="glass-card p-8 space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
          <User className="w-6 h-6" style={{ color: '#818cf8' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Person Information
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Enter details about the missing person
          </p>
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Photo <span className="text-red-400">*</span>
        </label>
        <div className="flex items-start gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-32 h-32 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-indigo-400/50"
            style={{
              borderColor: photoPreview ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            {photoPreview ? (
              <>
                <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removePhoto(); }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Upload</p>
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
          <div className="text-sm space-y-1" style={{ color: 'var(--text-muted)' }}>
            <p>Upload a clear, front-facing photo</p>
            <p>Supported: JPG, PNG, WebP</p>
            <p>Max size: 5MB</p>
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Full Name <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
            className="glass-input pl-11"
            required
          />
        </div>
      </div>

      {/* Age & Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Age <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Age"
              min="0"
              max="150"
              className="glass-input pl-11"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Gender <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
            className="glass-select"
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Last Seen Location */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Last Seen Location <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={formData.lastSeenLocation}
            onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
            placeholder="e.g., Mumbai Central Railway Station"
            className="glass-input pl-11"
            required
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="glow-btn w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Registering...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Register Missing Person
          </>
        )}
      </button>
    </motion.form>
  );
}
