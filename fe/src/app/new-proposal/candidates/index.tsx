import { Plus } from 'lucide-react'
import CandidateInput from './candidateInput'
import { isAddress } from 'ethers'
import { useState } from 'react'
import { useGlobalCampaign } from '@/hooks/atbash'

type CandidatesProp = {
  onBack: () => void
  onNext: () => void
}

export default function Candidates({ onNext, onBack }: CandidatesProp) {
  const [campaign, seCampaign] = useGlobalCampaign()
  const [address, setAddress] = useState('')
  const { candidates } = campaign

  const onAddAddress = () => {
    if (!isAddress(address)) return
    const nextCandidates = [address, ...candidates]
    const nextCampaign = { ...campaign, candidates: nextCandidates }
    seCampaign(nextCampaign)
    return setAddress('')
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full flex flex-col gap-1">
        <h5>Candidate Settings</h5>
        <p className="caption opacity-50">
          Add the list of candidates eligible to be elected
        </p>
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <p>Candidate’s Wallet Address</p>
        <div className="flex gap-4">
          <input
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Input candidate's address"
            className="input w-full bg-gray-100 flex-auto"
            value={address}
          />
          <button
            disabled={!address}
            onClick={onAddAddress}
            className="btn btn-primary text-black"
          >
            <Plus />
            Add
          </button>
        </div>
      </div>
      {candidates.map((address) => (
        <div key={address} className="col-span-full">
          <CandidateInput address={address} />
        </div>
      ))}
      <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-2">
        <button
          disabled={!candidates.length}
          onClick={onBack}
          className="btn  w-full text-black mt-4"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="btn btn-primary w-full text-black mt-4"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
