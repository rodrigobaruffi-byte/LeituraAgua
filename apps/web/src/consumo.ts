import { Leitura } from './api';

export type PontoConsumo = {
  data: string;
  consumoPeriodo: number;
  mediaDiaria: number;
};

/**
 * Recebe leituras em qualquer ordem e retorna, em ordem cronológica,
 * o consumo de cada intervalo entre leituras consecutivas.
 */
export function calcularConsumoPorPeriodo(leituras: Leitura[]): PontoConsumo[] {
  const ordenadas = [...leituras].sort((a, b) => a.dataleitura.localeCompare(b.dataleitura));

  const pontos: PontoConsumo[] = [];
  for (let i = 1; i < ordenadas.length; i++) {
    const anterior = ordenadas[i - 1];
    const atual = ordenadas[i];

    const consumoPeriodo = Number(atual.valorleitura) - Number(anterior.valorleitura);
    const dias = Math.max(
      1,
      diasEntre(anterior.dataleitura, atual.dataleitura),
    );

    pontos.push({
      data: atual.dataleitura,
      consumoPeriodo,
      mediaDiaria: consumoPeriodo / dias,
    });
  }

  return pontos;
}

function diasEntre(dataInicio: string, dataFim: string): number {
  const inicio = new Date(dataInicio).getTime();
  const fim = new Date(dataFim).getTime();
  return Math.round((fim - inicio) / (1000 * 60 * 60 * 24));
}
