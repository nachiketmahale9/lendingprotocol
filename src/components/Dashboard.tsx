import { useState } from 'react';
import { Coins, TrendingUp, ArrowDownCircle, ArrowUpCircle, PiggyBank, BarChart4 } from 'lucide-react';
import AssetList from './AssetList';
import LoansList from './LoansList';
import MarketsList from './MarketsList';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart4 className="h-5 w-5" /> },
    { id: 'supply', label: 'Supply', icon: <ArrowUpCircle className="h-5 w-5" /> },
    { id: 'borrow', label: 'Borrow', icon: <ArrowDownCircle className="h-5 w-5" /> },
    { id: 'markets', label: 'Markets', icon: <TrendingUp className="h-5 w-5" /> },
  ];

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Supply Balance"
          value="1,245.32"
          change="+5.2%"
          direction="up"
          icon={<ArrowUpCircle className="h-10 w-10 text-green-400" />}
        />
        <StatsCard
          title="Borrow Balance"
          value="450.00"
          change="-2.1%"
          direction="down"
          icon={<ArrowDownCircle className="h-10 w-10 text-orange-400" />}
        />
        <StatsCard
          title="Net APY"
          value="4.8%"
          change="+0.3%"
          direction="up"
          icon={<PiggyBank className="h-10 w-10 text-blue-400" />}
        />
      </div>

      <div className="bg-gray-800 rounded-xl p-1 flex mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex-1 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'supply' && <SupplyTab />}
        {activeTab === 'borrow' && <BorrowTab />}
        {activeTab === 'markets' && <MarketsTab />}
      </div>
    </div>
  );
};

const OverviewTab = () => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Your Supplied Assets</h3>
        <AssetList type="supply" />
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4">Your Loans</h3>
        <LoansList />
      </div>
    </div>
  );
};

const SupplyTab = () => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Supply Assets</h3>
      <p className="text-gray-400 mb-6">
        Deposit your assets to earn interest. Your deposited assets serve as collateral for borrowing.
      </p>
      <AssetList type="supply" showAction />
    </div>
  );
};

const BorrowTab = () => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Borrow Assets</h3>
      <p className="text-gray-400 mb-6">
        Borrow assets against your supplied collateral. Monitor your health factor to avoid liquidation.
      </p>
      <AssetList type="borrow" showAction />
    </div>
  );
};

const MarketsTab = () => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Markets</h3>
      <p className="text-gray-400 mb-6">
        View all available markets, current rates, and total liquidity.
      </p>
      <MarketsList />
    </div>
  );
};

const StatsCard = ({ title, value, change, direction, icon }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 transition-transform duration-300 hover:transform hover:scale-105">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">${value}</span>
            <span
              className={`ml-2 text-sm font-medium ${
                direction === 'up' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {change}
            </span>
          </div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">{icon}</div>
      </div>
    </div>
  );
};

export default Dashboard;