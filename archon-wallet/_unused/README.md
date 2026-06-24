# Quarantined Files

These files reference `@account-kit/react`, which is **not** installed in `package.json` — they would fail any future typecheck pass that covers the whole repo.

They are kept here (instead of being deleted) so the Account Kit integration can be revived cleanly.

| Old location                       | Move back to                  |
|------------------------------------|-------------------------------|
| `_unused/lib/accountKit.ts`        | `../lib/accountKit.ts`        |
| `_unused/lib/alchemyClient.ts`     | `../lib/alchemyClient.ts`     |
| `_unused/lib/paymaster.ts`         | `../lib/paymaster.ts`         |
| `_unused/lib/gasless.ts`           | `../../src/lib/gasless.ts`    |
| `_unused/components/AuthButton.tsx`   | `../components/AuthButton.tsx`   |
| `_unused/components/WalletStatus.tsx` | `../components/WalletStatus.tsx` |
| `_unused/components/SponsoredTx.tsx`  | `../components/SponsoredTx.tsx`  |
| `_unused/main.tsx`                 | `../main.tsx`                 |
| `_unused/index.html`               | `../index.html`               |

## Revival checklist

1. `npm i @account-kit/react @account-kit/core` (plus any peer packages).
2. Move the files back as shown above.
3. Wire `<AuthButton />` / `<WalletStatus />` / `<SponsoredTx />` into `src/App.tsx` instead of the wagmi-based connector.
