import { hexToBytes, bytesToHex, size } from 'viem'
import { Leaf } from './leaf'
import { Node } from './node'

/**
 * The merkle. By the tree, people can generate the proof and locally verify the proof.
 */
export class MerkleDistributor {
  /**
   * The list of leaves.
   */
  public readonly leaves

  /**
   * Tree constructor.
   * @param leaves The list of <address,amount> represented as leaves.
   */
  constructor(leaves: Leaf[]) {
    this.leaves = leaves.sort((a, b) => a.gte(b))
  }

  static serialize = ({ address }: Leaf): Uint8Array => {
    return Buffer.from(hexToBytes(address as any, { size: 20 }))
  }

  static deserialize = (buf: Uint8Array): Leaf => {
    return new Leaf(bytesToHex(buf))
  }

  /**
   * The merkle root.
   */
  get root() {
    let nodes = this.leaves.map((leaves) => new Node(leaves.value))
    while (nodes.length > 1) {
      const cache: Node[] = []
      for (let i = 0; i < nodes.length; i += 2) {
        if (i + 1 < nodes.length) cache.push(nodes[i].hash(nodes[i + 1]))
        else cache.push(nodes[i])
      }
      nodes = cache
    }
    return nodes[0]
  }

  /**
   * Generate the proof.
   * @param leaf Leaf.
   * @returns Proof - The list of nodes.
   */
  prove(leaf: Leaf) {
    let proof: Node[] = []
    let currentLevel = this.leaves.map((leaf) => new Node(leaf.value))
    let targetNode = new Node(leaf.value)

    while (currentLevel.length > 1) {
      const nextLevel: Node[] = []
      let foundTarget = false

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i]
        const right = currentLevel[i + 1]

        if (right) {
          // Both left and right exist
          const parent = left.hash(right)
          nextLevel.push(parent)

          // Check if target is in this pair
          if (targetNode.eq(left)) {
            proof.push(right) // Add right sibling to proof
            targetNode = parent
            foundTarget = true
          } else if (targetNode.eq(right)) {
            proof.push(left) // Add left sibling to proof
            targetNode = parent
            foundTarget = true
          }
        } else {
          // Only left exists (odd number of nodes)
          nextLevel.push(left)
          if (targetNode.eq(left)) {
            foundTarget = true
          }
        }
      }

      if (!foundTarget) {
        throw new Error('The leaf is not valid.')
      }

      currentLevel = nextLevel
    }

    return proof
  }

  /**
   * Verify the proof.
   * @param leaf The receiver info represented as a leaf.
   * @param proof The proof to the leaf.
   * @returns true/false
   */
  verify(leaf: Leaf, proof: Node[]) {
    let node = new Node(leaf.value)
    let proofIndex = 0

    // Reconstruct the path to root using the proof
    while (proofIndex < proof.length) {
      const sibling = proof[proofIndex]
      node = node.hash(sibling)
      proofIndex++
    }

    return this.root.eq(node)
  }

  toBuffer = () => {
    return Buffer.concat(this.leaves.map(MerkleDistributor.serialize))
  }

  static fromBuffer = (buf: Buffer): MerkleDistributor => {
    let re: Leaf[] = []
    for (let i = 0; i < buf.length; i = i + 20)
      re.push(
        MerkleDistributor.deserialize(new Uint8Array(buf.subarray(i, i + 20))),
      )
    return new MerkleDistributor(re)
  }
}
