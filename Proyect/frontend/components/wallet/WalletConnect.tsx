'use client';

import React from 'react';
import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useDisconnect } from 'wagmi';
import { WalletIcon } from '@heroicons/react/24/outline';

export function WalletConnect() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatAddress(address)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      <WalletIcon className="h-4 w-4" />
      <span>Conectar Wallet</span>
    </button>
  );
} 