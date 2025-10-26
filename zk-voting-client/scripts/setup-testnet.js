#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Get contract address from command line
const contractAddress = process.argv[2];
const rpcUrl =
  process.argv[3] || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";

if (!contractAddress) {
  console.log("❌ Please provide contract address");
  console.log(
    "Usage: node scripts/setup-testnet.js <CONTRACT_ADDRESS> [RPC_URL]"
  );
  console.log(
    "Example: node scripts/setup-testnet.js 0x1234... https://sepolia.infura.io/v3/YOUR_KEY"
  );
  process.exit(1);
}

// Create .env.local file
const envContent = `VITE_CONTRACT_ADDRESS=${contractAddress}
VITE_RPC_URL=${rpcUrl}
`;

const envPath = path.join(__dirname, "..", ".env.local");
fs.writeFileSync(envPath, envContent);

console.log("✅ Environment configured!");
console.log(`Contract Address: ${contractAddress}`);
console.log(`RPC URL: ${rpcUrl}`);
console.log("");
console.log("🚀 Start the development server:");
console.log("   npm run dev");
console.log("");
console.log("🔧 Make sure to:");
console.log("1. Add the network to MetaMask");
console.log("2. Get testnet ETH from faucets");
console.log("3. Switch to the correct network");
