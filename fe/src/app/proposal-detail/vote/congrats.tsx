'use client'

export default function Congrats() {
  return (
    <div className="flex flex-col gap-6 items-center">
      <h5>Your vote is cast.</h5>
      <img
        src="https://i.imgur.com/ZFvWGG1_d.webp?maxwidth=760&fidelity=grand"
        alt="congrats"
        className="h-44 w-44"
      />
      <p className="text-center">
        Thank you for casting your vote in this campaign! Please revisit us
        after the campaign concludes to view the results
      </p>
    </div>
  )
}
