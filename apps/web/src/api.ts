const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

// node-postgres retorna NUMERIC como string para não perder precisão.
export type Leitura = {
  id: number;
  dataleitura: string;
  valorleitura: string;
  fotoleitura: string | null;
};

export type LeituraSanepar = {
  id: number;
  datasanepar: string;
  valorsanepar: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Falha na requisição ${path}: ${response.status}`);
  }

  if (response.status === 204 || init?.method === 'DELETE') {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listLeituras() {
  return request<Leitura[]>('/leituras');
}

export function createLeitura(data: {
  dataleitura: string;
  valorleitura: number;
  fotoleitura?: string | null;
}) {
  return request<Leitura>('/leituras', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteLeitura(id: number) {
  return request<void>(`/leituras/${id}`, { method: 'DELETE' });
}

export function listLeiturasSanepar() {
  return request<LeituraSanepar[]>('/leiturassanepar');
}

export function createLeituraSanepar(data: {
  datasanepar: string;
  valorsanepar: number;
}) {
  return request<LeituraSanepar>('/leiturassanepar', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteLeituraSanepar(id: number) {
  return request<void>(`/leiturassanepar/${id}`, { method: 'DELETE' });
}
