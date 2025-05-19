import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

// Mock data for demonstration purposes
const mockSuppliedAssets = [
  {
    symbol: 'SOL',
    name: 'Solana',
    balance: 1000,
    tokenBalance: 5.5,
    apy: 3.2,
    isCollateral: true,
    walletBalance: 10.2
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 245.32,
    tokenBalance: 245.32,
    apy: 5.1,
    isCollateral: true,
    walletBalance: 125.75
  }
];

const mockBorrowedAssets = [
  {
    symbol: 'USDT',
    name: 'Tether',
    balance: 150,
    tokenBalance: 150,
    apy: 8.2,
    collateralFactor: 75,
    availableToBorrow: 95.5
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 300,
    tokenBalance: 0.12,
    apy: 4.8,
    collateralFactor: 80,
    availableToBorrow: 0.35
  }
];

const mockLoans = [
  {
    id: '1',
    asset: {
      symbol: 'USDT',
      name: 'Tether'
    },
    amount: 150,
    tokenAmount: 150,
    interestRate: 8.2,
    collateralRatio: 250,
    minCollateralRatio: 150,
    healthFactor: 1.8
  },
  {
    id: '2',
    asset: {
      symbol: 'ETH',
      name: 'Ethereum'
    },
    amount: 300,
    tokenAmount: 0.12,
    interestRate: 4.8,
    collateralRatio: 180,
    minCollateralRatio: 150,
    healthFactor: 1.2
  }
];

const mockMarkets = [
  {
    symbol: 'SOL',
    name: 'Solana',
    totalSupply: 5850000,
    supplyTokens: 32500,
    supplyApy: 3.2,
    totalBorrowed: 3240000,
    borrowedTokens: 18000,
    borrowApy: 5.8,
    collateralFactor: 80
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    totalSupply: 12500000,
    supplyTokens: 12500000,
    supplyApy: 5.1,
    totalBorrowed: 9800000,
    borrowedTokens: 9800000,
    borrowApy: 8.2,
    collateralFactor: 85
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    totalSupply: 7800000,
    supplyTokens: 3120,
    supplyApy: 2.8,
    totalBorrowed: 4350000,
    borrowedTokens: 1740,
    borrowApy: 4.8,
    collateralFactor: 80
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    totalSupply: 9500000,
    supplyTokens: 9500000,
    supplyApy: 4.9,
    totalBorrowed: 7850000,
    borrowedTokens: 7850000,
    borrowApy: 8.2,
    collateralFactor: 75
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    totalSupply: 11250000,
    supplyTokens: 375,
    supplyApy: 1.8,
    totalBorrowed: 6750000,
    borrowedTokens: 225,
    borrowApy: 3.5,
    collateralFactor: 75
  }
];

const SolendContext = createContext(null);

export const SolendProvider = ({ children }) => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [suppliedAssets, setSuppliedAssets] = useState(mockSuppliedAssets);
  const [borrowedAssets, setBorrowedAssets] = useState(mockBorrowedAssets);
  const [loans, setLoans] = useState(mockLoans);
  const [markets, setMarkets] = useState(mockMarkets);
  const [loading, setLoading] = useState(false);

  // This would fetch real data from Solana in a production environment
  useEffect(() => {
    if (publicKey) {
      // In a real app, you would fetch data from Solana here
      console.log('Wallet connected:', publicKey.toString());
    }
  }, [publicKey, connection]);

  const executeTransaction = async (type, symbol, amount) => {
    setLoading(true);
    
    try {
      // Simulate a transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update state based on transaction type
      switch (type) {
        case 'deposit':
          // In a real app, you would create and send a Solana transaction here
          console.log(`Depositing ${amount} ${symbol}`);
          break;
        case 'withdraw':
          console.log(`Withdrawing ${amount} ${symbol}`);
          break;
        case 'borrow':
          console.log(`Borrowing ${amount} ${symbol}`);
          break;
        case 'repay':
          console.log(`Repaying ${amount} ${symbol}`);
          break;
        default:
          break;
      }
      
      return true;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SolendContext.Provider
      value={{
        suppliedAssets,
        borrowedAssets,
        loans,
        markets,
        loading,
        executeTransaction,
      }}
    >
      {children}
    </SolendContext.Provider>
  );
};

export const useSolend = () => {
  const context = useContext(SolendContext);
  if (!context) {
    throw new Error('useSolend must be used within a SolendProvider');
  }
  return context;
};