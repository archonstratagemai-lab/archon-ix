import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountKitProvider } from '@account-kit/react';
import { accountKitConfig } from './lib/accountKit';
import { Header } from './components/Header';
import { AuthButton } from './components/AuthButton';
import { WalletStatus } from './components/WalletStatus';
import { SponsoredTx } from './components/SponsoredTx';
import { tg } from '../src/lib/telegram';

// Initialise a React Query client – required by Wagmi (which Account Kit uses internally).
const queryClient = new QueryClient();

function MiniApp() {
  // Show Telegram back button when running inside the Mini App webview.
  useEffect(() => {
    try {
      tg.BackButton.show();
      tg.BackButton.onClick(() => window.history.back());
      return () => tg.BackButton.hide();
    } catch {
      return undefined;
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 p-4 flex flex-col items-center gap-4">
        <AuthButton />
        <WalletStatus />
        <SponsoredTx />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <AccountKitProvider config={accountKitConfig}>
    <QueryClientProvider client={queryClient}>
      <MiniApp />
    </QueryClientProvider>
  </AccountKitProvider>
);
