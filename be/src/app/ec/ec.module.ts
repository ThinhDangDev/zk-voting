import { Module } from '@nestjs/common'
import { ECController } from './ec.controller'
import { ECService } from './ec.service'

@Module({
  imports: [],
  controllers: [ECController],
  providers: [ECService],
})
export class ECModule {}
