import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import morgan from 'morgan'
import configuration from 'config/configuration'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: '*',
  })
  app.use(
    morgan('tiny', {
      skip: ({ url }) => url === '/health',
    }),
  )
  // Start
  const PORT = configuration().server.port
  await app.listen(PORT, '0.0.0.0')
  console.info(`⚡️[server]: Server is running on port ${PORT}`)
}
bootstrap()
