import { useDropzone } from 'react-dropzone'
import classNames from 'classnames'
import dayjs from 'dayjs'

import { DatePicker } from 'antd'
import { Clock, FileUp, X } from 'lucide-react'

import { fileToBase64 } from '@/helpers/utils'
import { InitProposalProps, ProposalMetadata } from '@/types'
import { useGlobalCampaign } from '@/hooks/atbash'

type CampaignProp = {
  onNext: () => void
}

export default function Campaign({ onNext }: CampaignProp) {
  const [info, setInfo] = useGlobalCampaign()
  const { description, title, image } = info.proposalMetadata
  const { startTime, endTime } = info

  const onChangeInfo = (name: keyof ProposalMetadata, value: string) => {
    const nextProposalMetadata = {
      ...info.proposalMetadata,
      [name]: value,
    }
    return setInfo({ ...info, proposalMetadata: nextProposalMetadata })
  }

  const onDrop = async (files: File[]) => {
    if (!files || !files.length) return
    const [file] = files
    fileToBase64(file, (image) => onChangeInfo('image', image))
  }

  const onChangeTime = (
    name: keyof InitProposalProps,
    value: string | number | null,
  ) => setInfo({ ...info, [name]: value })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': [],
    },
  })

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full flex flex-col gap-1">
        <h5>Create Campaign</h5>
        <p className="caption opacity-50">
          Describe what your campaign is about and set related parameters
        </p>
      </div>
      <div className="col-span-full flex flex-col gap-1">
        <p>Campaign Title</p>
        <input
          className="input bg-gray-100"
          placeholder="Input your project name"
          maxLength={64}
          value={title}
          onChange={(e) => onChangeInfo('title', e.target.value)}
        />
      </div>
      <div className="col-span-full flex flex-col gap-1">
        <p>Campaign descriptions</p>
        <textarea
          className="textarea bg-gray-100"
          placeholder="Summarize about your campaign..."
          maxLength={280}
          value={description}
          onChange={(e) => onChangeInfo('description', e.target.value)}
        />
      </div>
      <div className="col-span-6 flex flex-col gap-1">
        <p>Start time</p>
        <DatePicker
          placeholder="Select time"
          suffixIcon={<Clock />}
          className="date-option"
          onChange={(date) => onChangeTime('startTime', date?.valueOf() || 0)}
          value={startTime ? dayjs(startTime) : dayjs(Date.now())}
          showTime={{ showSecond: false }}
          placement="bottomRight"
          format={'MMM DD, YYYY HH:mm'}
          style={{ width: '100%' }}
          size="large"
        />
      </div>
      <div className="col-span-6 flex flex-col gap-1">
        <p>End time</p>
        <DatePicker
          placeholder="Select time"
          suffixIcon={<Clock />}
          className="date-option"
          onChange={(date) => onChangeTime('endTime', date?.valueOf() || 0)}
          value={endTime ? dayjs(endTime) : dayjs(Date.now())}
          showTime={{ showSecond: false }}
          placement="bottomRight"
          format={'MMM DD, YYYY HH:mm'}
          style={{ width: '100%' }}
          size="large"
        />
      </div>
      <div className="col-span-full">
        {image ? (
          <div className="col-span-full group/photo aspect-video relative rounded-xl cursor-pointer">
            <img
              src={image}
              alt="logo"
              className="rounded-xl h-full w-full group-hover/photo:opacity-60 object-cover"
            />
            <button
              onClick={() => onChangeInfo('image', '')}
              className="btn btn-ghost absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover/photo:opacity-100"
            >
              <X />
            </button>
          </div>
        ) : (
          <div className="col-span-full aspect-video">
            <div
              className=" h-full card bg-base-200 p-8 cursor-pointer border-dashed border-2 flex flex-col gap-4 items-center justify-center"
              {...getRootProps()}
            >
              <div className="bg-[#f9575e1a] p-3 rounded-xl">
                <FileUp
                  size={24}
                  className={classNames('text-primary', {
                    'animate-bounce': isDragActive,
                  })}
                />
              </div>
              <input {...getInputProps()} />
              <div className="flex flex-col gap-4 items-center">
                <p className="opacity-60 text-center">
                  Click or drag image to upload
                </p>
                <p className="opacity-60 text-xs text-center italic -mt-2">
                  Should be 800x450px with JPG, PNG file.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        disabled={!title || !description || !image}
        className="btn btn-primary col-span-full text-black mt-4"
        onClick={onNext}
      >
        Continue
      </button>
    </div>
  )
}
