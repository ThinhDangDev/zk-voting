# ZK Voting Client

A modern React + Vite + TypeScript client application for the ZK Voting system, featuring shadcn/ui components and Tailwind CSS.

## Features

- 🔐 **Wallet Integration** - MetaMask connection with automatic account detection
- 🗳️ **Secure Voting** - Zero-knowledge proof voting with elliptic curve cryptography
- 📊 **Real-time Results** - Live proposal updates and vote tallying
- 🎨 **Modern UI** - Beautiful interface built with shadcn/ui and Tailwind CSS
- ⚡ **Fast Development** - Vite for lightning-fast hot reload
- 🔒 **Type Safety** - Full TypeScript support

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Ethers.js** - Ethereum library for wallet interaction
- **@noble/secp256k1** - Elliptic curve cryptography

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Hardhat node running locally

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Environment Setup

Create a `.env.local` file in the root directory:

```env
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_RPC_URL=http://localhost:8545
```

## Usage

### 1. Connect Wallet

- Click "Connect MetaMask" to connect your wallet
- Make sure you're on the correct network (localhost:8545)

### 2. Create Proposal

- Click "Create New Proposal"
- Fill in the proposal details:
  - Description of the vote
  - Candidate addresses (one per line)
  - Eligible voter addresses (one per line)
  - Voting duration in hours
- Click "Create Proposal"

### 3. Vote

- View active proposals in the grid
- Click on a candidate to cast your vote
- Your vote is encrypted using zero-knowledge proofs

### 4. View Results

- After the voting period ends, click "View Results"
- See the decrypted vote counts for each candidate

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── WalletConnect.tsx
│   ├── CreateProposalForm.tsx
│   └── ProposalCard.tsx
├── hooks/              # Custom React hooks
│   ├── useWallet.ts
│   └── useZkVoting.ts
├── lib/                # Utilities and libraries
│   ├── zk-voting/     # ZK voting library
│   ├── abi/           # Contract ABI
│   ├── config.ts      # App configuration
│   └── utils.ts       # Utility functions
└── App.tsx            # Main app component
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Components

Use shadcn/ui CLI to add new components:

```bash
npx shadcn@latest add [component-name]
```

### Styling

- Use Tailwind CSS classes for styling
- Follow the design system established by shadcn/ui
- Use the `cn()` utility for conditional classes

## Security Features

- **Zero-Knowledge Proofs** - Votes are private and verifiable
- **Merkle Tree Verification** - Only eligible voters can participate
- **Elliptic Curve Encryption** - Secure vote encryption using secp256k1
- **Commitment Scheme** - Prevents vote manipulation

## Troubleshooting

### Common Issues

1. **MetaMask not detected**

   - Make sure MetaMask is installed and enabled
   - Check that you're on the correct network

2. **Contract not found**

   - Verify the contract address in `.env.local`
   - Make sure Hardhat node is running
   - Deploy the contract if needed

3. **Vote fails**
   - Check that you're an eligible voter
   - Ensure the voting period is active
   - Verify you haven't already voted

### Getting Help

- Check the browser console for error messages
- Verify your wallet connection
- Ensure the contract is properly deployed

## License

MIT License - see LICENSE file for details
