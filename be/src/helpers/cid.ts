import xor from 'buffer-xor'
import bs58, { decode, encode } from 'bs58'
import { extname } from 'path'
import { hash } from 'tweetnacl'

const NULL = Buffer.from('00', 'hex')
const EXTENSION_LENGTH = 4
const CONTENT_LENGTH = 28

const hash224 = (buf: Buffer | Uint8Array) => {
  const h512 = Buffer.from(hash(buf))
  const a = h512.subarray(0, CONTENT_LENGTH)
  const b = h512.subarray(CONTENT_LENGTH, CONTENT_LENGTH * 2)
  let c = h512.subarray(CONTENT_LENGTH * 2, 64)
  while (c.length < CONTENT_LENGTH) c = Buffer.concat([NULL, c])
  return xor(xor(a, b), c)
}

const encodeExtension = (file: Express.Multer.File) => {
  const ext = extname(file.originalname).replace('.', '')
  let buf = Buffer.from(ext, 'utf8')
  if (buf.length > EXTENSION_LENGTH) throw new Error('Invalid extension')
  while (buf.length < EXTENSION_LENGTH) buf = Buffer.concat([NULL, buf])
  return buf
}

const decodeExtension = (cid: string) => {
  const buf = decode(cid)
  let ext = Buffer.from(
    buf.subarray(CONTENT_LENGTH, CONTENT_LENGTH + EXTENSION_LENGTH),
  ).toString('utf8')
  while (ext[0] === NULL.toString('utf8')) ext = ext.substring(1)
  return ext
}

export const toCID = (file: Express.Multer.File) => {
  const content = hash224(file.buffer)
  const extension = encodeExtension(file)
  const h = Buffer.concat([content, extension])
  return bs58.encode(h)
}

export const toFilename = (cid: string) => {
  const extension = decodeExtension(cid)
  const content = Buffer.from(decode(cid).subarray(0, CONTENT_LENGTH))
  return `${encode(content)}.${extension}`
}

export type S3Info = {
  bucket: string
  region: string
}
