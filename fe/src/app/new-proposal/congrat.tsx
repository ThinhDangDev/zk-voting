'use client'

import { useRouter } from 'next/navigation'

import Modal from '@/components/modal'

import { tomoscan } from '@/helpers/utils'
import { useProposalCount } from '@/hooks/atbash'

export default function Congrats({ hash = '' }: { hash?: string }) {
  const { push } = useRouter()
  const { amount } = useProposalCount()
  console.log(amount)

  return (
    <Modal open={!!hash}>
      <div className="flex flex-col gap-6 items-center">
        <h5>Your Campaign Has Been Successfully Created</h5>
        <img
          src="https://i.imgur.com/ZFvWGG1_d.webp?maxwidth=760&fidelity=grand"
          alt="congrats"
          className="h-44 w-44"
        />
        <p className="text-center">
          Your campaign is now live. Do not forget to notify your members to
          participate and vote!
        </p>
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            onClick={() => push(`/proposal-detail/?proposalId=${amount}`)}
            className="btn"
          >
            Vote now
          </button>
          <button
            onClick={() => window.open(tomoscan(hash), '_blank')}
            className="btn btn-primary text-black"
          >
            View on explorer
          </button>
        </div>
      </div>
    </Modal>
  )
}
