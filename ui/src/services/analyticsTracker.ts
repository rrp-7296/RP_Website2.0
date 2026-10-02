/**
 * analyticsTracker.ts — High-performance, privacy-respecting client analytics.
 *
 * Characteristics:
 * - Zero performance impact on page loads and transitions.
 * - Single row per session upsert on backend; no DB spam on every click.
 * - In-memory page journey buffering with debounced keepalive beacons.
 * - Automatic device, browser, and OS detection.
 * - Correlates with Visitor Profile if provided.
 */

import { apiUrl } from '../config/api';

interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
}

class AnalyticsTracker {
  private visitorId: string = '';
  private sessionId: string = '';
  private entryPage: string = '';
  private pagesVisited: string[] = [];
  private sessionStartTime: number = 0;
  private isInitialized: boolean = false;
  private deviceInfo: DeviceInfo = { deviceType: 'desktop', browser: '', os: '' };
  private initialFlushTimer: any = null;
  private heartbeatInterval: any = null;
  private lastFlushedDuration: number = 0;

  /**
   * Initializes the analytics engine if on client-side.
   */
  public init(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;

    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.getOrCreateSessionId();
    this.deviceInfo = this.detectDeviceInfo();
    this.sessionStartTime = this.getSessionStartTime();

    // Listen to lifecycle events for flush
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush(true);
      }
    });

    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });

    window.addEventListener('pagehide', () => {
      this.flush(true);
    });

    // Heartbeat every 60 seconds
    this.heartbeatInterval = setInterval(() => {
      this.flush(false);
    }, 60000);
  }

  /**
   * Track a route change (called from React Router).
   */
  public trackPageView(path: string): void {
    // Ignore internal admin routes
    if (path.startsWith('/admin') || path.includes('/admin')) return;

    if (!this.isInitialized) {
      this.init();
    }

    const normalizedPath = path || '/';

    // Set entry page if not set
    if (!this.entryPage) {
      this.entryPage = normalizedPath;
    }

    // Add to path journey if not already the immediate last path
    const lastPath = this.pagesVisited[this.pagesVisited.length - 1];
    if (lastPath !== normalizedPath) {
      this.pagesVisited.push(normalizedPath);
      // Keep max 50 paths per session
      if (this.pagesVisited.length > 50) {
        this.pagesVisited.shift();
      }
    }

    this.updateActivity();

    // Trigger initial flush after 5s to verify session is active without slowing initial paint
    if (!this.initialFlushTimer && this.pagesVisited.length === 1) {
      this.initialFlushTimer = setTimeout(() => {
        this.flush(false);
      }, 5000);
    }
  }

  /**
   * Correlates the visitor name when user identifies themselves
   */
  public setVisitorName(name: string): void {
    if (!name) return;
    // Trigger immediate flush with the correlated name
    this.flush(false, name);
  }

  /**
   * Sends the current session metrics to the backend.
   */
  public flush(isUnloading: boolean = false, overrideName?: string): void {
    if (!this.visitorId || !this.sessionId || this.pagesVisited.length === 0) return;

    const durationSeconds = Math.max(1, Math.round((Date.now() - this.sessionStartTime) / 1000));
    
    // Avoid redundant flushes if nothing changed
    if (!isUnloading && !overrideName && durationSeconds === this.lastFlushedDuration) {
      return;
    }
    this.lastFlushedDuration = durationSeconds;

    // Retrieve visitor name if stored in localStorage
    let visitorName = overrideName || null;
    if (!visitorName) {
      try {
        const stored = localStorage.getItem('visitor_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.name) {
            visitorName = parsed.name;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const payload = {
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      visitor_name: visitorName,
      entry_page: this.entryPage || '/',
      pages_visited: this.pagesVisited,
      duration_seconds: durationSeconds,
      pageviews_count: this.pagesVisited.length,
      device_type: this.deviceInfo.deviceType,
      browser: this.deviceInfo.browser,
      os: this.deviceInfo.os,
      referrer: typeof document !== 'undefined' ? (document.referrer || '') : '',
    };

    const targetUrl = apiUrl('/analytics/beacon');
    const jsonStr = JSON.stringify(payload);

    if (isUnloading && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const sent = navigator.sendBeacon(targetUrl, blob);
        if (sent) return;
      } catch (err) {
        // Fall back to fetch below
      }
    }

    // Standard asynchronous beacon fetch with keepalive: true
    try {
      fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonStr,
        keepalive: true,
      }).catch(() => {
        // Silently catch network errors so UI is never disrupted
      });
    } catch (e) {
      // Ignored
    }
  }

  // ─── Internal Storage & ID Helpers ──────────────────────────────────────────

  private getOrCreateVisitorId(): string {
    const key = 'analytics_visitor_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = 'vis_' + this.generateId();
      localStorage.setItem(key, id);
    }
    return id;
  }

  private getOrCreateSessionId(): string {
    const key = 'analytics_session_id';
    const lastActiveKey = 'analytics_session_last_active';
    const now = Date.now();

    const existingSession = sessionStorage.getItem(key);
    const lastActive = parseInt(sessionStorage.getItem(lastActiveKey) || '0', 10);

    // If session is older than 30 minutes of inactivity, rotate to a new session
    if (existingSession && lastActive && now - lastActive < 30 * 60 * 1000) {
      sessionStorage.setItem(lastActiveKey, now.toString());
      return existingSession;
    }

    const newSession = 'sess_' + this.generateId();
    sessionStorage.setItem(key, newSession);
    sessionStorage.setItem(lastActiveKey, now.toString());
    sessionStorage.setItem('analytics_session_start', now.toString());
    return newSession;
  }

  private getSessionStartTime(): number {
    const start = sessionStorage.getItem('analytics_session_start');
    if (start) {
      const parsed = parseInt(start, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const now = Date.now();
    sessionStorage.setItem('analytics_session_start', now.toString());
    return now;
  }

  private updateActivity(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('analytics_session_last_active', Date.now().toString());
    }
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    }
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4, 10);
  }

  private detectDeviceInfo(): DeviceInfo {
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    let browser = 'Unknown';
    let os = 'Unknown';

    if (typeof window === 'undefined') {
      return { deviceType, browser, os };
    }

    const ua = navigator.userAgent;
    const width = window.innerWidth || 1200;

    // Device classification
    if (/tablet|ipad|playbook|silk/i.test(ua) || (width >= 600 && width <= 1024)) {
      deviceType = 'tablet';
    } else if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || width < 600) {
      deviceType = 'mobile';
    } else {
      deviceType = 'desktop';
    }

    // OS detection
    if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/win/i.test(ua)) os = 'Windows';
    else if (/mac/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    // Browser detection
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/opera|opr/i.test(ua)) browser = 'Opera';

    return { deviceType, browser, os };
  }
}

export const analytics = new AnalyticsTracker();
