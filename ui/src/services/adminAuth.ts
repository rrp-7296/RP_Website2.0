/**
 * adminAuth.ts — Permanent, native-backed authentication service for Web + Android/iOS.
 *
 * Utilizes @capacitor/preferences (Android SharedPreferences) alongside localStorage
 * to ensure login sessions survive app restarts, device reboots, and WebView cache resets.
 */

import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user_profile';

export interface AdminUser {
  id?: number;
  username: string;
  display_name: string;
  email: string;
}

export const adminAuth = {
  /**
   * Retrieves the token synchronously from localStorage, with asynchronous fallback
   * to native Android Preferences if localStorage was purged.
   */
  getTokenSync(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Asynchronously retrieves the admin token, checking localStorage first then native Preferences.
   */
  async getToken(): Promise<string | null> {
    const local = this.getTokenSync();
    if (local) return local;

    try {
      const { value } = await Preferences.get({ key: TOKEN_KEY });
      if (value) {
        // Restore to localStorage
        localStorage.setItem(TOKEN_KEY, value);
        return value;
      }
    } catch (e) {
      // Preferences unavailable or browser fallback
    }
    return null;
  },

  /**
   * Persists the token across both localStorage and native Android SharedPreferences.
   */
  async setToken(token: string, user?: AdminUser): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      if (user) {
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
      }
    }

    try {
      await Preferences.set({ key: TOKEN_KEY, value: token });
      if (user) {
        await Preferences.set({ key: ADMIN_USER_KEY, value: JSON.stringify(user) });
      }
    } catch (e) {
      // Ignore preferences error
    }
  },

  /**
   * Completely clears the token from both localStorage and native Android SharedPreferences.
   */
  async clearToken(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    }

    try {
      await Preferences.remove({ key: TOKEN_KEY });
      await Preferences.remove({ key: ADMIN_USER_KEY });
    } catch (e) {
      // Ignore
    }
  },

  /**
   * Called on app boot to ensure any stored native token is restored into localStorage.
   */
  async initSession(): Promise<string | null> {
    return await this.getToken();
  },

  /**
   * Synchronous check if token exists.
   */
  isLoggedIn(): boolean {
    return Boolean(this.getTokenSync());
  }
};
