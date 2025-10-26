'use client'

import Link from 'next/link'

import Island from '@/components/island'
import ProposalCard from './proposalCard'
import Header from './header'
import { Plus } from 'lucide-react'

import { useProposalCount } from '@/hooks/atbash'

export default function Home() {
  const { amount } = useProposalCount()
  const proposals = Array.from(Array(amount).keys())
    .reverse()
    .filter((e) => e !== 3)
  return (
    <Island>
      <div className="flex flex-col gap-6 pb-6">
        <header>
          <Header />
        </header>
        <div className="flex flex-col items-center">
          <div className="max-w-[1240px] w-full flex gap-6 flex-col p-4">
            <div className="flex items-center">
              <h4 className="flex-auto">All Campaigns {amount}</h4>{' '}
              {/** Hidden error campaigns */}
              <Link href="/new-proposal" className="btn btn-primary text-black">
                <Plus /> Add new
              </Link>
            </div>
            <div className="w-full grid grid-cols-12 gap-4">
              {proposals.map((proposalId) => (
                <div className="col-span-full md:col-span-4" key={proposalId}>
                  <ProposalCard proposalId={proposalId} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Island>
  )
}
