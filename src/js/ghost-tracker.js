/**
 * ARCHON-IX | Ghost Protocol Tracker
 * --------------------------------------------------------------
 * Captures lightweight client telemetry into localStorage so the
 * sovereign audit trail survives reloads.
 *
 *   ghost.track(eventName, payload?)
 *   ghost.flush()      -> pushes buffered events to a mock endpoint
 *   ghost.export()     -> returns raw persisted events
 *   ghost.clear()      -> wipes local storage
 *
 * Tracked events:
 *   - pageview       (with referrer, viewport size, timestamp)
 *   - scroll-depth   (25 / 50 / 75 / 100% milestones)
 *   - click          (tag, text, href, id of nearest actionable)
 *   - custom         (pass-through for other modules)
 *
 * NOTE: No third-party trackers, no cookies, no fingerprints.
 *       All data is local-only unless/until a backend ingest endpoint
 *       is configured via GHOST_INGEST_URL.
 */

// TODO(realtime): Replace mock flush with a fetch to /api/ghost-ingest
// const GHOST_INGEST_URL = '/api/ghost-ingest'; // Serverless proxy
const GHOST_STORAGE_KEY = 'archon-ix.ghost.events';
const GHOST_MILESTONES = [25, 50, 75, 100];

export class GhostTracker {
  constructor() {
    this.sessionId = this._ensureSessionId();
    this.startedAt = Date.now();
    this._milestonesHit = new Set();
    this._bound = false;
  }

  // -------------------------------------------------------- API

  init() {
    if (this._bound) return;
    this._bound = true;

    this.track('pageview', {
      referrer: document.referrer || 'direct',
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      path: location.pathname,
    });

    window.addEventListener('scroll', this._onScroll.bind(this), { passive: true });
    document.addEventListener('click', this._onClick.bind(this), { passive: true });

    // Best-effort flush on tab close.
    window.addEventListener('beforeunload', () => this.flush());
  }

  track(eventName, payload = {}) {
    const event = {
      id: this._uuid(),
      t: Date.now(),
      session: this.sessionId,
      type: eventName,
      ...payload,
    };
    this._buffer(event);
    return event;
  }

  flush() {
    const events = this.export();
    if (!events.length) return;

    // TODO(realtime):
    // if (GHOST_INGEST_URL) {
    //   navigator.sendBeacon?.(GHOST_INGEST_URL, JSON.stringify(events));
    // }

    // Mock endpoint — visible audit trail in console.
    console.info('[Ghost Tracker] flush', events);
  }

  export() {
    try {
      const raw = localStorage.getItem(GHOST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('[Ghost Tracker] export parse failed', err);
      return [];
    }
  }

  clear() {
    localStorage.removeItem(GHOST_STORAGE_KEY);
    this._milestonesHit.clear();
  }

  // ----------------------------------------------------- Internals

  _onScroll() {
    const doc = document.documentElement;
    const max = (doc.scrollHeight - doc.clientHeight) || 1;
    const pct = Math.min(100, Math.max(0, Math.round((window.scrollY / max) * 100)));

    for (const m of GHOST_MILESTONES) {
      if (pct >= m && !this._milestonesHit.has(m)) {
        this._milestonesHit.add(m);
        this.track('scroll-depth', { percent: m });
      }
    }
  }

  _onClick(event) {
    const el = event.target instanceof Element ? event.target : null;
    if (!el) return;

    const actionable = el.closest('a, button, [role="button"], input[type="submit"]');
    if (!actionable) return;

    this.track('click', {
      tag: actionable.tagName.toLowerCase(),
      id: actionable.id || null,
      text: (actionable.textContent || '').trim().slice(0, 80) || null,
      href: actionable instanceof HTMLAnchorElement ? actionable.href : null,
    });
  }

  _buffer(event) {
    try {
      const events = this.export();
      events.push(event);
      // Cap to last 500 events so localStorage doesn't grow unbounded.
      const trimmed = events.length > 500 ? events.slice(-500) : events;
      localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (err) {
      console.warn('[Ghost Tracker] buffer write failed', err);
    }
  }

  _ensureSessionId() {
    const KEY = 'archon-ix.ghost.session';
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = this._uuid();
      try { sessionStorage.setItem(KEY, id); } catch { /* ignore */ }
    }
    return id;
  }

  _uuid() {
    // RFC4122-ish v4 — sufficient for client-side correlation.
    if (window.crypto?.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
