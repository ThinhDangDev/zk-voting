'use client'
import Link from 'next/link'

import { useMetadata, useReceipt } from '@/hooks/atbash'
import TimeCountDown from '@/components/timeCountDown'
import WinnerAvatar from '@/components/winnerAvatar'
import classNames from 'classnames'

type ProposalCardProps = {
  proposalId: number
}

export default function ProposalCard({ proposalId }: ProposalCardProps) {
  const { metadata, isLoading } = useMetadata(proposalId)
  const receipt = useReceipt(proposalId)
  const { proposalMetadata } = metadata || {
    proposalMetadata: { title: '', description: '', image: '' },
  }
  return (
    <Link
      href={`/proposal-detail?proposalId=${proposalId}`}
      className="relative"
    >
      <div className="w-full bg-base-100 rounded-2xl p-4 flex flex-col gap-4 h-full relative">
        <img
          className="aspect-video rounded-2xl object-contain"
          alt="banner"
          src={
            proposalMetadata.image ? proposalMetadata.image : '/thumbnail.jpeg'
          }
          onError={(e) => {
            e.currentTarget.src = '/thumbnail.jpeg'
          }}
        />
        <div className="flex items-center flex- justify-between">
          <TimeCountDown proposalId={proposalId} />
          <WinnerAvatar proposalId={proposalId} />
        </div>
        <h5>{proposalMetadata.title}</h5>
        <p>{proposalMetadata.description}</p>
        {receipt && (
          <span className="py-2 px-4 rounded-lg bg-[#FF8460] absolute">
            Voted
          </span>
        )}
      </div>
      <div
        className={classNames(
          'w-full h-full flex flex-row justify-center items-center absolute top-0 left-0 backdrop-blur rounded-box z-10',
          {
            visible: true,
            invisible: !isLoading,
          },
        )}
      >
        <span className="loading loading-spinner loading-lg" />
      </div>
    </Link>
  )
}
