'use client'

type BannerProps = {
  imageUrl: string
}

export default function Banner({ imageUrl }: BannerProps) {
  return (
    <div
      className="hero h-64 p-6 banner-campaign before:h-64"
      style={{
        backgroundImage: `url(${imageUrl})`,
      }}
    />
  )
}
