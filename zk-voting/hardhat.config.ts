import { HardhatUserConfig } from 'hardhat/config'
import { Wallet } from 'ethers'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-abi-exporter'
import 'dotenv/config'

const config: HardhatUserConfig = {
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
}

export default config
