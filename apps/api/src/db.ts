import type { D1Database } from '@cloudflare/workers-types';

type LeituraRow = {
  id: number;
  dataleitura: string;
  valorleitura: number;
  fotoleitura: string | null;
};

type LeituraSaneparRow = {
  id: number;
  datasanepar: string;
  valorsanepar: number;
};

export type Leitura = Omit<LeituraRow, 'valorleitura'> & { valorleitura: string };
export type LeituraSanepar = Omit<LeituraSaneparRow, 'valorsanepar'> & { valorsanepar: string };

function formatLeitura(row: LeituraRow): Leitura {
  return { ...row, valorleitura: row.valorleitura.toFixed(2) };
}

function formatLeituraSanepar(row: LeituraSaneparRow): LeituraSanepar {
  return { ...row, valorsanepar: row.valorsanepar.toFixed(2) };
}

export async function listLeituras(db: D1Database): Promise<Leitura[]> {
  const { results } = await db
    .prepare(
      `SELECT id, dataleitura, valorleitura, fotoleitura
       FROM leitura
       ORDER BY dataleitura ASC, id ASC`,
    )
    .all<LeituraRow>();
  return results.map(formatLeitura);
}

export async function createLeitura(
  db: D1Database,
  data: { dataleitura: string; valorleitura: number; fotoleitura: string | null },
): Promise<Leitura> {
  const row = await db
    .prepare(
      `INSERT INTO leitura (dataleitura, valorleitura, fotoleitura)
       VALUES (?, ?, ?)
       RETURNING id, dataleitura, valorleitura, fotoleitura`,
    )
    .bind(data.dataleitura, data.valorleitura, data.fotoleitura)
    .first<LeituraRow>();
  return formatLeitura(row!);
}

export async function deleteLeitura(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM leitura WHERE id = ?').bind(id).run();
}

export async function listLeiturasSanepar(db: D1Database): Promise<LeituraSanepar[]> {
  const { results } = await db
    .prepare(
      `SELECT id, datasanepar, valorsanepar
       FROM leiturasanepar
       ORDER BY datasanepar ASC, id ASC`,
    )
    .all<LeituraSaneparRow>();
  return results.map(formatLeituraSanepar);
}

export async function createLeituraSanepar(
  db: D1Database,
  data: { datasanepar: string; valorsanepar: number },
): Promise<LeituraSanepar> {
  const row = await db
    .prepare(
      `INSERT INTO leiturasanepar (datasanepar, valorsanepar)
       VALUES (?, ?)
       RETURNING id, datasanepar, valorsanepar`,
    )
    .bind(data.datasanepar, data.valorsanepar)
    .first<LeituraSaneparRow>();
  return formatLeituraSanepar(row!);
}

export async function deleteLeituraSanepar(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM leiturasanepar WHERE id = ?').bind(id).run();
}
