'use client'
import { useCallback, useState } from 'react'
import copy from 'copy-to-clipboard'

import { Check, Copy } from 'lucide-react'
import { asyncWait } from '@/helpers/utils'

export type ClipboardProps = {
  content: string
  idleText?: string
  className?: string
  iconClassName?: string
  tooltipClassName?: string
}

export default function Clipboard({
  content,
  idleText = 'Copy',
  className = 'btn btn-sm btn-ghost btn-square',
  iconClassName = 'w-4 h-4',
}: ClipboardProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(async () => {
    copy(content)
    setCopied(true)
    await asyncWait(1500)
    return setCopied(false)
  }, [content])

  return (
    <span data-tip={copied ? 'Copied' : idleText}>
      <button className={className} onClick={onCopy}>
        {copied ? <Check size={18} /> : <Copy className={iconClassName} />}
      </button>
    </span>
  )
}
