import { Controller, Post, Body } from '@nestjs/common'
import { ECService } from './ec.service'

@Controller('ec')
export class ECController {
  constructor(private readonly service: ECService) {}

  @Post('decrypt')
  decrypt(@Body() { message, r }: { message: string; r: string }) {
    return this.service.decrypt(message, r)
  }

  @Post('decrypt/evm')
  decryptEvm(@Body() { message, r }: { message: string; r: string }) {
    return this.service.decryptEvm(message, r)
  }
}
