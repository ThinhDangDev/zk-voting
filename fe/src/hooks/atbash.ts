import { useCallback, useMemo } from 'react'
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
} from 'wagmi'
import * as secp256k1 from '@noble/secp256k1'
import { decode, encode } from 'bs58'
import { hexToBytes } from 'viem'
import axios from 'axios'
import useSWR from 'swr'
import { bytesToHex } from 'viem'
import { apiConfig } from '@/configs/env'
// import { Leaf, MerkleDistributor } from 'atbash-evm'
import {
  Leaf as ZKLeaf,
  MerkleDistributor as ZKMerkleDistributor,
} from '@thinhdang1402/zk-voting'
import { createGlobalState, useAsync } from 'react-use'
import { CandidateMetadata, InitProposalProps, Proposal } from '@/types'
import { BSGS2, privateKey, randomNumber } from '@/helpers/utils'
import { toFilename, uploadFileToSupabase } from '@/helpers/upload'
import { useMerkleDistributor } from './merkle'
import { usePubkey } from './identity'
import ZKVotingAbi from '@/static/abi/ZKVoting.json'
import { DEFAULT_PROPOSAL } from '@/constants'
import { config } from '@/configs/contract'
import { JsonRpcProvider } from 'ethers'

export const useAtbashContract = () => {
  const atbash = useMemo((): {
    address: `0x${string}`
    abi: typeof ZKVotingAbi.abi
  } => {
    return {
      address: config.contractAddress,
      abi: ZKVotingAbi.abi,
    }
  }, [])

  return atbash
}

export const useProposalCount = () => {
  const atbash = useAtbashContract()
  const { data: max, isLoading } = useContractRead({
    address: atbash.address,
    abi: atbash.abi,
    functionName: 'proposalId',
  })
  return { amount: Number(max) || 0, isLoading }
}

export const useProposalData = (proposalId: number) => {
  const { abi, address } = useAtbashContract()

  const { data } = useContractRead({
    address,
    abi,
    functionName: 'getProposal',
    args: [proposalId],
  })

  return data as Proposal
}

