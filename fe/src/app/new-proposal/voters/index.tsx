'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isAddress } from 'ethers'
import { parse } from 'papaparse'

import RowVoter from './row'
import Dropzone from '@/components/dropzone'

import { usePushMessage } from '@/components/message/store'
import { useGlobalCampaign, useInitProposal } from '@/hooks/atbash'
import { tomoscan } from '@/helpers/utils'
import { DEFAULT_PROPOSAL } from '@/constants'
import Congrats from '../congrat'

enum RowStatus {
  Good,
  BadAddress,
  Duplicated,
}

type VotersProp = {
  onBack: () => void
}

export default function Voters({ onBack }: VotersProp) {
  const [campaign, setCampaign] = useGlobalCampaign()
  const [newAddress, setNewAddress] = useState('')
  const [txHash, setTxHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File>()
  const { voters } = campaign
  const pushMessage = usePushMessage()
  const initProposal = useInitProposal(campaign)

  const statuses = useMemo(
    () =>
      voters.map((address, i) => {
        if (!isAddress(address)) return RowStatus.BadAddress
        if (
          voters
            .map((next, j) => next === address && i !== j)
            .reduce((a, b) => a || b, false)
        )
          return RowStatus.Duplicated
        return RowStatus.Good
      }),
    [voters],
  )
  const errors = useMemo(
    () =>
      statuses
        .map((e) => e === RowStatus.BadAddress)
        .map((e) => (e ? 1 : 0))
        .reduce<number>((a, b) => a + b, 0),
    [statuses],
  )

  const warnings = useMemo(
    () =>
      statuses
        .map((e) => e === RowStatus.Duplicated)
        .map((e) => (e ? 1 : 0))
        .reduce<number>((a, b) => a + b, 0),
    [statuses],
  )

  const onDelete = (i: number) => {
    const newData = [...voters]
    newData.splice(i, 1)
    const nextCampaign = { ...campaign, voters: newData }
    return setCampaign(nextCampaign)
  }

  const onAdd = useCallback(() => {
    const newData = [...voters]
    newData.push(newAddress)
    const nextCampaign = { ...campaign, voters: newData }
    setCampaign(nextCampaign)
    setNewAddress('')
  }, [newAddress, voters, campaign, setCampaign])

  const onInitCampaign = useCallback(async () => {
    try {
      setLoading(true)
      const txId = await initProposal()

      pushMessage(
        'alert-success',
        'Initialize proposal successfully Click to view details.',
        {
          onClick: () => window.open(tomoscan(txId || ''), '_blank'),
        },
      )
      setTxHash(txId)
      return setCampaign(DEFAULT_PROPOSAL)
    } catch (er: any) {
      return pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [initProposal, pushMessage, setCampaign])

  useEffect(() => {
    if (!file || !!voters.length) return () => {}
    parse<string[]>(file, {
      delimiter: ',',
      complete: ({ data, errors }) => {
        if (errors.length)
          errors.forEach((er) => pushMessage('alert-error', er.message))
        else {
          setCampaign({ ...campaign, voters: data.map(([address]) => address) })
        }
      },
    })
  }, [campaign, file, pushMessage, setCampaign, voters.length])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full flex flex-col gap-1">
        <h5>Voter Settings</h5>
        <p className="caption opacity-50">
          Add the EVM wallet addresses of the voters eligible to join the
          campaign
        </p>
      </div>
      <div className="col-span-full card bg-base-100 grid grid-cols-12 gap-8 ">
        <div className="col-span-full grid grid-cols-12 gap-x-2 gap-y-6">
          <div className="col-span-full flex flex-col gap-2">
            {voters.map((address, i) => (
              <RowVoter
                key={`${address}-${i}`}
                index={String(i + 1)}
                address={address}
                onClick={() => onDelete(i)}
                error={statuses[i] === RowStatus.BadAddress}
                warning={statuses[i] === RowStatus.Duplicated}
              />
            ))}
            <RowVoter
              index={String(voters.length + 1)}
              address={newAddress}
              onAddress={setNewAddress}
              onClick={onAdd}
              toAdd
            />
          </div>
          <div className="col-span-full  @container">
            <div className="flex flex-row justify-between items-center mb-6">
              {errors > 0 && (
                <span className="text-error text-sm font-semibold">{`${errors} error(s)`}</span>
              )}
              {warnings > 0 && (
                <span className="text-warning text-sm font-semibold">{`${warnings} warning(s)`}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-full">
        <Dropzone file={file} onChange={setFile} />
      </div>
      <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-2">
        <button onClick={onBack} className="btn w-full text-black mt-4">
          Back
        </button>
        <button
          onClick={onInitCampaign}
          className="btn btn-primary w-full text-black mt-4"
          disabled={!voters.length || !!errors}
        >
          {loading && <span className="loading loading-spinner loading-sm" />}
          Create Campaign
        </button>
      </div>
      <Congrats hash={txHash} />
    </div>
  )
}
