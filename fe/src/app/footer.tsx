'use client'
import X from '@/static/images/logo-x.png'
export const Footer = () => {
  return (
    <div className="bg-base-100 px-4 p-2 flex flex-col items-center justify-end">
      <div
        className="flex gap-2 items-center cursor-pointer"
        onClick={() =>
          window.open('https://twitter.com/AtbashZkVoting', '_blank')
        }
      >
        <img src={X.src} alt="x" className="h-6 w-6 rounded-full" />
        <p className="font-bold opacity-50 text-sm ">@AtbashZkVoting</p>
      </div>
    </div>
  )
}
