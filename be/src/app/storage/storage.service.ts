import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from '@supabase/supabase-js'

import { EnvironmentVariables } from 'config/configuration'
import { toCID, toFilename } from 'helpers/cid'

@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService<EnvironmentVariables>) {}
  private readonly supabaseUrl = this.config.get('storage.supabaseURL', {
    infer: true,
  })
  private readonly supabaseKey = this.config.get('storage.supabaseKEY', {
    infer: true,
  })
  private readonly bucket = this.config.get('storage.bucket', { infer: true })

  private readonly supabaseClient = createClient(
    this.supabaseUrl,
    this.supabaseKey,
  )

  private toUrl(filename: string) {
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/public/${filename}`
  }

  async upload(file: Express.Multer.File) {
    const cid = toCID(file)
    const filename = toFilename(cid)
    const url = this.toUrl(filename)
    await this.supabaseClient.storage
      .from(this.bucket)
      .upload(`public/${filename}`, file.buffer, {
        cacheControl: '3600',
        upsert: true,
      })
    return { cid, filename, url }
  }
}
