import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const multer = require('multer');
const upload = multer({dest: 'images/'}) // dest : 저장 위치

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync('../../key.pem'),
    cert: readFileSync('../../cert.pem')
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions
  });
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'static'));


  await app.listen(3000);
}
bootstrap();
