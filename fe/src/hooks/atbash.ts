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
import { Leaf, MerkleDistributor } from 'atbash-evm'
import { createGlobalState, useAsync } from 'react-use'
import { CandidateMetadata, InitProposalProps, Proposal } from '@/types'
import { BSGS, decrypt, randomNumber } from '@/helpers/utils'
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
    if (!metadata) return
    const cid = encode(new Uint8Array(Buffer.from(hexToBytes(metadata))))
    const fileName = toFilename(cid)
    const url =
      'https://hnreqcvgchtokkqynbli.supabase.co/storage/v1/object/public/atbash/public/' +
      fileName
    const { data } = await axios.get(url)

    return data
  }, [])

  const { data, isLoading } = useSWR([metadata], fetcher)

  return { metadata: data, isLoading }
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
    const root = merkleDistributor.root.value
    const merkleBuff = merkleDistributor.toBuffer()
    const blob = [
      new Blob([JSON.stringify({ proposalMetadata, merkleBuff }, null, 2)], {
        type: 'application/json',
      }),
    ]
    const file = new File(blob, 'metadata.txt')
    const cid = await uploadFileToSupabase(file)
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
        bytesToHex(decode(cid)),
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
      // if (!metadata?.merkleBuff) throw new Error('Merkle root not found!')
      const merkleRoot = metadata?.merkleBuff
        ? metadata.merkleBuff.data
        : proposal.merkleRoot
      const merkle = MerkleDistributor.fromBuffer(Buffer.from(merkleRoot))
      const proof = merkle.prove(new Leaf(walletAddress))

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

    const end = Number(proposal.endDate) * 1000
    if (Date.now() < end) throw new Error("The campaign isn't end!")

    const P = secp256k1.Point.BASE
    const decryptedPoints = await Promise.all(
      proposal.ballotBoxes.map(async ({ x, y }, i) => {
        const C = new secp256k1.Point(x, y)
        const R = P.multiply(proposal.randomNumbers[i])
        const M = await decrypt(C, R)
        return new secp256k1.Point(BigInt(M.x), BigInt(M.y))
      }),
    )

    const totalBallot: number[] = await BSGS(decryptedPoints, 100)
    return totalBallot
  }, [proposal])

  return getWinner
}

export const useWinner = (proposalId: number) => {
  const proposal = useProposalData(proposalId)
  const winner = useMemo(() => {
    if (!proposal) return ''
    const { endDate, candidates } = proposal

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
