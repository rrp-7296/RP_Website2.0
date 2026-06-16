/**
 * Centralized API configuration for Web + Capacitor (Android/iOS)
 *
 * Priority order:
 * 1. VITE_API_URL env variable (set in .env.production for real server)
 * 2. Capacitor native context → Android emulator uses 10.0.2.2, real device uses SERVER_HOST
 * 3. Browser dev fallback → localhost:8000
 */

import { Capacitor } from '@capacitor/core';

function resolveBaseUrl(): string {
  // 1. Explicit override via environment variable (production build)
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) return envUrl.replace(/\/$/, '');

  // 2. Running inside a Capacitor native app (Android/iOS)
  if (Capacitor.isNativePlatform()) {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') {
      // Android emulator maps host machine's localhost → 10.0.2.2
      // For real devices on the same WiFi, set VITE_API_URL in .env.production
      return 'http://10.0.2.2:8000';
    }
    if (platform === 'ios') {
      // iOS simulator also maps to localhost, but real devices need actual IP
      return 'http://localhost:8000';
    }
  }

  // 3. Web browser (dev or production web)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:8000`;
    }
  }
  return 'http://localhost:8000';
}

export const API_BASE = resolveBaseUrl();

/**
 * Returns full URL for an API endpoint path.
 * @example apiUrl('/blogs') → 'http://localhost:8000/api/blogs'
 */
export const apiUrl = (path: string): string =>
  `${API_BASE}/api${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Returns full URL for an uploaded file.
 * @example uploadUrl('blog/photo.jpg') → 'http://localhost:8000/uploads/blog/photo.jpg'
 */
export const uploadUrl = (filename: string): string =>
  `${API_BASE}/uploads/${filename}`;
