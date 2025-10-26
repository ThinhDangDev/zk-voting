import { Contract, type ContractRunner } from 'ethers'
import * as secp256k1 from '@noble/secp256k1'

import { MerkleDistributor } from './merkleDistributor'
import { Leaf } from './leaf'
import type { Proposal } from './types'
import { Node } from './node'
import { CONTRACT_ADDRESS, PUB_KEY } from './constant'
import { BSGS } from './utils'
import artifact from '../artifacts/contracts/ZKVoting.sol/ZKVoting.json'
const abi = artifact.abi

const privateKey =
  BigInt(
    49360424492151327609744179530990798614627223631512818354400676568443765553532,
  )

export class ZkVoting {
  public readonly contract: Contract
  private _pubkey = secp256k1.Point.fromHex(PUB_KEY)
  constructor({
    wallet,
    contractAddress = CONTRACT_ADDRESS,
  }: {
    wallet: ContractRunner
    contractAddress?: string
  }) {
    this.contract = new Contract(contractAddress, abi, wallet)
  }

  randomNumber = () => {
    const r = secp256k1.etc.randomBytes(16)
    const curve = (secp256k1.Point.BASE.constructor as any).CURVE()
    return secp256k1.etc.mod(
      BigInt(`0x${secp256k1.etc.bytesToHex(r)}`),
      curve.n,
    )
  }

  getMerkleDistributor = (voters: string[]) => {
    const leafs = voters.map((voter) => new Leaf(voter))
    const merkleDistributor = new MerkleDistributor(leafs)
    return merkleDistributor
  }

  async getProposals() {
    const maxId = await this.contract.proposalId()
    const proposals: Proposal[] = []

    for (let i = 0; i < maxId; i++) {
      const proposal = await this.contract.getProposal(i)
      proposals.push(proposal)
    }
    return proposals
  }

  async initializeProposal({
    candidates,
    endTime,
    metadata,
    startTime,
    voters,
  }: {
    candidates: string[]
    voters: string[]
    metadata: Buffer | Uint8Array | number[]
    startTime: number
    endTime: number
  }) {
    const zero = secp256k1.Point.ZERO

    const randomsNumber: bigint[] = []
    const ballotBoxes = candidates.map(() => {
      const r = this.randomNumber()
      randomsNumber.push(r)
      const M = zero.add(this._pubkey.multiply(r))
      return { x: M.x, y: M.y }
    })
    const merkleDistributor = this.getMerkleDistributor(voters)
    const merkleRoot = merkleDistributor.root.value
    const commitment = this.randomNumber()

    // Ensure metadata is exactly 32 bytes (bytes32)
    const metadataBytes = new Uint8Array(32)
    const metadataArray = Uint8Array.from(metadata)
    metadataBytes.set(metadataArray.slice(0, 32)) // Truncate or pad to 32 bytes

    const tx = await this.contract.initProposal(
      merkleRoot,
      metadataBytes,
      BigInt(startTime),
      BigInt(endTime),
      commitment,
      randomsNumber,
      candidates,
      ballotBoxes,
      { gasLimit: 15000000 },
    )
    return tx.hash
  }

  async vote({
    proposalId,
    proof,
    votFor,
    owner,
  }: {
    proposalId: number
    proof: Node[]
    votFor: string
    owner: string
  }) {
    const proposal = await this.contract.getProposal(proposalId)
    if (!proposal) throw new Error('Invalid proposal address')
    const receipt = await this.contract.receipts(proposalId, owner)
    if (receipt) throw new Error('You already voted!')

    const candidates: string[] = proposal.candidates
    const zero = secp256k1.Point.ZERO
    const P = secp256k1.Point.BASE

    const proof_r: bigint[] = []
    const proof_t: secp256k1.Point[] = []

    const randomsNumber: bigint[] = []
    const votes = candidates.map((candidate) => {
      const x = this.randomNumber()
      randomsNumber.push(x)

      const v = this.randomNumber()
      const T = this._pubkey.multiply(v)
      // r = v + cx
      const r = v + proposal.commitment * x
      proof_r.push(r)
      proof_t.push(T)

      const M = candidate === votFor ? P : zero
      const C = M.add(this._pubkey.multiply(x)) // C = M + rG
      return { x: C.x, y: C.y }
    })

    const tx = await this.contract.vote(
      proposalId,
      randomsNumber,
      votes,
      proof.map((e) => e.value),
      proof_r,
      proof_t,
      {
        gasLimit: 15000000,
      },
    )
    return tx.hash
  }

  async getWinner({ proposalId }: { proposalId: number }) {
    const ballotBoxesDecrypted: secp256k1.Point[] = []
    const proposal: Proposal = await this.contract.getProposal(proposalId)
    const P = secp256k1.Point.BASE

    proposal.ballotBoxes.forEach(([x, y], i) => {
      const C = new secp256k1.Point(x, y, 1n)
      const R = P.multiply(proposal.randomNumbers[i])
      const M = C.subtract(R.multiply(privateKey)) //M = C - R * x
      ballotBoxesDecrypted.push(M)
    })
    const totalBallot: number[] = await BSGS(ballotBoxesDecrypted)
    return totalBallot
  }
}
