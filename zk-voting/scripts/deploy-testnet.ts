import { ethers } from 'hardhat'

async function main() {
  console.log('🚀 Deploying ZK Voting to testnet...')

  // Get the deployer account
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with account:', deployer.address)

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address)
  console.log('Account balance:', ethers.formatEther(balance), 'ETH')

  if (balance === 0n) {
    console.log('❌ No ETH in account! Please get testnet ETH from:')
    console.log('   - https://sepoliafaucet.com/')
    console.log('   - https://faucet.polygon.technology/')
    console.log('   - https://mumbaifaucet.com/')
    process.exit(1)
  }

  // Deploy the contract
  console.log('📦 Deploying ZKVoting contract...')
  const ZKVoting = await ethers.deployContract('ZKVoting', [], {
    gasLimit: 15000000,
  })

  await ZKVoting.waitForDeployment()
  const contractAddress = await ZKVoting.getAddress()

  console.log('✅ ZKVoting deployed to:', contractAddress)
  console.log('')
  console.log('🔧 Next steps:')
  console.log('1. Update your .env.local file:')
  console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`)
  console.log('2. Start your client app:')
  console.log('   cd ../zk-voting-client && npm run dev')
  console.log('')
  console.log('🌐 View on block explorer:')
  const network = await deployer.provider.getNetwork()
  if (network.chainId === 11155111n) {
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`)
  } else if (network.chainId === 80001n) {
    console.log(`   https://mumbai.polygonscan.com/address/${contractAddress}`)
  } else {
    console.log(`   Chain ID: ${network.chainId}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  })
