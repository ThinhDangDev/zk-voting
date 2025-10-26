'use client'
import { useMemo } from 'react'
import classNames from 'classnames'

import { Trash, UserPlus } from 'lucide-react'

export type RowVoterProps = {
  index?: string
  address?: string
  onAddress?: (address: string) => void
  onClick?: () => void
  toAdd?: boolean
  error?: boolean
  warning?: boolean
}

export default function RowVoter({
  index = '',
  address = '',
  onAddress = () => {},
  onClick = () => {},
  toAdd = false,
  error = false,
  warning = false,
}: RowVoterProps) {
  const Icon = useMemo(() => (toAdd ? UserPlus : Trash), [toAdd])

  const color = useMemo(() => {
    if (error) return ' bg-error text-error-content'
    if (warning) return ' bg-[#FA8C16] text-warning-content'
    else return ' bg-base-200'
  }, [error, warning])

  return (
    <div className="relative flex flex-row items-center">
      <div className="flex-auto grid grid-cols-12 join">
        <input
          type="text"
          placeholder="Voter address"
          className={classNames(
            'col-span-12 join-item input input-sm rounded-full focus:outline-0 pl-8',
            color,
          )}
          value={address}
          onChange={(e) => onAddress(e.target.value)}
        />
      </div>
      {index && (
        <button className="btn btn-xs btn-circle absolute left-1">
          {index}
        </button>
      )}
      <button
        className={classNames('btn btn-xs btn-circle absolute right-1', {
          'btn-primary': toAdd,
        })}
        onClick={onClick}
      >
        <Icon className="w-3 h-3" />
      </button>
    </div>
  )
}
