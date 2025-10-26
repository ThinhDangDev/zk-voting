# React Integration Guide for ZK-Voting

## 1. Install Dependencies

```bash
npm install ethers @noble/secp256k1 viem
# or
yarn add ethers @noble/secp256k1 viem
```

## 2. Copy the ZK-Voting Library

Copy the entire `src/` folder from this project to your React app's `src/lib/zk-voting/` directory.

## 3. Contract ABI

Copy the generated ABI from `abi/ZkVoting.json` to your React app.

## 4. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

## 5. React Hooks & Components

### Wallet Connection Hook

```typescript
// hooks/useWallet.ts
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = await provider.getSigner()
        const address = await signer.getAddress()

        setProvider(provider)
        setSigner(signer)
        setAccount(address)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }

  return { account, provider, signer, connectWallet }
}
```

### ZK-Voting Hook

```typescript
// hooks/useZkVoting.ts
import { useState, useEffect } from 'react'
import { ZkVoting } from '../lib/zk-voting/core'
import { Proposal } from '../lib/zk-voting/types'

export const useZkVoting = (signer: any) => {
  const [zkVoting, setZkVoting] = useState<ZkVoting | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (signer) {
      const contract = new ZkVoting({
        wallet: signer,
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      })
      setZkVoting(contract)
    }
  }, [signer])

  const fetchProposals = async () => {
    if (!zkVoting) return
    setLoading(true)
    try {
      const proposals = await zkVoting.getProposals()
      setProposals(proposals)
    } catch (error) {
      console.error('Failed to fetch proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProposal = async (data: {
    candidates: string[]
    voters: string[]
    metadata: string
    startTime: number
    endTime: number
  }) => {
    if (!zkVoting) throw new Error('ZK Voting not initialized')

    const metadata = Buffer.from(data.metadata, 'utf8')
    return await zkVoting.initializeProposal({
      ...data,
      metadata,
    })
  }

  const vote = async (proposalId: number, candidate: string) => {
    if (!zkVoting) throw new Error('ZK Voting not initialized')

    // Get voter list and generate proof
    const proposal = proposals[proposalId]
    const voters = ['0x...', '0x...'] // Your voter list
    const merkleDistributor = zkVoting.getMerkleDistributor(voters)
    const proof = merkleDistributor.prove(new Leaf(account))

    return await zkVoting.vote({
      proposalId,
      proof,
      votFor: candidate,
      owner: account,
    })
  }

  const getResults = async (proposalId: number) => {
    if (!zkVoting) throw new Error('ZK Voting not initialized')
    return await zkVoting.getWinner({ proposalId })
  }

  return {
    zkVoting,
    proposals,
    loading,
    fetchProposals,
    createProposal,
    vote,
    getResults,
  }
}
```

### Main Voting Component

