import { Alchemy, Network } from "alchemy-sdk";

// `import.meta.env` is only populated in a Vite build; in Node it is undefined.
// We cast to a narrow shape (not `any`) so this module compiles cleanly for
// both consumers without dragging in `vite/client` types here.
type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, string | undefined>;
};

/**
 * Reads a Vite-prefixed env var from `import.meta.env` first, then falls
 * back to `process.env`. Re-reads on every call so test-time stubs
 * (`vi.stubEnv` under vitest) actually propagate, instead of capturing
 * a stale snapshot at module-load time.
 */
function readEnv(name: string): string | undefined {
  // Check process.env first — vitest can stub this via vi.stubEnv.
  // In the browser, process is polyfilled as {} by Vite's define config.
  if (typeof process !== "undefined") {
    const v = process.env?.[name];
    if (v !== undefined) return v;
  }
  // Fall back to Vite's import.meta.env (baked at build time from .env).
  const env = (import.meta as ImportMetaWithEnv).env;
  return env?.[name];
}

/**
 * Thrown when the membership check is invoked without required env vars —
 * distinct from a "verified, not a member" negative result so callers can
 * surface a "test misconfigured" message separately from "no NFTs found".
 */
export class MembershipCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MembershipCheckError";
  }
}

/**
 * Thrown when the membership check made it past env-var validation but
 * the underlying Alchemy call could not complete (auth failure, network,
 * rate-limit, 5xx, etc.). Distinct from `MembershipCheckError` so callers
 * can:
 *   - treat misconfig as "not a member" (UI hardens itself),
 *   - treat transport failure as "couldn't verify" (smoke test exits
 *     non-zero so CI catches it instead of silently passing).
 */
export class MembershipTransportError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "MembershipTransportError";
  }
}

// Lazy singleton: defer SDK construction so an import of this module cannot
// crash, even if the SDK constructor balks at an empty/demo apiKey.
// Lazy Alchemy singleton. `new Alchemy(...)` doesn't open a network
// connection, so deferring construction until first use keeps the
// module hydrated without firing any request when env vars are missing.
let _alchemy: Alchemy | null = null;
function getAlchemy(): Alchemy {
  if (!_alchemy) {
    const apiKey = readEnv("VITE_ALCHEMY_API_KEY");
    _alchemy = new Alchemy({
      apiKey: apiKey || "demo",
      network: Network.BASE_MAINNET,
    });
  }
  return _alchemy;
}

/**
 * Returns true if `address` holds at least one ARCHON‑IX Membership NFT.
 *
 * - Throws `MembershipCheckError` on operator misconfiguration (no
 *   `VITE_ARCHON_CONTRACT_ADDRESS`). Smoke test exits non-zero.
 * - Throws `MembershipTransportError` on Alchemy API failure (auth,
 *   network, 5xx). Smoke test exits non-zero; UI coalesces to "not
 *   verified" via store.ts.
 * - Returns true/false only when the API call succeeded and the
 *   address either holds or does not hold a Membership NFT.
 */
export async function verifyMembership(address: string): Promise<boolean> {
  const contractAddress = readEnv("VITE_ARCHON_CONTRACT_ADDRESS");
  if (!contractAddress) {
    throw new MembershipCheckError(
      "VITE_ARCHON_CONTRACT_ADDRESS is not set — cannot verify membership."
    );
  }
  try {
    // `getNftsForOwner` takes `owner` as the first positional arg and
    // an options object second — not a single options object. The
    // previous shape made `owner`/`contractAddresses` properties on
    // an object the SDK doesn't accept, which TS caught at the call
    // site. (alchemy-sdk 3.x signature.)
    const result = await getAlchemy().nft.getNftsForOwner(address, {
      contractAddresses: [contractAddress],
    });
    return result.ownedNfts.length > 0;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Rethrow as a project-owned error so callers can distinguish
    // "the API failed" from "verified, no NFTs". The smoke test uses
    // this signal to exit non-zero on either error type.
    throw new MembershipTransportError(msg, err);
  }
}
