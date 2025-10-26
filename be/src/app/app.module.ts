import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { HealthModule } from './health/health.module'
import { StorageModule } from './storage/storage.module'
import { ECModule } from './ec/ec.module'

import configuration from 'config/configuration'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    HealthModule,
    StorageModule,
    ECModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
