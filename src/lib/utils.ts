import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatConfidence(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'searching':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'found':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'closed':
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    default:
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  }
}

export function getConfidenceColor(score: number): string {
  if (score >= 0.9) return 'text-emerald-400';
  if (score >= 0.7) return 'text-yellow-400';
  if (score >= 0.5) return 'text-orange-400';
  return 'text-red-400';
}

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

export function getAIServiceUrl(path: string): string {
  return `${AI_SERVICE_URL}${path}`;
}
