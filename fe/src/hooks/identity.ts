import { Point } from '@noble/secp256k1'

export const PUB_KEY =
  '047e4dc51d40d3cae8270114e49435b26455518e6688378168d83ed2d879b26cf0ab878062535ec3dcb0f5784f26b78580a259c6581598c764aee8575b19713187'

export const usePubkey = () => {
  const pubkey = Point.fromHex(PUB_KEY)
  return pubkey
}
