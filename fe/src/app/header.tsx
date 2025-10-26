'use client'
import Image from 'next/image'

import { ConnectButton } from '@rainbow-me/rainbowkit'

import LOGO from '@/static/images/logo.png'

export default function Header() {
  return (
    <div
      style={{ background: "url('./banner.png')" }}
      className="flex flex-col gap-4 p-4 !bg-cover !bg-no-repeat"
    >
      <div className="flex-auto flex justify-between">
        <div className="w-32 h-11 ">
          <Image src={LOGO} alt="logo" />
        </div>

        <ConnectButton />
      </div>
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-center text-primary">
          Cast Your Vote <br /> Guard Your Privacy
        </h2>
        <p className="text-primary">The Future of Privacy E-Voting</p>
      </div>
    </div>
  )
}
