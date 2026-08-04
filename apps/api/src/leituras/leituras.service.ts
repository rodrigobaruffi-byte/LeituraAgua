import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { CreateLeituraDto } from './dto/create-leitura.dto';

@Injectable()
export class LeiturasService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  findAll() {
    return this.pool
      .query(
        `SELECT id, dataleitura, valorleitura, fotoleitura
         FROM leitura
         ORDER BY dataleitura ASC, id ASC`,
      )
      .then((result) => result.rows);
  }

  create(dto: CreateLeituraDto) {
    return this.pool
      .query(
        `INSERT INTO leitura (dataleitura, valorleitura, fotoleitura)
         VALUES ($1, $2, $3)
         RETURNING id, dataleitura, valorleitura, fotoleitura`,
        [dto.dataleitura, dto.valorleitura, dto.fotoleitura ?? null],
      )
      .then((result) => result.rows[0]);
  }

  remove(id: number) {
    return this.pool
      .query('DELETE FROM leitura WHERE id = $1', [id])
      .then(() => undefined);
  }
}
