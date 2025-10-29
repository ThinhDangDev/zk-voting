import {
  Leaf as ZKLeaf,
  MerkleDistributor as ZKMerkleDistributor,
} from '@thinhdang1402/zk-voting'
import { useMemo } from 'react'

export const useMerkleDistributor = (voters: string[]) => {
  const merkleDistributor = useMemo(() => {
    const leafs = voters.map((voter) => new ZKLeaf(voter))
    const merkleDistributor = new ZKMerkleDistributor(leafs)
    return merkleDistributor
  }, [voters])

  return merkleDistributor
}
