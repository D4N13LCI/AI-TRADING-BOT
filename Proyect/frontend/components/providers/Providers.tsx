'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { Web3Modal } from '@web3modal/react';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { WagmiConfig, createConfig } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id';

const metadata = {
  name: 'Trade Bionic',
  description: 'Sistema Automatizado de Trading',
  url: 'https://trade-bionic.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet, polygon, arbitrum];
const wagmiConfig = createConfig(
  w3mProvider({ projectId }),
  w3mConnectors({ chains, version: 2, projectId, metadata })
);

const ethereumClient = new EthereumClient(wagmiConfig, chains);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Web3Modal
          projectId={projectId}
          ethereumClient={ethereumClient}
          themeMode="dark"
          themeVariables={{
            '--w3m-font-family': 'Inter, sans-serif',
            '--w3m-accent-color': '#3b82f6',
          }}
        />
      </WagmiConfig>
    </QueryClientProvider>
  );
} 