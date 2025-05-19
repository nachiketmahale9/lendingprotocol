import { useState, useEffect } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import WelcomeScreen from './components/WelcomeScreen';
import { SolendProvider } from './contexts/SolendContext';

import './App.css';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  // Set up Solana network and wallet configuration
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolendProvider>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
              <Navbar />
              <MainContent />
            </div>
          </SolendProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function MainContent() {
  const { connected } = useWallet();

  return (
    <main className="container mx-auto px-4 py-8">
      {connected ? <Dashboard /> : <WelcomeScreen />}
    </main>
  );
}

export default App;