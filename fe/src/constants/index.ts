import { InitProposalProps, ProposalMetadata } from '@/types'

const DEFAULT_PROPOSAL_METADATA: ProposalMetadata = {
  title: '',
  description: '',
  image: '',
  candidateMetadata: {},
}

export const DEFAULT_PROPOSAL: InitProposalProps = {
  startTime: Date.now(), //now
  endTime: Date.now() + 3 * (24 * 60 * 60 * 1000), // Add more 3 days
  voters: [],
  candidates: [],
  proposalMetadata: DEFAULT_PROPOSAL_METADATA,
}
