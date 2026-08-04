import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { types } from 'pg';
import { AppModule } from './app.module';

// Por padrão o pg converte colunas DATE em objetos Date (com timezone),
// o que transforma '2026-07-31' em '2026-07-31T03:00:00.000Z'. Mantemos
// a string como o Postgres devolve, já que dataleitura/datasanepar são
// datas de calendário, sem horário.
types.setTypeParser(types.builtins.DATE, (value) => value);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
