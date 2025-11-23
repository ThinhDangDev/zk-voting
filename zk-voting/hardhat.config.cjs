require('@nomicfoundation/hardhat-toolbox')
require('hardhat-abi-exporter')
require('dotenv/config')
const { Wallet } = require('ethers')

// Configure ts-node for TypeScript test files with ESM support
require('ts-node').register({
  transpileOnly: true,
  project: './tsconfig.hardhat.json',
  compilerOptions: {
    module: 'commonjs',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
  },
  // Enable ESM interop for packages like @noble/secp256k1
  experimentalSpecifierResolution: 'node',
})

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: '0.8.19',
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [':ZkVoting$'],
  },
  networks: {
    localhost: {
      url: 'http://localhost:8545',
      accounts: [
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Account 0 from hardhat node
      ],
    },
    sepolia: {
      url:
        process.env.SEPOLIA_RPC_URL ||
        'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      accounts: [process.env.PRIVKEY || Wallet.createRandom().privateKey],
    },
    goerli: {
      url:
        process.env.GOERLI_RPC_URL ||
        'https://goerli.infura.io/v3/YOUR_INFURA_KEY',
      accounts: [process.env.PRIVKEY || Wallet.createRandom().privateKey],
    },
    mumbai: {
      url:
        process.env.MUMBAI_RPC_URL ||
        'https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY',
      accounts: [process.env.PRIVKEY || Wallet.createRandom().privateKey],
    },
    victionTestnet: {
      url: 'https://rpc.testnet.tomochain.com',
      accounts: [process.env.PRIVKEY || Wallet.createRandom().privateKey],
    },
    victionMainnet: {
      url: 'https://rpc.tomochain.com',
      accounts: [process.env.PRIVKEY || Wallet.createRandom().privateKey],
    },
  },
  // defaultNetwork: 'victionTestnet',
  mocha: {
    require: ['ts-node/register'],
    timeout: 40000,
    loader: 'ts-node/esm',
  },
}

module.exports = config
