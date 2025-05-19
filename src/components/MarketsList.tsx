import { ExternalLink } from 'lucide-react';
import { useSolend } from '../contexts/SolendContext';

const MarketsList = () => {
  const { markets } = useSolend();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-gray-400 text-sm">
            <th className="text-left pb-4 pl-4">Asset</th>
            <th className="text-right pb-4">Total Supply</th>
            <th className="text-right pb-4">Supply APY</th>
            <th className="text-right pb-4">Total Borrowed</th>
            <th className="text-right pb-4">Borrow APY</th>
            <th className="text-right pb-4 pr-4">Collateral Factor</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market) => (
            <MarketRow key={market.symbol} market={market} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MarketRow = ({ market }) => {
  return (
    <tr className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors duration-200">
      <td className="py-4 pl-4">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-gray-600 flex items-center justify-center mr-3">
            <span className="font-bold text-sm">{market.symbol.charAt(0)}</span>
          </div>
          <div>
            <div className="font-medium">{market.name}</div>
            <div className="text-gray-400 text-sm">{market.symbol}</div>
          </div>
        </div>
      </td>
      <td className="text-right py-4">
        <div className="font-medium">${market.totalSupply.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">
          {market.supplyTokens.toLocaleString()} {market.symbol}
        </div>
      </td>
      <td className="text-right py-4">
        <div className="font-medium text-green-400">+{market.supplyApy}%</div>
      </td>
      <td className="text-right py-4">
        <div className="font-medium">${market.totalBorrowed.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">
          {market.borrowedTokens.toLocaleString()} {market.symbol}
        </div>
      </td>
      <td className="text-right py-4">
        <div className="font-medium text-red-400">{market.borrowApy}%</div>
      </td>
      <td className="text-right py-4 pr-4">
        <div className="flex items-center justify-end space-x-2">
          <span className="font-medium">{market.collateralFactor}%</span>
          <a
            href="#"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            title="View market details"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </td>
    </tr>
  );
};

export default MarketsList;