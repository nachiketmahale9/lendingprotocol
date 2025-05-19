# SolendX: Decentralized Lending Protocol

A decentralized lending protocol built on Solana that enables users to deposit assets, earn interest, and borrow against their collateral.

## Features

- Connect Phantom wallet to interact with Solana blockchain
- Deposit assets to earn interest
- Borrow assets using your deposits as collateral
- View real-time interest rates and loan status
- Manage collateral and monitor liquidation risks
- Track transaction history and portfolio analytics

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (for Solana smart contract development)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://project-serum.github.io/anchor/getting-started/installation.html) (v0.25.0 or higher)
- [Phantom Wallet](https://phantom.app/) browser extension


## Setup Instructions

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the provided local server URL.

### Smart Contract Setup

1. Navigate to the contracts directory:
```bash
cd src/contracts
```

2. Build the Anchor program:
```bash
anchor build
```

3. Deploy to Solana localnet (for testing):
```bash
anchor deploy
```

4. For testnet deployment:
```bash
solana config set --url devnet
anchor deploy
```

## Testing

### Frontend Testing

1. Run the test suite:
```bash
npm test
```

### Smart Contract Testing

1. Navigate to the contracts directory:
```bash
cd src/contracts
```

2. Run Anchor tests:
```bash
anchor test
```

## Contract Architecture

The protocol is built with the following smart contract components:

1. **Reserve**: Manages token reserves, interest rates, and collateral factors
2. **UserDeposit**: Tracks user deposits for a specific reserve
3. **UserBorrow**: Tracks user borrows for a specific reserve

### Key Functions

- `initialize_reserve`: Creates a new lending pool for a specific token
- `deposit`: Allows users to deposit assets into the protocol
- `withdraw`: Enables users to withdraw their deposited assets
- `borrow`: Allows users to borrow assets against their collateral
- `repay`: Enables users to repay borrowed assets

## Security Considerations

The protocol implements several security measures:

- Collateral factor to ensure loans are always over-collateralized
- Liquidation mechanism to maintain protocol solvency
- Access control to protect user funds
- Comprehensive testing to prevent vulnerabilities

## License

MIT