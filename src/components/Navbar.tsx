import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Banknote, Activity, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { connected } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900 border-b border-gray-800 py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Banknote className="h-8 w-8 text-blue-400" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            SolendX
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {connected && (
            <>
              <NavItem icon={<Banknote className="h-5 w-5" />} label="Markets" />
              <NavItem icon={<Activity className="h-5 w-5" />} label="Portfolio" />
            </>
          )}
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 rounded-lg transition-all duration-200" />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 px-6 space-y-4">
          {connected && (
            <>
              <NavItem mobile icon={<Banknote className="h-5 w-5" />} label="Markets" />
              <NavItem mobile icon={<Activity className="h-5 w-5" />} label="Portfolio" />
            </>
          )}
          <div className="pt-2">
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 rounded-lg transition-all duration-200 w-full" />
          </div>
        </div>
      )}
    </nav>
  );
};

const NavItem = ({ icon, label, mobile = false }) => {
  return (
    <a
      href="#"
      className={`flex items-center ${
        mobile ? 'py-3 border-b border-gray-800' : ''
      } text-gray-300 hover:text-white transition-colors duration-200`}
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
    </a>
  );
};

export default Navbar;