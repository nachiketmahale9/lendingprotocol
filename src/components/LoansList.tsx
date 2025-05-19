import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useSolend } from '../contexts/SolendContext';

const LoansList = () => {
  const { loans } = useSolend();

  if (loans.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-900/50 rounded-lg">
        <p className="text-gray-400">No active loans</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-gray-400 text-sm">
            <th className="text-left pb-4 pl-4">Borrowed Asset</th>
            <th className="text-right pb-4">Amount</th>
            <th className="text-right pb-4">Interest Rate</th>
            <th className="text-right pb-4">Collateral Ratio</th>
            <th className="text-right pb-4 pr-4">Health</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <LoanRow key={loan.id} loan={loan} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LoanRow = ({ loan }) => {
  const getHealthColor = (health) => {
    if (health > 1.5) return 'text-green-400';
    if (health > 1.2) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthIcon = (health) => {
    if (health > 1.5) return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    if (health > 1.2) return <TrendingUp className="h-5 w-5 text-yellow-400" />;
    return <AlertCircle className="h-5 w-5 text-red-400" />;
  };

  return (
    <tr className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors duration-200">
      <td className="py-4 pl-4">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-gray-600 flex items-center justify-center mr-3">
            <span className="font-bold text-sm">{loan.asset.symbol.charAt(0)}</span>
          </div>
          <div>
            <div className="font-medium">{loan.asset.name}</div>
            <div className="text-gray-400 text-sm">{loan.asset.symbol}</div>
          </div>
        </div>
      </td>
      <td className="text-right py-4">
        <div className="font-medium">${loan.amount.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">
          {loan.tokenAmount.toLocaleString()} {loan.asset.symbol}
        </div>
      </td>
      <td className="text-right py-4">
        <div className="font-medium text-red-400">{loan.interestRate}%</div>
        <div className="text-gray-400 text-sm">Variable</div>
      </td>
      <td className="text-right py-4">
        <div className="font-medium">{loan.collateralRatio}%</div>
        <div className="text-gray-400 text-sm">Min: {loan.minCollateralRatio}%</div>
      </td>
      <td className="text-right py-4 pr-4">
        <div className="flex items-center justify-end space-x-2">
          <span className={`font-medium ${getHealthColor(loan.healthFactor)}`}>
            {loan.healthFactor.toFixed(2)}
          </span>
          {getHealthIcon(loan.healthFactor)}
        </div>
      </td>
    </tr>
  );
};

export default LoansList;