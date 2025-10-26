import { ReactNode } from 'react'

export default function ProposalDetailsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <div className="w-full flex flex-col items-center">{children}</div>
}
