import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { types } from 'pg';
import { AppModule } from './app.module';

// Por padrão o pg converte colunas DATE em objetos Date (com timezone),
// o que transforma '2026-07-31' em '2026-07-31T03:00:00.000Z'. Mantemos
// a string como o Postgres devolve, já que dataleitura/datasanepar são
// datas de calendário, sem horário.
types.setTypeParser(types.builtins.DATE, (value) => value);

async function bootstrap() {
  // bodyParser desligado para configurar um limite maior que o padrão
  // do Express (100kb) — necessário porque fotoleitura chega como base64,
  // que facilmente passa de alguns MB numa foto de câmera de celular.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
