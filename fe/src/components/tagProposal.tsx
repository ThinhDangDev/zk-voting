'use client'
import { useState } from 'react'
import { useInterval } from 'react-use'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

import { useProposalData } from '@/hooks/atbash'

dayjs.extend(duration)

export type TagProposalProps = {
  proposalId: number
}

export default function TagProposal({ proposalId }: TagProposalProps) {
  const [current, setCurrent] = useState(Date.now())
  const proposal = useProposalData(proposalId)

  useInterval(() => setCurrent(Date.now()), 1000)

  const start = Number(proposal.startDate) * 1000
  const end = Number(proposal.endDate) * 1000

  if (!proposal) return

  if (end < current)
    return <div className="badge badge-error py-3 px-2 rounded-sm">Ended</div>
  if (start > current)
    return (
      <div className="badge badge-warning py-3 px-2 rounded-sm">Comming</div>
    )
  return (
    <div className="badge badge-success py-3 px-2 rounded-sm ">In Progress</div>
  )
}
