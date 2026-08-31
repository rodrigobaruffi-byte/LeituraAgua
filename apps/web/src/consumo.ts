import { Leitura, LeituraSanepar } from './api';

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

export type EstimativaProximaLeitura = {
  /** Data provável da próxima leitura da Sanepar (YYYY-MM-DD). */
  dataProximaLeitura: string;
  /** Consumo projetado no vencimento dessa próxima leitura, em m³. */
  consumoEstimado: number;
  /** Média diária usada na projeção, em m³/dia. */
  mediaDiaria: number;
  /** Dias já lidos: da leitura Sanepar base até a leitura considerada. */
  diasLidos: number;
  /** Dias ainda a ler: da leitura considerada até a próxima leitura provável. */
  diasRestantes: number;
};

/**
 * Projeta o consumo até a próxima leitura da Sanepar, assumindo que ela
 * cairá no mesmo dia do mês da leitura oficial base. Extrapola a média
 * diária observada entre a leitura Sanepar base e `dataUltimaLeitura`
 * (dias lidos) para o ciclo inteiro (dias lidos + dias restantes).
 */
export function estimarConsumoProximaLeitura(
  consumoAteHoje: number,
  dataSanepar: string,
  dataUltimaLeitura: string,
  hoje: string,
): EstimativaProximaLeitura | null {
  const diasLidos = diasEntre(dataSanepar, dataUltimaLeitura);
  if (diasLidos <= 0) return null;

  const mediaDiaria = consumoAteHoje / diasLidos;
  const referencia = dataUltimaLeitura > hoje ? dataUltimaLeitura : hoje;
  const dataProximaLeitura = proximaDataMesmoDia(dataSanepar, referencia);
  const diasCiclo = diasEntre(dataSanepar, dataProximaLeitura);
  const consumoEstimado = mediaDiaria * diasCiclo;

  return {
    dataProximaLeitura,
    consumoEstimado,
    mediaDiaria,
    diasLidos,
    diasRestantes: diasCiclo - diasLidos,
  };
}

/**
 * Leitura da Sanepar que serve de base para uma data: a mais recente com
 * `datasanepar <= data`. Retorna `null` se não houver nenhuma anterior.
 */
export function saneparBaseParaData(
  data: string,
  leiturasSanepar: LeituraSanepar[],
): LeituraSanepar | null {
  return (
    leiturasSanepar
      .filter((s) => s.datasanepar <= data)
      .sort((a, b) => b.datasanepar.localeCompare(a.datasanepar))[0] ?? null
  );
}

/**
 * Mesma estimativa da tela inicial, porém ancorada numa leitura específica
 * do histórico: usa o consumo acumulado desde a leitura Sanepar base até
 * essa leitura e projeta o ciclo cujo fim é a próxima leitura provável.
 */
export function estimativaAcumuladaNaLeitura(
  leitura: Leitura,
  leiturasSanepar: LeituraSanepar[],
): EstimativaProximaLeitura | null {
  const base = saneparBaseParaData(leitura.dataleitura, leiturasSanepar);
  if (!base) return null;

  const consumoAcumulado =
    Number(leitura.valorleitura) - Number(base.valorsanepar);

  return estimarConsumoProximaLeitura(
    consumoAcumulado,
    base.datasanepar,
    leitura.dataleitura,
    leitura.dataleitura,
  );
}

/**
 * A partir de `dataBase`, avança mês a mês mantendo o dia do mês até
 * passar de `aposData`. Dias inexistentes (ex.: 31 em fevereiro) caem no
 * último dia do mês.
 */
function proximaDataMesmoDia(dataBase: string, aposData: string): string {
  const [ano, mes, dia] = dataBase.split('-').map(Number);
  let a = ano;
  let m = mes; // 1-based
  let candidato = '';
  do {
    m += 1;
    if (m > 12) {
      m = 1;
      a += 1;
    }
    const ultimoDiaDoMes = new Date(a, m, 0).getDate();
    const d = Math.min(dia, ultimoDiaDoMes);
    candidato = `${a}-${pad(m)}-${pad(d)}`;
  } while (candidato <= aposData);
  return candidato;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
