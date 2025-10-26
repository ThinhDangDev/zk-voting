'use client'

import { shortenAddress, tomoscan } from '@/helpers/utils'
import { useCandidateData, useWinner } from '@/hooks/atbash'
import Vote from './vote'
import classNames from 'classnames'
import { Crown } from 'lucide-react'

type CandidateCardProps = {
  candidate: string
  proposalId: number
}

export default function CandidateCard({
  candidate,
  proposalId,
}: CandidateCardProps) {
  const { avatar, name, description } = useCandidateData(proposalId, candidate)
  const winner = useWinner(proposalId)
  const isWin = !!winner && winner === candidate
  return (
    <div
      className={classNames('card bg-base-100 p-2 h-full', {
        'border-2 border-primary': isWin,
      })}
    >
      <figure>
        <img
          src={avatar ? avatar : '/logo.svg'}
          alt="Shoes"
          className="rounded-2xl aspect-square"
          onError={(e) => {
            e.currentTarget.src = '/logo.svg'
          }}
        />
      </figure>
      <div className="flex flex-col gap-2 p-2 ">
        <div className="flex items-center gap-1">
          <h5 className="flex-auto truncate">{name}</h5>
          <p
            className="caption opacity-50 hover:cursor-pointer hover:underline"
            onClick={() => window.open(tomoscan(candidate), '_blank')}
          >
            {shortenAddress(candidate)}
          </p>
        </div>
        <p className="truncate">{description}</p>
        <Vote candidate={candidate} proposalId={proposalId} />
      </div>
      {isWin && (
        <span className="py-1 px-4 rounded-lg bg-[#69CFBD] absolute flex items-center gap-1">
          Candidate winner <Crown />
        </span>
      )}
    </div>
  )
}
