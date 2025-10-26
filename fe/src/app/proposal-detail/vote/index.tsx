'use client'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'

import Modal from '@/components/modal'

import {
  useCandidateData,
  useProposalData,
  useReceipt,
  useVote,
} from '@/hooks/atbash'
import { usePushMessage } from '@/components/message/store'
import { tomoscan } from '@/helpers/utils'
import Congrats from './congrats'

type VoteProps = {
  candidate: string
  proposalId: number
}

export default function Vote({ candidate, proposalId }: VoteProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [voted, setVoted] = useState(false)
  const { avatar, name, description } = useCandidateData(proposalId, candidate)
  const vote = useVote(proposalId, candidate)
  const pushMessage = usePushMessage()
  const receipt = useReceipt(proposalId)
  const { endDate, startDate } = useProposalData(proposalId)

  const err = useMemo(() => {
    const end = Number(endDate) * 1000
    const start = Number(startDate) * 1000
    if (start > Date.now()) return 'Proposal not started'
    if (end < Date.now()) return 'Proposal has been ended!'
    if (receipt) return 'You voted'
    return ''
  }, [endDate, receipt, startDate])

  const onVote = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await vote()
      pushMessage(
        'alert-success',
        'You have voted successfully. Click to view details.',
        {
          onClick: () => window.open(tomoscan(txId || ''), '_blank'),
        },
      )
      return setVoted(true)
    } catch (er: any) {
      return pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [pushMessage, vote])

  useEffect(() => {
    if (receipt) setVoted(receipt)
  }, [receipt])

  return (
    <Fragment>
      <button
        className="btn btn-sm btn-primary text-black"
        onClick={() => setOpen(true)}
      >
        Vote
      </button>
      <Modal open={open} onCancel={() => setOpen(false)}>
        {voted ? (
          <Congrats />
        ) : (
          <div className="flex flex-col gap-6 items-center rounded-lg">
            <h4>Candidate details</h4>
            <div className="flex flex-col gap-2 items-center w-full">
              <img alt="candidate" className="h-40 w-40" src={avatar} />
              <h5>{name}</h5>
              <p className="opacity-50 caption text-sm bg-base-200 p-4 rounded-lg w-full text-center">
                {description}
              </p>
            </div>
            <button
              onClick={onVote}
              disabled={!!err}
              className="btn btn-primary text-black w-full"
            >
              {loading && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {err ? err : ` Vote for ${name}`}
            </button>
          </div>
        )}
      </Modal>
    </Fragment>
  )
}
