import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'

import { EnvironmentVariables } from 'config/configuration'
import { toCID, toFilename } from 'helpers/cid'

@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService<EnvironmentVariables>) {}

  // "ouwoclwnuyxtbweimeaf" = project ref, "zk-voting" = bucket name
  private readonly supabaseUrl =
    this.config.get('storage.supabaseURL', { infer: true }) ||
    'https://ouwoclwnuyxtbweimeaf.supabase.co'
  private readonly supabaseKey = this.config.get('storage.supabaseKEY', {
    infer: true,
  })
  private readonly bucket = 'zk-voting'

  private readonly supabaseClient = createClient(
    this.supabaseUrl,
    this.supabaseKey,
  )

  /**
   * Get the public URL of a file stored in the 'zk-voting' bucket under the 'public/' folder.
   * Example result:
   * https://ouwoclwnuyxtbweimeaf.supabase.co/storage/v1/object/public/zk-voting/public/<filename>
   */
  private toUrl(filename: string) {
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/public/${filename}`
  }

  /**
   * Upload a file to the Supabase 'zk-voting' bucket under 'public/'.
   * Returns the CID, filename, and accessible URL.
   */
  async upload(file: Express.Multer.File) {
    const cid = toCID(file)
    const filename = toFilename(cid)
    const pathInBucket = `public/${filename}`

    // Upload file with upsert=true (overwrite if exists)
    const { data: uploadData, error: uploadError } =
      await this.supabaseClient.storage
        .from(this.bucket)
        .upload(pathInBucket, file.buffer, {
          cacheControl: '3600',
          upsert: true,
        })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const url = this.toUrl(filename)
    return { cid, filename, url }
  }
}
