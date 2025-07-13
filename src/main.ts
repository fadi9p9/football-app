import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // زيادة حجم الـ payload المسموح به
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // خدمة الملفات الثابتة مع إعدادات محسنة
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads'), {
    setHeaders: (res, path) => {
      res.set('Cache-Control', 'public, max-age=31536000');
    }
  }));

  // تمكين CORS إذا لزم الأمر
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    console.log('Static files served from:', join(__dirname, '..', 'uploads'));
  });
}
bootstrap();