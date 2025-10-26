# 🚀 No-Gas Ethereum Development Setup

## Quick Start (5 minutes)

### Step 1: Get Free Testnet ETH

Choose one of these options:

#### Option A: Sepolia (Ethereum Testnet)

1. Go to https://sepoliafaucet.com/
2. Enter your wallet address
3. Get 0.5 ETH (free!)

#### Option B: Mumbai (Polygon Testnet) - **RECOMMENDED**

1. Go to https://faucet.polygon.technology/
2. Enter your wallet address
3. Get 0.1 MATIC (free!)

### Step 2: Deploy Contract

```bash
# Go to the zk-voting directory
cd ../zk-voting

# Deploy to Sepolia
npx hardhat run scripts/deploy-testnet.ts --network sepolia

# OR deploy to Mumbai (faster)
npx hardhat run scripts/deploy-testnet.ts --network mumbai
```

### Step 3: Setup Client App

```bash
# Go to the client directory
cd ../zk-voting-client

# Setup environment (replace with your contract address)
node scripts/setup-testnet.js 0x[YOUR_CONTRACT_ADDRESS] https://sepolia.infura.io/v3/YOUR_KEY

# Start the app
npm run dev
```

### Step 4: Add Network to MetaMask

#### For Sepolia:

- **Network Name**: Sepolia Testnet
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
- **Chain ID**: 11155111
- **Currency Symbol**: ETH

#### For Mumbai:

- **Network Name**: Mumbai Testnet
- **RPC URL**: https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY
- **Chain ID**: 80001
- **Currency Symbol**: MATIC

## 🔧 Detailed Setup

### 1. Get Infura/Alchemy API Key

1. Go to https://infura.io or https://alchemy.com
2. Create free account
3. Create new project
4. Copy your API key

### 2. Configure Hardhat

Update `hardhat.config.ts`:

```typescript
networks: {
  sepolia: {
    url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: [process.env.PRIVKEY]
  },
  mumbai: {
    url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: [process.env.PRIVKEY]
  }
}
```

### 3. Set Environment Variables

Create `.env` file in zk-voting directory:

```env
PRIVKEY=your_private_key_without_0x
INFURA_API_KEY=your_infura_key
```

### 4. Deploy and Test

```bash
# Deploy
npx hardhat run scripts/deploy-testnet.ts --network sepolia

# Test
npx hardhat test --network sepolia
```

## 🌐 Network Options

| Network             | Gas Cost | Speed   | Faucet                                       | Explorer                                       |
| ------------------- | -------- | ------- | -------------------------------------------- | ---------------------------------------------- |
| **Localhost**       | FREE     | Instant | N/A                                          | N/A                                            |
| **Sepolia**         | FREE     | 15s     | [Faucet](https://sepoliafaucet.com/)         | [Etherscan](https://sepolia.etherscan.io/)     |
| **Mumbai**          | FREE     | 2s      | [Faucet](https://faucet.polygon.technology/) | [Polygonscan](https://mumbai.polygonscan.com/) |
| **Arbitrum Goerli** | FREE     | 1s      | [Faucet](https://faucet.arbitrum.io/)        | [Arbiscan](https://goerli.arbiscan.io/)        |

## 🚀 Production Options (Low Gas)

### Polygon Mainnet

- **Gas Cost**: ~$0.01 per transaction
- **Speed**: 2 seconds
- **Setup**: Same as Mumbai but use mainnet RPC

### Arbitrum One

- **Gas Cost**: ~$0.05 per transaction
- **Speed**: 1 second
- **Setup**: Use Arbitrum mainnet RPC

## 🔍 Troubleshooting

### Common Issues:

1. **"Insufficient funds"**

   ```bash
   # Get more testnet ETH
   # Check you're on the right network
   ```

2. **"Network not supported"**

   ```bash
   # Add network to MetaMask
   # Check RPC URL is correct
   ```

3. **"Contract not found"**
   ```bash
   # Verify contract address
   # Check you're on the right network
   ```

### Debug Commands:

```bash
# Check account balance
npx hardhat run scripts/check-balance.ts --network sepolia

# Verify contract
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# Check transaction
npx hardhat run scripts/check-tx.ts --network sepolia --txhash TX_HASH
```

## 📱 Mobile Setup

### MetaMask Mobile:

1. Open MetaMask app
2. Go to Settings > Networks
3. Add custom network
4. Use the same config as above

### WalletConnect:

```typescript
// Add to your client app
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const walletconnect = new WalletConnectConnector({
  rpc: {
    11155111: "https://sepolia.infura.io/v3/YOUR_KEY",
  },
  qrcode: true,
});
```

## 🎯 Best Practices

### 1. Use Testnets for Development

- **Sepolia** for Ethereum testing
- **Mumbai** for Polygon testing
- **Localhost** for rapid iteration

### 2. Optimize Gas Usage

```solidity
// Use events instead of storage
event VoteCast(address indexed voter, uint256 proposalId);

// Pack structs efficiently
struct Proposal {
    bytes32 merkleRoot;
    bytes32 metadata;
    uint256 startDate;
    uint256 endDate;
}
```

### 3. Batch Operations

```typescript
// Batch multiple operations
const tx = await contract.batchVote(votes);
```

### 4. Use View Functions

```typescript
// Read data without gas
const proposals = await contract.getProposals();
const results = await contract.getResults(proposalId);
```

## 🚀 Quick Commands

```bash
# Deploy to testnet
npx hardhat run scripts/deploy-testnet.ts --network sepolia

# Setup client
node scripts/setup-testnet.js 0x[ADDRESS] https://sepolia.infura.io/v3/YOUR_KEY

# Start app
npm run dev

# Check balance
npx hardhat run scripts/check-balance.ts --network sepolia
```

## 💡 Pro Tips

1. **Use Mumbai for fastest testing** - 2 second confirmations
2. **Keep testnet ETH** - Don't use all at once
3. **Use localhost for development** - Instant feedback
4. **Batch transactions** - Save gas when possible
5. **Use events for logging** - Cheaper than storage

## 🆘 Need Help?

- **Faucet not working?** Try multiple faucets
- **Transaction stuck?** Increase gas limit
- **Contract not found?** Check network and address
- **MetaMask issues?** Reset account or clear cache

## 🎉 You're Ready!

Your ZK voting system is now running on testnet with **ZERO gas costs**!

- ✅ Contract deployed
- ✅ Client app configured
- ✅ MetaMask connected
- ✅ Ready to vote!

Start creating proposals and voting - it's completely free! 🚀
