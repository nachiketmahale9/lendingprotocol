import { PlusCircle, MinusCircle } from 'lucide-react';
import { useState } from 'react';
import AssetModal from './AssetModal';
import { useSolend } from '../contexts/SolendContext';

const AssetList = ({ type = 'supply', showAction = false }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [modalType, setModalType] = useState(null);
  const { suppliedAssets, borrowedAssets } = useSolend();
  
  const assets = type === 'supply' ? suppliedAssets : borrowedAssets;

  const openModal = (asset, action) => {
    setSelectedAsset(asset);
    setModalType(action);
  };

  const closeModal = () => {
    setSelectedAsset(null);
    setModalType(null);
  };

  if (assets.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-900/50 rounded-lg">
        <p className="text-gray-400">No {type === 'supply' ? 'supplied' : 'borrowed'} assets yet</p>
        {showAction && (
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
            onClick={() => openModal({ symbol: 'SOL', name: 'Solana' }, type === 'supply' ? 'deposit' : 'borrow')}
          >
            {type === 'supply' ? 'Supply an asset' : 'Borrow an asset'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="text-left pb-4 pl-4">Asset</th>
              <th className="text-right pb-4">Balance</th>
              <th className="text-right pb-4">APY</th>
              <th className="text-right pb-4 pr-4">Collateral</th>
              {showAction && <th className="text-right pb-4 pr-4">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <AssetRow 
                key={asset.symbol} 
                asset={asset} 
                type={type} 
                showAction={showAction} 
                openModal={openModal} 
              />
            ))}
          </tbody>
        </table>
      </div>

      {modalType && selectedAsset && (
        <AssetModal 
          asset={selectedAsset}
          type={modalType}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

const AssetRow = ({ asset, type, showAction, openModal }) => {
  return (
    <tr className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors duration-200">
      <td className="py-4 pl-4">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-gray-600 flex items-center justify-center mr-3">
            <span className="font-bold text-sm">{asset.symbol.charAt(0)}</span>
          </div>
          <div>
            <div className="font-medium">{asset.name}</div>
            <div className="text-gray-400 text-sm">{asset.symbol}</div>
          </div>
        </div>
      </td>
      <td className="text-right py-4">
        <div className="font-medium">${asset.balance.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">{asset.tokenBalance.toLocaleString()} {asset.symbol}</div>
      </td>
      <td className="text-right py-4">
        <div className={`font-medium ${type === 'supply' ? 'text-green-400' : 'text-red-400'}`}>
          {type === 'supply' ? '+' : '-'}{asset.apy}%
        </div>
      </td>
      <td className="text-right py-4 pr-4">
        {type === 'supply' && (
          <div className={`text-sm font-medium ${asset.isCollateral ? 'text-green-400' : 'text-gray-400'}`}>
            {asset.isCollateral ? 'Yes' : 'No'}
          </div>
        )}
        {type === 'borrow' && (
          <div className="text-sm font-medium text-gray-300">
            {asset.collateralFactor}%
          </div>
        )}
      </td>
      {showAction && (
        <td className="text-right py-4 pr-4">
          <div className="flex space-x-2 justify-end">
            {type === 'supply' && (
              <>
                <ActionButton
                  icon={<PlusCircle className="h-4 w-4" />}
                  label="Supply"
                  onClick={() => openModal(asset, 'deposit')}
                  primary
                />
                <ActionButton
                  icon={<MinusCircle className="h-4 w-4" />}
                  label="Withdraw"
                  onClick={() => openModal(asset, 'withdraw')}
                />
              </>
            )}
            {type === 'borrow' && (
              <>
                <ActionButton
                  icon={<PlusCircle className="h-4 w-4" />}
                  label="Borrow"
                  onClick={() => openModal(asset, 'borrow')}
                  primary
                />
                <ActionButton
                  icon={<MinusCircle className="h-4 w-4" />}
                  label="Repay"
                  onClick={() => openModal(asset, 'repay')}
                />
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

const ActionButton = ({ icon, label, onClick, primary = false }) => {
  return (
    <button
      className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
        primary 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
      onClick={onClick}
    >
      <span className="mr-1">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default AssetList;