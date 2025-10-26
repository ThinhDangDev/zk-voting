import * as secp256k1 from '@noble/secp256k1'
import { ethers } from 'hardhat'
import { describe } from 'mocha'

import { Leaf } from '../src/leaf'
import { MerkleDistributor } from '../src/merkleDistributor'
import { ZKVoting } from '../typechain-types'
import { BSGS } from '../src/utils'

const { data: PRIMARY_DUMMY_METADATA } = Buffer.from(
  'b2b68b298b9bfa2dd2931cd879e5c9997837209476d25319514b46f7b7911d31',
  'hex',
).toJSON()

const privateKey =
  BigInt(
    49360424492151327609744179530990798614627223631512818354400676568443765553532,
  )
const pubkey = secp256k1.Point.BASE.multiply(privateKey)
const randomNumber = () => {
  const r = secp256k1.etc.randomBytes(16)
  const curve = (secp256k1.Point.BASE.constructor as any).CURVE()

  return secp256k1.etc.mod(BigInt(`0x${secp256k1.etc.bytesToHex(r)}`), curve.n)
}
describe('Contract', function () {
  const currentTime = Math.floor(Date.now() / 1000)
  const zero = secp256k1.Point.ZERO
  const P = secp256k1.Point.BASE
  const commitment = randomNumber()

  let contractZkVoting: ZKVoting
  let merkleDistributor: MerkleDistributor
  let candidates: string[]
  let voters: Leaf[]
  let nonce: number

  async function deployZkVoting() {
    const [signer] = await ethers.getSigners()
    const ZkVoting = await ethers.deployContract('ZKVoting', [], {
      gasLimit: 30000000,
      signer,
      nonce: nonce++,
    })
    await ZkVoting.waitForDeployment()
    return ZkVoting.target
  }

  before('Before test', async () => {
    const [signer, ...receivers] = await ethers.getSigners()

    nonce = await signer.getNonce()
    const address = await deployZkVoting()

    const mineVote = new Leaf(signer.address)
    voters = Array.from(Array(3).keys()).map(
      (i) => new Leaf(receivers[i].address),
    )
    console.log('List Voter', Object.values(voters))

    merkleDistributor = new MerkleDistributor([...voters, mineVote])
    candidates = Array.from(Array(3).keys()).map((i) => receivers[i].address)
    console.log('Candidate A', Object.values(candidates)[0])
    console.log('Candidate B', Object.values(candidates)[1])
    console.log('Candidate C', Object.values(candidates)[2])

    contractZkVoting = (await ethers.getContractAt(
      'ZKVoting',
      address,
      signer,
    )) as any
  })

  it('Create proposal', async function () {
    const merkleRoot = merkleDistributor.root.value
    const randomsNumber: bigint[] = []
    const ballotBoxes = candidates.map(() => {
      const r = randomNumber()
      randomsNumber.push(r)
      const M = zero.add(pubkey.multiply(r))
      return { x: M.x, y: M.y }
    })
    await contractZkVoting.initProposal(
      merkleRoot,
      Uint8Array.from(PRIMARY_DUMMY_METADATA),
      currentTime,
      currentTime + 5000,
      commitment,
      randomsNumber,
      candidates,
      ballotBoxes,
      {
        gasLimit: 30000000,
        nonce: nonce++,
      },
    )
    const proposal = await contractZkVoting.getProposal(Number(0))
    console.log('Merkle Root: ', proposal.merkleRoot)
    console.log('BallotBoxes: ', proposal.ballotBoxes)
  })

  it('Vote for A', async function () {
    const votFor = candidates[0]
    const proof_r: bigint[] = []
    const proof_t: secp256k1.Point[] = []
    const randomsNumber: bigint[] = []
    const proof = merkleDistributor.prove(
      new Leaf('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'),
    )
    const votes = candidates.map((candidate) => {
      const x = randomNumber()
      randomsNumber.push(x)

      const v = randomNumber()
      const T = pubkey.multiply(v)
      // r = v + cx
      const r = v + commitment * x
      proof_r.push(r)
      proof_t.push(T)

      const M = candidate === votFor ? P : zero
      const C = M.add(pubkey.multiply(x)) // C = M + rG
      return { x: C.x, y: C.y }
    })

    await contractZkVoting.vote(
      0,
      randomsNumber,
      votes,
      proof.map((e) => e.value),
      proof_r,
      proof_t,
      {
        gasLimit: 30000000,
      },
    )
    const proposal = await contractZkVoting.getProposal(Number(0))

    console.log('BallotBoxes before vote A: ', proposal.ballotBoxes)
  })

  // it('Vote for A with wrong address', async function () {
  //   const votFor = candidates[2]
  //   const proof_r: bigint[] = []
  //   const proof_t: secp256k1.Point[] = []

  //   const randomsNumber: bigint[] = []
  //   const proof = merkleDistributor.prove(
  //     new Leaf('0x70997970C51812dc3A010C7d01b50e0d17dc79C9'),
  //   )
  //   const votes = candidates.map((candidate) => {
  //     const x = randomNumber()
  //     randomsNumber.push(x)

  //     const v = randomNumber()
  //     const T = pubkey.multiply(v)
  //     // r = v + cx
  //     const r = v + commitment * x
  //     proof_r.push(r)
  //     proof_t.push(T)

  //     const M = candidate === votFor ? P : zero
  //     const C = M.add(pubkey.multiply(x)) // C = M + rG
  //     return { x: C.x, y: C.y }
  //   })

  //   await contractZkVoting.vote(
  //     0,
  //     randomsNumber,
  //     votes,
  //     proof.map((e) => e.value),
  //     proof_r,
  //     proof_t,
  //     {
  //       gasLimit: 30000000,
  //     },
  //   )
  //   const proposal = await contractZkVoting.getProposal(Number(0))

  //   console.log('BallotBoxes before vote B: ', proposal.ballotBoxes)
  // })

  // it('Vote for B the second times', async function () {
  //   const votFor = candidates[2]
  //   const [signer] = await ethers.getSigners()
  //   const proof_r: bigint[] = []
  //   const proof_t: secp256k1.Point[] = []

  //   const randomsNumber: bigint[] = []
  //   const proof = merkleDistributor.prove(new Leaf(signer.address))
  //   const votes = candidates.map((candidate) => {
  //     const x = randomNumber()
  //     randomsNumber.push(x)

  //     const v = randomNumber()
  //     const T = pubkey.multiply(v)
  //     // r = v + cx
  //     const r = v + commitment * x
  //     proof_r.push(r)
  //     proof_t.push(T)

  //     const M = candidate === votFor ? P : zero
  //     const C = M.add(pubkey.multiply(x)) // C = M + rG
  //     return { x: C.x, y: C.y }
  //   })

  //   await contractZkVoting.vote(
  //     0,
  //     randomsNumber,
  //     votes,
  //     proof.map((e) => e.value),
  //     proof_r,
  //     proof_t,
  //     {
  //       gasLimit: 30000000,
  //     },
  //   )
  //   const proposal = await contractZkVoting.getProposal(Number(0))

  //   console.log(proposal)
  // })

  it('Get Winners', async function () {
    const ballotBoxesDecrypted: secp256k1.Point[] = []
    const proposal = await contractZkVoting.getProposal(Number(0))
    proposal.ballotBoxes.forEach(({ x, y }, i) => {
      const C = new secp256k1.Point(x, y)
      const R = P.multiply(proposal.randomNumbers[i])
      const M = C.subtract(R.multiply(privateKey)) //M = C - R * x
      ballotBoxesDecrypted.push(M)
    })
    const totalBallot: number[] = await BSGS(ballotBoxesDecrypted)
    console.log(totalBallot)
  })
})
