import { Leaf, MerkleDistributor } from 'atbash-evm'
import { useMemo } from 'react'

export const useMerkleDistributor = (voters: string[]) => {
  const merkleDistributor = useMemo(() => {
    const leafs = voters.map((voter) => new Leaf(voter))
    const merkleDistributor = new MerkleDistributor(leafs)
    return merkleDistributor
  }, [voters])

  return merkleDistributor
}
