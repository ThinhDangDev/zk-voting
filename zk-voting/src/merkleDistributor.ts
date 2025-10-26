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
    let node = new Node(leaf.value)
    let siblings = this.leaves.map((leaf) => new Node(leaf.value))
    while (!node.eq(this.root)) {
      // Find my sibling
      const index = siblings.findIndex((sibling) => node.eq(sibling))
      if (index === -1) throw new Error('The leaf is not valid.')
      let sibling: Node | undefined = undefined
      if (index % 2 === 1) sibling = siblings[index - 1]
      else if (index + 1 < siblings.length) sibling = siblings[index + 1]
      if (sibling) {
        node = node.hash(sibling)
        proof.push(sibling)
      }
      // Move to upper level
      const cache: Node[] = []
      for (let i = 0; i < siblings.length; i += 2) {
        if (i + 1 < siblings.length)
          cache.push(siblings[i].hash(siblings[i + 1]))
        else cache.push(siblings[i])
      }
      siblings = cache
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
    for (let i = 0; i < proof.length; i++) node = node.hash(proof[i])
    return this.root.eq(node)
  }

  toBuffer = () => {
    return Buffer.concat(this.leaves.map(MerkleDistributor.serialize))
  }

  static fromBuffer = (buf: Buffer): MerkleDistributor => {
    let re: Leaf[] = []
    for (let i = 0; i < buf.length; i = i + 20)
      re.push(MerkleDistributor.deserialize(buf.subarray(i, i + 20)))
    return new MerkleDistributor(re)
  }
}
