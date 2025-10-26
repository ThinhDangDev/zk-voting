'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { ChevronLeft } from 'lucide-react'
import { Steps } from 'antd'
import Campaign from './campaign'
import Candidates from './candidates'
import Voters from './voters'

import './index.scss'
import Congrats from './congrat'

const PROPOSAL_INFO = 0
const CANDIDATE_INFO = 1
const VOTER_ACCEPTED = 2

export default function NewProposal() {
  const [step, setStep] = useState(PROPOSAL_INFO)
  const { back } = useRouter()

  const processInit = useMemo(() => {
    switch (step) {
      case PROPOSAL_INFO:
        return <Campaign onNext={() => setStep(CANDIDATE_INFO)} />
      case CANDIDATE_INFO:
        return (
          <Candidates
            onBack={() => setStep(PROPOSAL_INFO)}
            onNext={() => setStep(VOTER_ACCEPTED)}
          />
        )
      case VOTER_ACCEPTED:
        return <Voters onBack={() => setStep(CANDIDATE_INFO)} />
    }
  }, [step])

  return (
    <div className="bg-base-100 p-6 rounded-2xl grid grid-cols-12 gap-4">
      <div className="col-span-12 flex items-center justify-between">
        <button
          className="btn btn-sm bg-white shadow-inherit border-0 -ml-3"
          onClick={back}
        >
          <ChevronLeft /> Back
        </button>
        <h5>New Campaign</h5>
      </div>
      <Steps
        className="col-span-full mb-2"
        size="small"
        current={step}
        direction="horizontal"
      >
        <Steps.Step title="Create Campaign" />
        <Steps.Step title="Candidate Settings" />
        <Steps.Step title="Voter Settings" />
      </Steps>
      <Congrats hash="" />
      <div className="col-span-full">{processInit}</div>
    </div>
  )
}
