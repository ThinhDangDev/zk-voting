'use client'
import { useCandidateData, useWinner } from '@/hooks/atbash'

export default function WinnerAvatar({ proposalId }: { proposalId: number }) {
  const winner = useWinner(proposalId)
  const winnerMetadata = useCandidateData(proposalId, winner)

  if (!winner) return null

  return (
    <div className="flex gap-2 items-center bg-[#69CFBD] px-1 py-2 rounded-lg">
      <p className="font-bold">Winner: </p>
      <img
        src={winnerMetadata.avatar}
        className="h-8 w-8 rounded-full"
        alt="winner"
      />
    </div>
  )
}
