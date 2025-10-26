import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { StorageService } from './storage.service'
import configuration from 'config/configuration'

const {
  storage: { maxSize },
} = configuration()

@Controller('/storage')
export class StorageController {
  constructor(private readonly service: StorageService) {}

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: parseInt(maxSize) } }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.service.upload(file)
  }
}
