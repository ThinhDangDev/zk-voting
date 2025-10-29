'use client'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'

import { usePushMessage } from '@/components/message/store'
import Modal from '@/components/modal'
import { Leaf } from 'lucide-react'

import {
  useCandidateData,
  useGetWinner,
  useMetadata,
  useProposalData,
  useResults,
  useWinner,
} from '@/hooks/atbash'

type GetResultProps = {
  proposalId: number
}
export default function GetResult({ proposalId }: GetResultProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGetResult, setIsGetResult] = useState(false)

  const pushMessage = usePushMessage()
  const getWinner = useGetWinner(proposalId)
  const proposal = useProposalData(proposalId)
  const { metadata } = useMetadata(proposalId)
  const winner = useWinner(proposalId)

  console.log('isGetResult', isGetResult)
  // Get candidate addresses from metadata
  const candidateAddresses = Object.keys(
    metadata?.proposalMetadata?.candidateMetadata || {},
  )

  const [result, setResult] = useState<number[]>(
    Array(candidateAddresses.length).fill(0),
  )
  const maxResult = useMemo(() => Math.max(...result), [result])
  const onGetWinner = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getWinner()
      setResult(result)
      setIsGetResult(true)
      pushMessage('alert-success', 'Get result successfully')
    } catch (er: any) {
      setIsGetResult(false)
      return pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [getWinner, pushMessage])

  useEffect(() => {
    if (proposal)
      setResult(
        proposal?.results?.map((e) => Number(e)) ||
          Array(candidateAddresses.length).fill(0),
      )
  }, [proposal, candidateAddresses.length])

  if (!proposal) return <Fragment />
  return (
    <Fragment>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-primary text-black btn-sm w-36"
      >
        <Leaf /> Get Result
      </button>
      <Modal className="max-w-3xl" open={open} onCancel={() => setOpen(false)}>
        <div className="flex flex-col w-full gap-6 items-center rounded-lg max-h-[480px] overflow-y-auto overflow-x-hidden no-scrollbar">
          <h5>{isGetResult ? 'Results' : 'Get Results'}</h5>
          <div className="grid grid-cols-12 gap-4 w-full">
            {candidateAddresses.map((address, i) => (
              <div key={address} className="md:col-span-4 col-span-full">
                <Candidate
                  address={address}
                  proposalId={Number(proposalId)}
                  result={result[i]}
                  active={!!result[i] && result[i] === maxResult}
                />
              </div>
            ))}
          </div>
          {maxResult > 0 || !!winner ? (
            <button onClick={() => setOpen(false)} className="btn btn-block">
              Close
            </button>
          ) : (
            <button
              onClick={onGetWinner}
              className="btn btn-primary text-black btn-block"
            >
              {loading && (
                <span className="loading loading-spinner loading-sm" />
              )}
              <Leaf /> Get result
            </button>
          )}
        </div>
      </Modal>
    </Fragment>
  )
}

type CandidateProps = {
  address: string
  proposalId: number
  result: number
  active: boolean
}

const Candidate = ({
  address,
  proposalId,
  result = 0,
  active = false,
}: CandidateProps) => {
  const { avatar, name } = useCandidateData(proposalId, address)

  return (
    <div
      className={classNames(
        'flex flex-col bg-base-200 rounded-2xl p-4 items-center gap-2',
        { 'border-2 border-primary': active },
      )}
    >
      <p className={classNames('text-center font-bold')}>{name}</p>
      <figure>
        <img
          src={avatar ? avatar : '/logo.svg'}
          alt="Candidate"
          className="aspect-square object-contain"
          onError={(e) => {
            e.currentTarget.src = '/logo.svg'
          }}
        />
      </figure>
      <h4
        className={classNames(
          'text-sm bg-base-100 p-2 rounded-lg w-full text-center self-end',
          { 'bg-primary': active },
        )}
      >
        {result}
      </h4>
    </div>
  )
}
