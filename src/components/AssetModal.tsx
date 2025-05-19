import { useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import { useSolend } from '../contexts/SolendContext';

const AssetModal = ({ asset, type, onClose }) => {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null); // null, 'pending', 'success', 'error'
  const [error, setError] = useState('');
  const { executeTransaction } = useSolend();

  const getTitle = () => {
    switch (type) {
      case 'deposit': return `Supply ${asset.symbol}`;
      case 'withdraw': return `Withdraw ${asset.symbol}`;
      case 'borrow': return `Borrow ${asset.symbol}`;
      case 'repay': return `Repay ${asset.symbol}`;
      default: return 'Asset Transaction';
    }
  };

  const getBalanceText = () => {
    switch (type) {
      case 'deposit': return `Wallet Balance: ${asset.walletBalance || 0} ${asset.symbol}`;
      case 'withdraw': return `Supplied Balance: ${asset.tokenBalance || 0} ${asset.symbol}`;
      case 'borrow': return `Available to Borrow: ${asset.availableToBorrow || 0} ${asset.symbol}`;
      case 'repay': return `Borrowed Amount: ${asset.tokenBalance || 0} ${asset.symbol}`;
      default: return '';
    }
  };

  const getButtonText = () => {
    if (status === 'pending') return 'Processing...';
    
    switch (type) {
      case 'deposit': return 'Supply';
      case 'withdraw': return 'Withdraw';
      case 'borrow': return 'Borrow';
      case 'repay': return 'Repay';
      default: return 'Confirm';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setStatus('pending');
    setError('');

    try {
      // This would call the actual transaction function
      await executeTransaction(type, asset.symbol, parseFloat(amount));
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Transaction failed. Please try again.');
    }
  };

  const handleSetMax = () => {
    // This would set the maximum amount based on available balance
    // For simplicity, just setting a mock value
    const maxAmount = 
      type === 'deposit' ? asset.walletBalance :
      type === 'withdraw' ? asset.tokenBalance :
      type === 'borrow' ? asset.availableToBorrow :
      asset.tokenBalance;
    
    setAmount(maxAmount?.toString() || '0');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 py-6">
      <div 
        className="bg-gray-800 rounded-xl max-w-md w-full shadow-lg transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold">{getTitle()}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="p-6 flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-green-900/30 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-400" />
            </div>
            <h4 className="text-xl font-medium mb-2">Transaction Successful</h4>
            <p className="text-gray-400 text-center mb-6">
              Your {type} transaction has been processed successfully.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="amount" className="text-sm text-gray-400 font-medium">
                  Amount
                </label>
                <span className="text-sm text-gray-400">
                  {getBalanceText()}
                </span>
              </div>
              <div className="flex items-center">
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-l-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  disabled={status === 'pending'}
                />
                <div className="bg-gray-700 border border-gray-600 rounded-r-lg px-4 py-3 text-gray-300 border-l-0">
                  {asset.symbol}
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  disabled={status === 'pending'}
                >
                  Max
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/30 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                status === 'pending'
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={status === 'pending'}
            >
              {getButtonText()}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssetModal;