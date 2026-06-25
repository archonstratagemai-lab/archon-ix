import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  verifyMembership,
  MembershipCheckError,
  MembershipTransportError,
} from "./alchemy";

// Hoisted mock so the `vi.mock` factory — which Vitest auto-moves to
// the top of the file, above all `import` statements — can reference
// it. `vi.hoisted` runs in a context where `vi.fn` is already
// available, before any imports.
//
// `mockGetNftsForOwner` is a SINGLE shared function referenced by
// every MockAlchemy instance's `nft.getNftsForOwner`. The lazy
// `_alchemy` singleton in `src/lib/alchemy.ts` caches the first
// MockAlchemy for the lifetime of the module — but because that
// cached instance's method IS this same shared function, individual
// tests can override its behavior per call via
// `mockGetNftsForOwner.mockResolvedValueOnce(...)` /
// `mockRejectedValueOnce(...)` without `vi.resetModules()` and
// without re-importing `alchemy.ts`. The earlier "future-test note"
// suggested `vi.resetModules()` was needed; that advice was wrong
// once we made the mock function shared.
const { mockGetNftsForOwner } = vi.hoisted(() => ({
  mockGetNftsForOwner: vi.fn(),
}));

vi.mock("alchemy-sdk", () => ({
  Alchemy: class MockAlchemy {
    nft = { getNftsForOwner: mockGetNftsForOwner };
  },
  Network: { BASE_MAINNET: "base-mainnet" },
}));

const ZERO = "0x0000000000000000000000000000000000000000";
const ENV_KEY = "VITE_ARCHON_CONTRACT_ADDRESS";
// Canonical dead-address sentinel used across the suite as the
// "configured contract" placeholder. Centralizing it means a future
// contract-address change is a one-token edit; `verifyMembership`
// reads only `ownedNfts.length`, so the literal's specific value is
// incidental — what matters is that it's stable across tests.
const TEST_CONTRACT = "0x000000000000000000000000000000000000dEaD";

describe("verifyMembership", () => {
  beforeEach(() => {
    // Reset any per-call overrides from the previous test, then set a
    // default rejection. Each test starts in a "SDK fails" baseline —
    // tests that expect a successful response queue a one-shot
    // `mockResolvedValueOnce(...)` in their own body.
    mockGetNftsForOwner.mockReset();
    mockGetNftsForOwner.mockRejectedValue(
      new Error("synthetic SDK rejection for test")
    );
    // Default contract address is empty so the "unset" path is the
    // starting state. `vi.stubEnv` propagates into `process.env`
    // under vitest 4.x; readEnv checks process.env first so the
    // stub takes effect even when import.meta.env has a baked value.
    vi.stubEnv(ENV_KEY, "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("throws MembershipCheckError when VITE_ARCHON_CONTRACT_ADDRESS is unset", async () => {
    // Misconfig guard fires BEFORE `getAlchemy()` is called, so the
    // mock never participates. Mocked SDK behavior is irrelevant here.
    await expect(verifyMembership(ZERO)).rejects.toBeInstanceOf(
      MembershipCheckError
    );
  });

  it("rethrows SDK rejections as MembershipTransportError", async () => {
    // Contract address is set → the lazy singleton calls the shared
    // `mockGetNftsForOwner`, which (default) rejects → `verifyMembership`'s
    // catch block rethrows as `MembershipTransportError`. This was the
    // originally-flaky assertion; the mock makes it deterministic.
    vi.stubEnv(ENV_KEY, TEST_CONTRACT);
    await expect(verifyMembership(ZERO)).rejects.toBeInstanceOf(
      MembershipTransportError
    );
  });

  it("never throws MembershipCheckError when contract address is set", async () => {
    // Sanity check on the routing: whatever happens downstream, the
    // misconfig guard must NOT fire. With the default rejection in
    // place, the SDK rejects → caught → rethrown as
    // `MembershipTransportError`, which is `not.toBeInstanceOf(MembershipCheckError)`.
    vi.stubEnv(ENV_KEY, TEST_CONTRACT);
    try {
      await verifyMembership(ZERO);
    } catch (err) {
      expect(err).not.toBeInstanceOf(MembershipCheckError);
    }
  });

  it("resolves false when the SDK returns no owned NFTs", async () => {
    // SUCCESS PATH, verified-false branch.
    //
    // The default `mockRejectedValue` would surface as
    // `MembershipTransportError`, so we override the shared mock for
    // exactly this one call with the shape the real `getNftsForOwner`
    // returns on an empty result — `{ ownedNfts: [] }`. The check
    // `result.ownedNfts.length > 0` is then `false`, so
    // `verifyMembership` resolves to `false` (this address does NOT
    // hold the contract).
    //
    // This is the test that closes the loop on the previous
    // "future-test note" — proves the success branch on a real-shape
    // SDK response, without depending on Alchemy's live behavior.
    mockGetNftsForOwner.mockResolvedValueOnce({ ownedNfts: [] });
    vi.stubEnv(ENV_KEY, TEST_CONTRACT);
    await expect(verifyMembership(ZERO)).resolves.toBe(false);
  });

  it("resolves true when the SDK returns at least one owned NFT", async () => {
    // SUCCESS PATH, verified-true branch.
    //
    // Mirrors the previous test but with one item in `ownedNfts`, so
    // `result.ownedNfts.length > 0` is `true` (the `verifyMembership`
    // check is by-presence, not by inspecting each entry's contract
    // address — the `contract.address` field we supply here is only
    // shape fidelity; the function never reads it). Together with
    // test 4, this closes branch coverage on the success side of
    // `verifyMembership`: empty → false, populated → true.
    mockGetNftsForOwner.mockResolvedValueOnce({
      ownedNfts: [
        { tokenId: "1", contract: { address: TEST_CONTRACT } },
      ],
    });
    vi.stubEnv(ENV_KEY, TEST_CONTRACT);
    await expect(verifyMembership(ZERO)).resolves.toBe(true);
  });
});
