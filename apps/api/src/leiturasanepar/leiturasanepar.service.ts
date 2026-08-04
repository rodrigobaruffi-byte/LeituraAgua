import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { CreateLeituraSaneparDto } from './dto/create-leiturasanepar.dto';

@Injectable()
export class LeiturasSaneparService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  findAll() {
    return this.pool
      .query(
        `SELECT id, datasanepar, valorsanepar
         FROM leiturasanepar
         ORDER BY datasanepar ASC, id ASC`,
      )
      .then((result) => result.rows);
  }

  create(dto: CreateLeituraSaneparDto) {
    return this.pool
      .query(
        `INSERT INTO leiturasanepar (datasanepar, valorsanepar)
         VALUES ($1, $2)
         RETURNING id, datasanepar, valorsanepar`,
        [dto.datasanepar, dto.valorsanepar],
      )
      .then((result) => result.rows[0]);
  }

  remove(id: number) {
    return this.pool
      .query('DELETE FROM leiturasanepar WHERE id = $1', [id])
      .then(() => undefined);
  }
}
