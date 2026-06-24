import { verifyMembership } from "./src/lib/alchemy.ts";

const testAddr = "0x0000000000000000000000000000000000000000";

async function main(): Promise<void> {
  console.log(`Checking ARCHON-IX membership for ${testAddr} ...`);
  const ok = await verifyMembership(testAddr);
  console.log("Membership verified?", ok);
}

main().catch((e) => {
  // Use an explicit exit() rather than process.exitCode — the latter was
  // observed to round-trip as 0 through the npm-script wrapper. We want
  // misconfiguration AND transport failure to surface clearly to CI.
  const name = e instanceof Error ? e.name : "Error";
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`Membership check failed (${name}):`, msg);
  process.exit(1);
});