export const useMetadata = (proposalId: number) => {
  const { metadata } = useProposalData(proposalId) || { metadata: '' }

  const fetcher = useCallback(async ([metadata]: [any]) => {
    if (!metadata) return null

    try {
      // Convert hex bytes32 from contract to CID
      const metadataBytes = hexToBytes(metadata)
      const cid = encode(new Uint8Array(Buffer.from(metadataBytes)))
      const fileName = toFilename(cid)
      const url = `${apiConfig.supabaseUrl}/storage/v1/object/public/${apiConfig.bucket}/public/${fileName}`

      const { data } = await axios.get(url)

      // If merkleBuff is base64, convert it back to Buffer format for compatibility
      if (data?.merkleBuff && typeof data.merkleBuff === 'string') {
        data.merkleBuff = Buffer.from(data.merkleBuff, 'base64')
      }

      return data
    } catch (error: any) {
      console.error('Failed to fetch metadata:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      })
      throw new Error(`Failed to retrieve metadata: ${error.message || error}`)
    }
  }, [])

  const { data, isLoading, error } = useSWR([metadata], fetcher)

  return { metadata: data, isLoading, error }
}

export const useWalletNonce = () => {
  const { chains } = useNetwork()
  const { address: walletAddress } = useAccount()

  const { value: nonce } = useAsync(async () => {
    if (!walletAddress) return
    const { rpcUrls } = chains[0]
    const [rpc] = rpcUrls.public.http
    const provider = new JsonRpcProvider(rpc)
    const nonce = await provider.getTransactionCount(walletAddress)
    return nonce
  }, [walletAddress, chains])

  return nonce
}

export const useCandidateData = (proposalId: number, candidate: string) => {
  const { metadata } = useMetadata(proposalId)

  const candidateMetadata = useMemo(() => {
    if (!metadata) return { name: '', avatar: '', description: '' }
    const { proposalMetadata } = metadata
    return proposalMetadata.candidateMetadata[candidate] as CandidateMetadata
  }, [candidate, metadata])

  return candidateMetadata
}

export const useInitProposal = (props: InitProposalProps) => {
  const { abi, address } = useAtbashContract()
  const { address: walletAddress } = useAccount()
  const nonce = useWalletNonce()
  const { writeAsync } = useContractWrite({
    address,
    abi,
    functionName: 'initProposal',
  })
  const merkleDistributor = useMerkleDistributor(props.voters)
  const pubkey = usePubkey()

  const initProposal = useCallback(async () => {
    if (!walletAddress) throw new Error('Please connect wallet first!')
    const { startTime, endTime, candidates, proposalMetadata } = props

    // Validate required data
    if (!candidates || candidates.length === 0) {
      throw new Error('Candidates are required')
    }
    if (!startTime || !endTime) {
      throw new Error('Start and end times are required')
    }

    const root = merkleDistributor.root.value
    const merkleBuff = merkleDistributor.toBuffer()

    // Convert Buffer to base64 string for JSON serialization
    const merkleBuffBase64 = merkleBuff.toString('base64')

    // Create metadata object with serializable merkleBuff
    const metadataPayload = {
      proposalMetadata,
      merkleBuff: merkleBuffBase64,
    }

    // Create File from Blob with proper JSON stringification
    const blob = new Blob([JSON.stringify(metadataPayload, null, 2)], {
      type: 'application/json',
    })
    const file = new File([blob], 'metadata.json', { type: 'application/json' })

    // Upload metadata and get CID
    let cid: string
    try {
      cid = await uploadFileToSupabase(file)
      if (!cid) {
        throw new Error('Upload returned empty CID')
      }
    } catch (error: any) {
      throw new Error(`Failed to upload metadata: ${error.message || error}`)
    }

    const zero = secp256k1.Point.ZERO
    const randomsNumber: bigint[] = []
    const ballotBoxes = candidates.map(() => {
      const r = randomNumber()
      randomsNumber.push(r)
      const M = zero.add(pubkey.multiply(r))
      return { x: M.x, y: M.y }
    })
    const commitment = randomNumber()

    const tx = await writeAsync({
      args: [
        bytesToHex(root),
        bytesToHex(decode(cid)), // Use actual CID instead of hardcoded 'asd'
        BigInt(Math.floor(startTime / 1000)),
        BigInt(Math.floor(endTime / 1000)),
        commitment,
        randomsNumber,
        candidates,
        ballotBoxes,
      ],
      nonce,
    })
    return tx.hash
  }, [walletAddress, props, merkleDistributor, writeAsync, nonce, pubkey])

  return initProposal
}

export const useVote = (proposalId: number, votFor: string) => {
  const { abi, address } = useAtbashContract()
  const { writeAsync } = useContractWrite({
    address,
    abi,
    functionName: 'vote',
  })
  const proposal = useProposalData(proposalId)
  const pubkey = usePubkey()
  const { metadata } = useMetadata(proposalId)
  const { address: walletAddress } = useAccount()
  const nonce = useWalletNonce()

  const onVote = useCallback(async () => {
    try {
      if (!walletAddress) throw new Error('Please connect wallet first!')

      // Validate wallet address format
      if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
        throw new Error(`Invalid wallet address format: ${walletAddress}`)
      }

      // Use merkleBuff from metadata to reconstruct merkle tree for proof generation
      // The merkleRoot on proposal is just the hash; we need the full tree data for proofs
      if (!metadata?.merkleBuff) {
        throw new Error('Merkle distributor data not found in metadata!')
      }

      // merkleBuff is now a Buffer (converted from base64 in useMetadata)
      const merkleBuff =
        metadata.merkleBuff instanceof Buffer
          ? metadata.merkleBuff
          : Buffer.from(metadata.merkleBuff, 'base64')

      // Verify merkle root matches
      const merkle = ZKMerkleDistributor.fromBuffer(merkleBuff)
      const computedRoot = bytesToHex(merkle.root.value)
      const contractRoot = proposal.merkleRoot

      if (computedRoot !== contractRoot) {
        throw new Error('Merkle root mismatch between metadata and contract!')
      }
      const proof = merkle.prove(new ZKLeaf(walletAddress))

      const candidates = proposal?.candidates || []
      const zero = secp256k1.Point.ZERO
      const P = secp256k1.Point.BASE

      const proof_r: bigint[] = []
      const proof_t: secp256k1.Point[] = []

      const randomsNumber: bigint[] = []
      const votes = candidates.map((candidate) => {
        const x = randomNumber()
        randomsNumber.push(x)

        const v = randomNumber()
        const T = pubkey.multiply(v)
        // r = v + cx
        const r = v + proposal.commitment * x
        proof_r.push(r)
        proof_t.push(T)

        const M = candidate === votFor ? P : zero
        const C = M.add(pubkey.multiply(x)) // C = M + rG
        return { x: C.x, y: C.y }
      })
      const tx = await writeAsync({
        args: [
          proposalId,
          randomsNumber,
          votes,
          proof.map((e) => bytesToHex(e.value)),
          proof_r,
          proof_t,
        ],
        nonce,
      })
      console.log('tx', tx)

      return tx.hash
    } catch (error) {
      console.error('Error during voting:', error)
      throw error
    }
  }, [
    walletAddress,
    metadata?.merkleBuff,
    proposal,
    writeAsync,
    proposalId,
    nonce,
    pubkey,
    votFor,
  ])

  return onVote
}

export const useGetWinner = (proposalId: number) => {
  const proposal = useProposalData(proposalId)

  const getWinner = useCallback(async () => {
    if (!proposal) throw new Error('Proposal not found')

    const ballotBoxesDecrypted: secp256k1.Point[] = []
    const P = secp256k1.Point.BASE

    proposal.ballotBoxes.forEach(({ x, y }, i) => {
      const C = new secp256k1.Point(x, y, 1n)
      const R = P.multiply(proposal.randomNumbers[i])
      const M = C.subtract(R.multiply(privateKey)) //M = C - R * x
      ballotBoxesDecrypted.push(M)
    })
    console.log('proposal', proposal)
    console.log('ballotBoxesDecrypted', ballotBoxesDecrypted)
    const totalBallot: number[] = await BSGS2(ballotBoxesDecrypted)
    console.log('totalBallot', totalBallot)
    return totalBallot
  }, [proposal])

  return getWinner
}

export const useResults = (proposalId: number) => {
  const proposal = useProposalData(proposalId)
  const results = useMemo(() => {
    if (!proposal) return []
    return proposal.results
  }, [proposal])
  return results
}

export const useWinner = (proposalId: number) => {
  const proposal = useProposalData(proposalId)
  const winner = useMemo(() => {
    if (!proposal) return ''
    const { endDate } = proposal

    const end = Number(endDate) * 1000
    if (Date.now() < end) return ''

    // Results are calculated client-side, not stored on-chain
    // This function will return empty string until results are calculated
    return ''
  }, [proposal])

  return winner
}

export const useReceipt = (proposalId: number) => {
  const { abi, address } = useAtbashContract()
  const { address: walletAddress } = useAccount()

  const { data } = useContractRead({
    address,
    abi,
    functionName: 'receipts',
    args: [BigInt(proposalId), walletAddress],
  })
  return !!data
}

export const useGlobalCampaign =
  createGlobalState<InitProposalProps>(DEFAULT_PROPOSAL)
