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
  const IP = configuration().server.ip
  await app.listen(PORT)
  console.info(
    `⚡️[server]: Server is running at http://localhost:${PORT} or http://${IP}:${PORT}`,
  )
}
bootstrap()
