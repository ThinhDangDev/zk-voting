import { ImagePlus, Trash, X } from 'lucide-react'
import { ChangeEvent, useRef } from 'react'
import { fileToBase64 } from '@/helpers/utils'
import { CandidateMetadata } from '@/types'
import { isAddress } from 'ethers'
import { useGlobalCampaign } from '@/hooks/atbash'

type CandidateInputProps = {
  address?: string
}
export default function CandidateInput({ address = '' }: CandidateInputProps) {
  const [campaign, setCampaign] = useGlobalCampaign()
  const { candidates, proposalMetadata } = campaign
  const candidateMetadata = proposalMetadata.candidateMetadata
  const { avatar, description, name } = candidateMetadata[address] || {
    avatar: '',
    description: '',
    name: '',
  }
  const ref = useRef<HTMLInputElement>(null)

  const onCandidateChange = (name: keyof CandidateMetadata, value: string) => {
    if (!address) return
    const nextCandidates = { ...candidateMetadata }
    nextCandidates[address] = { ...nextCandidates[address], [name]: value }
    setCampaign({
      ...campaign,
      proposalMetadata: {
        ...campaign.proposalMetadata,
        candidateMetadata: nextCandidates,
      },
    })
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(e.target.files || [])
    fileToBase64(file, (logo) => onCandidateChange('avatar', logo))
  }

  const removeAddress = () => {
    if (!isAddress(address)) return
    const nextCandidates = candidates.filter(
      (candidate) => candidate !== address,
    )
    const nextCampaign = { ...campaign, candidates: nextCandidates }
    return setCampaign(nextCampaign)
  }

  return (
    <div className="flex gap-2 flex-col">
      <p> Fill in Candidate Info</p>
      <div className="col-span-full flex gap-2 items-center">
        <div className="relative cursor-pointer">
          {avatar ? (
            <div className="group/vc rounded-full h-24 w-24 relative">
              <img
                src={avatar}
                alt="logo"
                className="rounded-full h-full w-full group-hover/vc:opacity-60"
              />
              <X
                // onClick={() => onRemoveLogo(index)}
                className="w-4 h-4 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover/vc:opacity-100"
              />
            </div>
          ) : (
            <label className="btn btn-circle w-24 h-24 btn-secondary ">
              <ImagePlus className="w-6 h-6" />
              <input
                type="file"
                name="token-logo"
                accept="image/*"
                className="invisible absolute"
                onChange={(e) => onFileChange(e)}
                ref={ref}
              />
            </label>
          )}
        </div>
        <div className="flex-auto flex flex-col gap-2">
          <p>
            Wallet Address: <span className="opacity-50">{address}</span>
          </p>
          <input
            onChange={(e) => onCandidateChange('name', e.target.value)}
            placeholder="Input candidate's name"
            className="input  w-full bg-gray-100"
            value={name}
            maxLength={60}
          />
          <textarea
            onChange={(e) => onCandidateChange('description', e.target.value)}
            placeholder="Input candidate's description"
            className="textarea w-full bg-gray-100"
            value={description}
            maxLength={124}
          />
        </div>

        <button onClick={removeAddress} className="btn btn-error text-black">
          <Trash />
        </button>
      </div>
    </div>
  )
}
