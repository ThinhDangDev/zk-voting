import numbro from 'numbro'
import * as secp256k1 from '@noble/secp256k1'
import { isAddress } from 'ethers'
import axios from 'axios'

/**
 * Delay by async/await
 * @param ms - milisenconds
 * @returns
 */
export const asyncWait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Shorten a long address
 * @param address - The long address
 * @param num - The number of the heading and trailing characters
 * @param delimiter - The delimiter
 * @returns Shortened address
 */
export const shortenAddress = (address: string, num = 4, delimiter = '...') => {
  return (
    address.substring(0, num) +
    delimiter +
    address.substring(address.length - num, address.length)
  )
}

/**
 * Wrapped Numbro - https://numbrojs.com/old-format.html
 * @param value Value
 * @returns
 */
export const numeric = (
  value?: number | string | bigint,
): ReturnType<typeof numbro> => {
  if (!value) return numbro('0')
  return numbro(value)
}

/**
 * Validate https url address
 * @param url Https url
 * @returns true/false
 */
export const isValidURL = (url: string) => {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    url,
  )
}

/**
 * Convert from file to base64
 * @param file File
 * @param callback callback function
 */
export const fileToBase64 = (
  file: File,
  callback: (result: string) => void,
) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = async () => {
    if (reader.result) callback(reader.result.toString())
  }
}

export const randomNumber = () => {
  const r = secp256k1.utils.randomBytes(16)
  return secp256k1.utils.mod(
    BigInt(`0x${secp256k1.utils.bytesToHex(r)}`),
    secp256k1.CURVE.P,
  )
}

/**
 * Build an explorer url by the context including addresses or transaction ids
 * @param addressOrTxId - Address or TxId
 * @param cluster - Network
 * @returns Solcan URL
 */
export const tomoscan = (addressOrTxId: string): string => {
  const pathname = isAddress(addressOrTxId) ? 'address' : 'tx'
  return `https://testnet.tomoscan.io/${pathname}/${addressOrTxId}`
}

export const BSGS = async (points: secp256k1.Point[], total: number) => {
  const P = secp256k1.Point.BASE
  const result: number[] = []
  for (const G of points) {
    for (let j = 1; j <= total; j++) {
      if (secp256k1.Point.ZERO.equals(G)) {
        result.push(0)
        break
      }
      if (P.multiply(j).equals(G)) {
        result.push(j)
        break
      }
    }
  }
  return result
}

export const decrypt = async (
  C: secp256k1.Point,
  R: secp256k1.Point,
): Promise<{ x: string; y: string }> => {
  const { data } = await axios.post(
    'https://atbash-system.onrender.com/ec/decrypt/evm',
    {
      message: C.toHex(),
      r: R.toHex(),
    },
  )
  return data.message
}
