import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import type { D1Database } from '@cloudflare/workers-types';
import {
  createLeitura,
  createLeituraSanepar,
  deleteLeitura,
  deleteLeituraSanepar,
  listLeituras,
  listLeiturasSanepar,
} from './db';

type Bindings = { DB: D1Database };

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

const createLeituraSchema = z.object({
  dataleitura: z.string().date(),
  valorleitura: z.number(),
  fotoleitura: z.string().nullable().optional(),
});

const createLeituraSaneparSchema = z.object({
  datasanepar: z.string().date(),
  valorsanepar: z.number(),
});

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

const api = new Hono<{ Bindings: Bindings }>();

api.get('/leituras', async (c) => c.json(await listLeituras(c.env.DB)));

api.post('/leituras', async (c) => {
  const parsed = createLeituraSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ message: 'Dados inválidos', issues: parsed.error.issues }, 400);

  const created = await createLeitura(c.env.DB, {
    dataleitura: parsed.data.dataleitura,
    valorleitura: parsed.data.valorleitura,
    fotoleitura: parsed.data.fotoleitura ?? null,
  });
  return c.json(created, 201);
});

api.delete('/leituras/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (id === null) return c.json({ message: 'id inválido' }, 400);
  await deleteLeitura(c.env.DB, id);
  return c.body(null, 204);
});

api.get('/leiturassanepar', async (c) => c.json(await listLeiturasSanepar(c.env.DB)));

api.post('/leiturassanepar', async (c) => {
  const parsed = createLeituraSaneparSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ message: 'Dados inválidos', issues: parsed.error.issues }, 400);

  const created = await createLeituraSanepar(c.env.DB, parsed.data);
  return c.json(created, 201);
});

api.delete('/leiturassanepar/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (id === null) return c.json({ message: 'id inválido' }, 400);
  await deleteLeituraSanepar(c.env.DB, id);
  return c.body(null, 204);
});

app.route('/api', api);

export default app;
