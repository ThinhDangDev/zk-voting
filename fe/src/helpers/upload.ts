import axios from 'axios'
import { decode, encode } from 'bs58'
import { apiConfig } from '@/configs/env'

export const uploadFileToSupabase = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const { data } = await axios.post(
      `${apiConfig.baseUrl}/storage/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return data.cid as string
  } catch (error: any) {
    console.error('Upload error:', error.response?.data || error.message)
    throw new Error(
      `Upload failed: ${error.response?.data?.message || error.message}`,
    )
  }
}

const NULL = Buffer.from('00', 'hex')
const EXTENSION_LENGTH = 4
const CONTENT_LENGTH = 28

const decodeExtension = (cid: string) => {
  const buf = decode(cid)
  let ext = Buffer.from(
    buf.subarray(CONTENT_LENGTH, CONTENT_LENGTH + EXTENSION_LENGTH),
  ).toString('utf8')
  while (ext[0] === NULL.toString('utf8')) ext = ext.substring(1)
  return ext
}

export const toFilename = (cid: string) => {
  const extension = decodeExtension(cid)
  const content = new Uint8Array(
    Buffer.from(decode(cid).subarray(0, CONTENT_LENGTH)),
  )
  return `${encode(content)}.${extension}`
}

export const getFileCSV = async (fileCSV: string) => {
  return fetch(fileCSV).then(function (response) {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder('utf-8')
    return reader?.read().then(function (result) {
      return decoder.decode(result.value)
    })
  })
}
