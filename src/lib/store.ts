import { create } from "zustand";
import {
  verifyMembership,
  MembershipCheckError,
  MembershipTransportError,
} from "./alchemy";

interface StoreState {
  isVerified: boolean;
  lastChecked: number | null; // epoch ms for cache
  /** Set when a verify attempt couldn't complete (env misconfig or
   *  Alchemy transport failure). Drives the "Couldn't reach Alchemy"
   *  state in `VerificationGate` instead of a generic "not a member"
   *  message. Cleared on every successful verify and on each new
   *  verify() call entry. */
  lastError?: string;
  checking: boolean;
  /** `force: true` bypasses the 5-minute result cache — used by the
   *  Retry button in `VerificationGate` so the user actually retries. */
  verify: (address: string, opts?: { force?: boolean }) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  isVerified: false,
  lastChecked: null,
  checking: false,
  async verify(address: string, opts?: { force?: boolean }) {
    const now = Date.now();
    // 5-minute cache to respect Alchemy rate limits — but the Retry
    // button explicitly opts out via { force: true }.
    if (
      !opts?.force &&
      get().lastChecked &&
      now - get().lastChecked! < 5 * 60 * 1000
    ) {
      return;
    }
    // Clear any stale error before kicking off a fresh attempt so the
    // UI doesn't keep showing the previous failure while the new call
    // is in flight.
    set({ checking: true, lastError: undefined });
    try {
      const verified = await verifyMembership(address);
      set({ isVerified: verified, lastChecked: now, lastError: undefined });
    } catch (err) {
      // Both error types keep `isVerified: false` so we visually
      // distinguish them from the genuine "you don't hold one" case.
      const msg = err instanceof Error ? err.message : String(err);
      if (err instanceof MembershipCheckError) {
        console.warn("[store] verify aborted (misconfigured):", msg);
      } else if (err instanceof MembershipTransportError) {
        console.warn("[store] verify unavailable (transport error):", msg);
      } else {
        console.warn("[store] verify failed unexpectedly:", msg);
      }
      set({ isVerified: false, lastChecked: now, lastError: msg });
    } finally {
      set({ checking: false });
    }
  },
}));