```tsx
// components/VotingApp.tsx
import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useZkVoting } from '../hooks/useZkVoting'

export const VotingApp: React.FC = () => {
  const { account, connectWallet } = useWallet()
  const {
    proposals,
    loading,
    fetchProposals,
    createProposal,
    vote,
    getResults,
  } = useZkVoting(signer)

  const [newProposal, setNewProposal] = useState({
    candidates: [''],
    voters: [''],
    metadata: '',
    startTime: Math.floor(Date.now() / 1000),
    endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  })

  useEffect(() => {
    if (account) {
      fetchProposals()
    }
  }, [account])

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const txHash = await createProposal(newProposal)
      console.log('Proposal created:', txHash)
      await fetchProposals()
    } catch (error) {
      console.error('Failed to create proposal:', error)
    }
  }

  const handleVote = async (proposalId: number, candidate: string) => {
    try {
      const txHash = await vote(proposalId, candidate)
      console.log('Vote submitted:', txHash)
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">ZK Voting System</h1>

      {/* Create Proposal Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Proposal</h2>
        <form onSubmit={handleCreateProposal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Candidates (one per line)
            </label>
            <textarea
              value={newProposal.candidates.join('\n')}
              onChange={(e) =>
                setNewProposal({
                  ...newProposal,
                  candidates: e.target.value
                    .split('\n')
                    .filter((c) => c.trim()),
                })
              }
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Eligible Voters (one per line)
            </label>
            <textarea
              value={newProposal.voters.join('\n')}
              onChange={(e) =>
                setNewProposal({
                  ...newProposal,
                  voters: e.target.value.split('\n').filter((v) => v.trim()),
                })
              }
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <input
              type="text"
              value={newProposal.metadata}
              onChange={(e) =>
                setNewProposal({
                  ...newProposal,
                  metadata: e.target.value,
                })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Create Proposal
          </button>
        </form>
      </div>

      {/* Proposals List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Active Proposals</h2>

        {loading ? (
          <div>Loading proposals...</div>
        ) : (
          proposals.map((proposal, index) => (
            <ProposalCard
              key={index}
              proposal={proposal}
              proposalId={index}
              onVote={handleVote}
              onGetResults={getResults}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Individual Proposal Component
const ProposalCard: React.FC<{
  proposal: Proposal
  proposalId: number
  onVote: (proposalId: number, candidate: string) => void
  onGetResults: (proposalId: number) => Promise<number[]>
}> = ({ proposal, proposalId, onVote, onGetResults }) => {
  const [results, setResults] = useState<number[] | null>(null)
  const [showResults, setShowResults] = useState(false)

  const handleGetResults = async () => {
    try {
      const res = await onGetResults(proposalId)
      setResults(res)
      setShowResults(true)
    } catch (error) {
      console.error('Failed to get results:', error)
    }
  }

  const isActive = Date.now() / 1000 < Number(proposal.endDate)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Proposal #{proposalId}</h3>
      <p className="text-gray-600 mb-4">{proposal.metadata}</p>

      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Start: {new Date(Number(proposal.startDate) * 1000).toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">
          End: {new Date(Number(proposal.endDate) * 1000).toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">
          Status: {isActive ? 'Active' : 'Ended'}
        </p>
      </div>

      {isActive ? (
        <div className="space-y-2">
          <h4 className="font-medium">Candidates:</h4>
          {proposal.candidates.map((candidate, index) => (
            <button
              key={index}
              onClick={() => onVote(proposalId, candidate)}
              className="block w-full p-2 text-left border rounded hover:bg-gray-50"
            >
              {candidate}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={handleGetResults}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Get Results
          </button>

          {showResults && results && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Results:</h4>
              {results.map((votes, index) => (
                <p key={index} className="text-sm">
                  Candidate {index + 1}: {votes} votes
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

## 6. App Entry Point

```tsx
// pages/index.tsx or App.tsx
import React from 'react'
import { VotingApp } from '../components/VotingApp'

export default function Home() {
  return (
    <div>
      <VotingApp />
    </div>
  )
}
```

## 7. Key Features

### ✅ What This Integration Provides:

1. **Wallet Connection** - MetaMask integration
2. **Proposal Creation** - Create voting proposals with candidates and eligible voters
3. **Secure Voting** - Zero-knowledge proof voting
4. **Results Tallying** - Decrypt and count votes
5. **Real-time Updates** - Fetch latest proposals and results

### 🔐 Security Features:

- **Merkle Tree Verification** - Only eligible voters can participate
- **Zero-Knowledge Proofs** - Vote privacy maintained
- **Cryptographic Commitments** - Prevents vote manipulation
- **Elliptic Curve Encryption** - Secure vote encryption

### 🚀 Usage Flow:

1. **Admin creates proposal** with candidates and voter list
2. **Eligible voters connect wallet** and see active proposals
3. **Voters cast encrypted votes** for their preferred candidate
4. **After voting period ends**, results can be decrypted and tallied
5. **Winner is determined** based on vote counts

This integration gives you a complete React-based voting system with all the cryptographic security of the original zk-voting protocol!
