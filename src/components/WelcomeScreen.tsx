import { Shield, Wallet, Banknote, TrendingUp } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const WelcomeScreen = () => {
  return (
    <div className="flex flex-col items-center py-16 px-4 text-center">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
          Decentralized Lending on Solana
        </h1>
        <p className="text-xl text-gray-300 mb-10">
          Deposit assets to earn interest, borrow against your collateral, and manage your crypto portfolio in one secure platform.
        </p>

        <div className="mb-10">
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !px-8 !py-4 !text-lg rounded-lg transition-all duration-300 !shadow-lg hover:!shadow-blue-900/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mt-8">
        <FeatureCard
          icon={<Wallet className="h-10 w-10 text-blue-400" />}
          title="Connect Wallet"
          description="Use Phantom wallet to easily access your Solana assets."
        />
        <FeatureCard
          icon={<Banknote className="h-10 w-10 text-teal-400" />}
          title="Deposit Assets"
          description="Earn competitive interest rates on your deposits."
        />
        <FeatureCard
          icon={<TrendingUp className="h-10 w-10 text-yellow-400" />}
          title="Borrow Funds"
          description="Get loans using your crypto as collateral."
        />
        <FeatureCard
          icon={<Shield className="h-10 w-10 text-green-400" />}
          title="Secure Protocol"
          description="Smart contracts ensure transparency and security."
        />
      </div>

      <div className="mt-16 bg-gray-800/50 p-8 rounded-xl max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Current Interest Rates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RateCard symbol="SOL" apy="4.5%" direction="up" />
          <RateCard symbol="USDC" apy="6.2%" direction="up" />
          <RateCard symbol="ETH" apy="3.8%" direction="down" />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-xl hover:bg-gray-800 transition-colors duration-300 transform hover:scale-105">
      <div className="flex flex-col items-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-center">{description}</p>
      </div>
    </div>
  );
};

const RateCard = ({ symbol, apy, direction }) => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium">{symbol}</span>
        <span className={`text-lg font-bold ${direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {apy}
        </span>
      </div>
    </div>
  );
};

export default WelcomeScreen;