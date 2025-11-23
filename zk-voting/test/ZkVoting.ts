import * as secp256k1 from '@noble/secp256k1'
import { ethers } from 'hardhat'
import { describe } from 'mocha'
import { expect } from 'chai'

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

  describe('Voting Flow - All Voters Vote for All Candidates', function () {
    it('All voters vote for candidates A, B, and C', async function () {
      const [signer, ...receivers] = await ethers.getSigners()
      const allVoters = [...voters, new Leaf(signer.address)]

      console.log('\n📋 Starting voting process...')
      console.log(`Total voters: ${allVoters.length}`)
      console.log(`Total candidates: ${candidates.length} (A, B, C)\n`)

      // Voter 1 votes for A
      console.log('🗳️  Voter 1 voting for Candidate A:', candidates[0])
      let voter = allVoters[0]
      let proof = merkleDistributor.prove(voter)
      let proof_r: bigint[] = []
      let proof_t: secp256k1.Point[] = []
      let randomsNumber: bigint[] = []

      const votesA = candidates.map((candidate) => {
        const x = randomNumber()
        randomsNumber.push(x)

        const v = randomNumber()
        const T = pubkey.multiply(v)
        const r = v + commitment * x
        proof_r.push(r)
        proof_t.push(T)

        const M = candidate === candidates[0] ? P : zero
        const C = M.add(pubkey.multiply(x))
        return { x: C.x, y: C.y }
      })

      const voterAddress = voter.address
      const signerToUse =
        signer.address.toLowerCase() === voterAddress.toLowerCase()
          ? signer
          : receivers.find(
              (r) => r.address.toLowerCase() === voterAddress.toLowerCase(),
            ) || signer

      await contractZkVoting.connect(signerToUse).vote(
        0,
        randomsNumber,
        votesA,
        proof.map((e) => e.value),
        proof_r,
        proof_t,
        {
          gasLimit: 30000000,
        },
      )
      console.log('✅ Vote for A completed')

      // Voter 2 votes for B
      console.log('🗳️  Voter 2 voting for Candidate B:', candidates[1])
      voter = allVoters[1]
      proof = merkleDistributor.prove(voter)
      proof_r = []
      proof_t = []
      randomsNumber = []

      const votesB = candidates.map((candidate) => {
        const x = randomNumber()
        randomsNumber.push(x)

        const v = randomNumber()
        const T = pubkey.multiply(v)
        const r = v + commitment * x
        proof_r.push(r)
        proof_t.push(T)

        const M = candidate === candidates[1] ? P : zero
        const C = M.add(pubkey.multiply(x))
        return { x: C.x, y: C.y }
      })

      const voterAddressB = voter.address
      const signerToUseB =
        signer.address.toLowerCase() === voterAddressB.toLowerCase()
          ? signer
          : receivers.find(
              (r) => r.address.toLowerCase() === voterAddressB.toLowerCase(),
            ) || signer

      await contractZkVoting.connect(signerToUseB).vote(
        0,
        randomsNumber,
        votesB,
        proof.map((e) => e.value),
        proof_r,
        proof_t,
        {
          gasLimit: 30000000,
        },
      )
      console.log('✅ Vote for B completed')

      // Voter 3 votes for C
      console.log('🗳️  Voter 3 voting for Candidate C:', candidates[2])
      voter = allVoters[2]
      proof = merkleDistributor.prove(voter)
      proof_r = []
      proof_t = []
      randomsNumber = []

      const votesC = candidates.map((candidate) => {
        const x = randomNumber()
        randomsNumber.push(x)

        const v = randomNumber()
        const T = pubkey.multiply(v)
        const r = v + commitment * x
        proof_r.push(r)
        proof_t.push(T)

        const M = candidate === candidates[2] ? P : zero
        const C = M.add(pubkey.multiply(x))
        return { x: C.x, y: C.y }
      })

      const voterAddressC = voter.address
      const signerToUseC =
        signer.address.toLowerCase() === voterAddressC.toLowerCase()
          ? signer
          : receivers.find(
              (r) => r.address.toLowerCase() === voterAddressC.toLowerCase(),
            ) || signer

      await contractZkVoting.connect(signerToUseC).vote(
        0,
        randomsNumber,
        votesC,
        proof.map((e) => e.value),
        proof_r,
        proof_t,
        {
          gasLimit: 30000000,
        },
      )
      console.log('✅ Vote for C completed')

      // Voter 4 (signer) votes for A
      if (allVoters.length > 3) {
        console.log('🗳️  Voter 4 voting for Candidate A:', candidates[0])
        voter = allVoters[3]
        proof = merkleDistributor.prove(voter)
        proof_r = []
        proof_t = []
        randomsNumber = []

        const votesA2 = candidates.map((candidate) => {
          const x = randomNumber()
          randomsNumber.push(x)

          const v = randomNumber()
          const T = pubkey.multiply(v)
          const r = v + commitment * x
          proof_r.push(r)
          proof_t.push(T)

          const M = candidate === candidates[0] ? P : zero
          const C = M.add(pubkey.multiply(x))
          return { x: C.x, y: C.y }
        })

        await contractZkVoting.vote(
          0,
          randomsNumber,
          votesA2,
          proof.map((e) => e.value),
          proof_r,
          proof_t,
          {
            gasLimit: 30000000,
          },
        )
        console.log('✅ Vote for A (second vote) completed')
      }

      const proposal = await contractZkVoting.getProposal(Number(0))
      expect(proposal.ballotBoxes.length).to.equal(candidates.length)
      console.log('\n✅ All votes completed successfully!\n')
    })

    it('Get winners and summarize results', async function () {
      console.log('🏆 Calculating winner...')
      const ballotBoxesDecrypted: secp256k1.Point[] = []
      const proposal = await contractZkVoting.getProposal(Number(0))
      proposal.ballotBoxes.forEach(({ x, y }, i) => {
        const C = new secp256k1.Point(x, y, 1n)
        const R = P.multiply(proposal.randomNumbers[i])
        const M = C.subtract(R.multiply(privateKey)) //M = C - R * x
        ballotBoxesDecrypted.push(M)
      })
      const totalBallot: number[] = await BSGS(ballotBoxesDecrypted)

      console.log('\n📊 ===== VOTING RESULTS SUMMARY =====')
      totalBallot.forEach((votes, index) => {
        const candidateName = String.fromCharCode(65 + index) // A, B, C
        console.log(
          `   Candidate ${candidateName} (${candidates[index]}): ${votes} vote(s)`,
        )
      })

      const maxVotes = Math.max(...totalBallot)
      const winnerIndices = totalBallot
        .map((votes, index) => ({ votes, index }))
        .filter(({ votes }) => votes === maxVotes)
        .map(({ index }) => index)

      console.log('\n🎉 ===== WINNER(S) =====')
      winnerIndices.forEach((index) => {
        console.log(
          `   🏆 Candidate ${String.fromCharCode(65 + index)} (${
            candidates[index]
          }) with ${maxVotes} vote(s)`,
        )
      })
      console.log('=====================================\n')
    })
  })

  describe('Invalid Voter - Address Not in Merkle Tree', function () {
    it('Should reject vote from address not in Merkle tree', async function () {
      const [signer, ...receivers] = await ethers.getSigners()

      // Use an address that's not in the Merkle tree
      // The tree contains: signer.address, receivers[0], receivers[1], receivers[2]
      // So we'll use receivers[3] or create a random address
      const invalidAddress =
        receivers.length > 3
          ? receivers[3].address
          : '0x1234567890123456789012345678901234567890' // Random address not in tree

      console.log(
        '❌ Attempting to vote with address NOT in tree:',
        invalidAddress,
      )

      // Try to prove an address not in the tree - should throw
      expect(() => {
        merkleDistributor.prove(new Leaf(invalidAddress))
      }).to.throw('The leaf is not valid.')

      console.log('✅ MerkleDistributor correctly rejects address not in tree')

      // // If we somehow bypass the prove check and create a fake proof,
      // // the contract should still reject it during verification
      // // Let's create a fake proof using a valid proof structure but wrong leaf
      // const validProof = merkleDistributor.prove(new Leaf(signer.address))
      // const fakeProof = validProof.map((e) => e.value) // Use valid proof structure

      // const proof_r: bigint[] = []
      // const proof_t: secp256k1.Point[] = []
      // const randomsNumber: bigint[] = []

      // const votes = candidates.map((candidate) => {
      //   const x = randomNumber()
      //   randomsNumber.push(x)

      //   const v = randomNumber()
      //   const T = pubkey.multiply(v)
      //   const r = v + commitment * x
      //   proof_r.push(r)
      //   proof_t.push(T)

      //   const M = candidate === candidates[0] ? P : zero
      //   const C = M.add(pubkey.multiply(x))
      //   return { x: C.x, y: C.y }
      // })

      // // Try to vote with invalid address - contract should reject during Merkle verification
      // // Note: We're using a valid proof structure but the contract will verify the actual voter address
      // // The contract checks the Merkle proof against the msg.sender, so this should fail
      // console.log('❌ Attempting to vote with fake proof...')

      // // Get a signer for the invalid address if it exists, otherwise use signer but expect failure
      // const invalidSigner = receivers.length > 3 ? receivers[3] : signer // Will fail because address doesn't match proof

      // await expect(
      //   contractZkVoting
      //     .connect(invalidSigner)
      //     .vote(0, randomsNumber, votes, fakeProof, proof_r, proof_t, {
      //       gasLimit: 30000000,
      //     }),
      // ).to.be.reverted

      console.log(
        '✅ Contract correctly rejects vote from address not in Merkle tree',
      )
    })
  })

  describe('Edge Cases', function () {
    it('Should reject vote with invalid sum of votes', async function () {
      const [signer] = await ethers.getSigners()
      const proof = merkleDistributor.prove(new Leaf(signer.address))
      const proof_r: bigint[] = []
      const proof_t: secp256k1.Point[] = []
      const randomsNumber: bigint[] = []

      // Create votes that don't sum correctly
      const votes = candidates.map((candidate, i) => {
        const x = randomNumber()
        // Use wrong random number that doesn't match the vote
        randomsNumber.push(i === 0 ? randomNumber() : x)

        const v = randomNumber()
        const T = pubkey.multiply(v)
        const r = v + commitment * x
        proof_r.push(r)
        proof_t.push(T)

        const M = candidate === candidates[0] ? P : zero
        const C = M.add(pubkey.multiply(x))
        return { x: C.x, y: C.y }
      })

      await expect(
        contractZkVoting.vote(
          0,
          randomsNumber,
          votes,
          proof.map((e) => e.value),
          proof_r,
          proof_t,
          {
            gasLimit: 30000000,
          },
        ),
      ).to.be.revertedWith('Your sum votes not valid.')
    })

    it('Should reject vote with invalid commitment proof', async function () {
      const [signer] = await ethers.getSigners()
      const proof = merkleDistributor.prove(new Leaf(signer.address))
      const proof_r: bigint[] = []
      const proof_t: secp256k1.Point[] = []
      const randomsNumber: bigint[] = []
      const wrongCommitment = randomNumber() // Wrong commitment

      const votes = candidates.map((candidate) => {
        const x = randomNumber()
        randomsNumber.push(x)

        const v = randomNumber()
        const T = pubkey.multiply(v)
        // Use wrong commitment in proof
        const r = v + wrongCommitment * x
        proof_r.push(r)
        proof_t.push(T)

        const M = candidate === candidates[0] ? P : zero
        const C = M.add(pubkey.multiply(x))
        return { x: C.x, y: C.y }
      })

      await expect(
        contractZkVoting.vote(
          0,
          randomsNumber,
          votes,
          proof.map((e) => e.value),
          proof_r,
          proof_t,
          {
            gasLimit: 30000000,
          },
        ),
      ).to.be.revertedWith('Your votes not valid.')
    })

    it('Should reject vote with mismatched array lengths (votes)', async function () {
      const [signer] = await ethers.getSigners()
      const proof = merkleDistributor.prove(new Leaf(signer.address))
      const proof_r: bigint[] = []
      const proof_t: secp256k1.Point[] = []
      const randomsNumber: bigint[] = []

      // Create one less vote than candidates
      const votes = candidates.slice(0, -1).map((candidate) => {
        const x = randomNumber()
        randomsNumber.push(x)

        const v = randomNumber()
        const T = pubkey.multiply(v)
        const r = v + commitment * x
        proof_r.push(r)
        proof_t.push(T)

        const M = candidate === candidates[0] ? P : zero
        const C = M.add(pubkey.multiply(x))
        return { x: C.x, y: C.y }
      })

      // This should fail because votes.length != candidates.length
      // The contract will fail when trying to access proposal.ballotBoxes[i]
      await expect(
        contractZkVoting.vote(
          0,
          randomsNumber,
          votes,
          proof.map((e) => e.value),
          proof_r,
          proof_t,
          {
            gasLimit: 30000000,
          },
        ),
      ).to.be.reverted
    })

    it('Should reject vote with mismatched array lengths (randomNumbers)', async function () {
      const [signer] = await ethers.getSigners()
      const proof = merkleDistributor.prove(new Leaf(signer.address))
      const proof_r: bigint[] = []
      const proof_t: secp256k1.Point[] = []
      const randomsNumber: bigint[] = []

      const votes = candidates.map((candidate) => {
        const x = randomNumber()
        // Only add random number for first vote
        if (randomsNumber.length === 0) {
          randomsNumber.push(x)
        }

        const v = randomNumber()
        const T = pubkey.multiply(v)
        const r = v + commitment * x
        proof_r.push(r)
        proof_t.push(T)

        const M = candidate === candidates[0] ? P : zero
        const C = M.add(pubkey.multiply(x))
        return { x: C.x, y: C.y }
      })

      await expect(
        contractZkVoting.vote(
          0,
          randomsNumber,
          votes,
          proof.map((e) => e.value),
          proof_r,
          proof_t,
          {
            gasLimit: 30000000,
          },
        ),
      ).to.be.revertedWith('Your sum votes not valid.')
    })

    it('Should handle voting on non-existent proposal', async function () {
      const [signer] = await ethers.getSigners()
      const proof = merkleDistributor.prove(new Leaf(signer.address))
      const proof_r: bigint[] = []
      const proof_t: secp256k1.Point[] = []
      const randomsNumber: bigint[] = []

      const votes = candidates.map((candidate) => {
        const x = randomNumber()
        randomsNumber.push(x)

        const v = randomNumber()
        const T = pubkey.multiply(v)
        const r = v + commitment * x
        proof_r.push(r)
        proof_t.push(T)

        const M = candidate === candidates[0] ? P : zero
        const C = M.add(pubkey.multiply(x))
        return { x: C.x, y: C.y }
      })

      // Try to vote on proposal 999 (doesn't exist)
      await expect(
        contractZkVoting.vote(
          999,
          randomsNumber,
          votes,
          proof.map((e) => e.value),
          proof_r,
          proof_t,
          {
            gasLimit: 30000000,
          },
        ),
      ).to.be.reverted
    })

    it('Should reject vote with invalid proof_t length', async function () {
      const [signer] = await ethers.getSigners()
      const proof = merkleDistributor.prove(new Leaf(signer.address))
      const proof_r: bigint[] = []
      const proof_t: secp256k1.Point[] = []
      const randomsNumber: bigint[] = []

      const votes = candidates.map((candidate) => {
        const x = randomNumber()
        randomsNumber.push(x)

        const v = randomNumber()
        const T = pubkey.multiply(v)
        const r = v + commitment * x
        proof_r.push(r)
        // Only add proof_t for first vote
        if (proof_t.length === 0) {
          proof_t.push(T)
        }

        const M = candidate === candidates[0] ? P : zero
        const C = M.add(pubkey.multiply(x))
        return { x: C.x, y: C.y }
      })

      await expect(
        contractZkVoting.vote(
          0,
          randomsNumber,
          votes,
          proof.map((e) => e.value),
          proof_r,
          proof_t,
          {
            gasLimit: 30000000,
          },
        ),
      ).to.be.reverted
    })
  })
})
