import React, { ReactNode } from 'react'

export default function NewProposalLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-center w-full h-full p-4">
      <div className="max-w-[770px] w-full h-full">{children}</div>
    </div>
  )
}
