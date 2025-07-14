import { Handler, Context } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as serverless from 'aws-serverless-express';

let cachedServer;

export const handler: Handler = async (event: any, context: any) => {
  if (!cachedServer) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const nestApp = await NestFactory.create(AppModule, adapter);
    await nestApp.init();
    cachedServer = serverless.createServer(expressApp);
  }

  return serverless.proxy(cachedServer, event, context);
};