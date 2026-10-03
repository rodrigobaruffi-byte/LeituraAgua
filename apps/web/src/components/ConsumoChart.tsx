import { Fragment, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polyline, Text as SvgText } from 'react-native-svg';
import { Leitura, LeituraSanepar } from '../api';
import { calcularSerieDiaria, PontoDiario, somarDias } from '../consumo';

const ALTURA = 200;
const LARGURA = 640;
const MARGEM_ESQUERDA = 44;
const MARGEM_DIREITA = 16;
const MARGEM_TOPO = 16;
const MARGEM_BAIXO = 32;
const MAX_ROTULOS_X = 12;
const TICKS_Y = 6; // par: o ponto do meio cai num tick

type Periodo = 'total' | '30dias' | 'sanepar';

const PERIODOS: { chave: Periodo; rotulo: string }[] = [
  { chave: 'total', rotulo: 'Total' },
  { chave: '30dias', rotulo: 'Últimos 30 dias' },
  { chave: 'sanepar', rotulo: 'Leitura Sanepar' },
];

const JANELAS_MEDIA = [3, 5, 17];

type PontoGrafico = PontoDiario & { mediaMovel: number | null };

type Props = {
  leituras: Leitura[];
  leiturasSanepar: LeituraSanepar[];
};

export function ConsumoChart({ leituras, leiturasSanepar }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('total');
  const [janela, setJanela] = useState(JANELAS_MEDIA[0]);

  const serie = calcularSerieDiaria(leituras);
  const ultimaSanepar = leiturasSanepar.reduce<string | null>(
    (maior, l) => (maior === null || l.datasanepar > maior ? l.datasanepar : maior),
    null,
  );

  // A média móvel é calculada sobre a série inteira e só depois recortada no período,
  // para que o início do período já use os dias anteriores.
  const comMedia = adicionarMediaMovel(serie, janela);
  const pontos = filtrarPeriodo(comMedia, periodo, ultimaSanepar);

  return (
    <View style={styles.card}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Consumo diário (m³/dia)</Text>
        <View style={styles.botoes}>
          {PERIODOS.map(({ chave, rotulo }) => {
            const desabilitado = chave === 'sanepar' && ultimaSanepar === null;
            const ativo = periodo === chave;
            return (
              <Pressable
                key={chave}
                disabled={desabilitado}
                onPress={() => setPeriodo(chave)}
                style={[
                  styles.botao,
                  ativo && styles.botaoAtivo,
                  desabilitado && styles.botaoDesabilitado,
                ]}
              >
                <Text style={[styles.botaoTexto, ativo && styles.botaoTextoAtivo]}>{rotulo}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {pontos.length < 2 ? (
        <Text style={styles.vazio}>
          Sem dados suficientes no período selecionado para ver o gráfico.
        </Text>
      ) : (
        <Grafico pontos={pontos} />
      )}

      <View style={styles.rodape}>
        <Text style={styles.rodapeRotulo}>Média móvel (dias):</Text>
        <View style={styles.botoes}>
          {JANELAS_MEDIA.map((n) => (
            <Pressable
              key={n}
              onPress={() => setJanela(n)}
              style={[styles.botao, janela === n && styles.botaoAtivo]}
            >
              <Text style={[styles.botaoTexto, janela === n && styles.botaoTextoAtivo]}>{n}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

/** Média dos últimos `janela` dias (inclusive o próprio); nula enquanto não há dias suficientes. */
function adicionarMediaMovel(serie: PontoDiario[], janela: number): PontoGrafico[] {
  return serie.map((p, i) => {
    if (i + 1 < janela) return { ...p, mediaMovel: null };
    let soma = 0;
    for (let j = i - janela + 1; j <= i; j++) soma += serie[j].mediaDiaria;
    return { ...p, mediaMovel: soma / janela };
  });
}

function filtrarPeriodo(
  serie: PontoGrafico[],
  periodo: Periodo,
  ultimaSanepar: string | null,
): PontoGrafico[] {
  if (serie.length === 0 || periodo === 'total') return serie;

  if (periodo === '30dias') {
    const inicio = somarDias(serie[serie.length - 1].data, -29);
    return serie.filter((p) => p.data >= inicio);
  }

  if (ultimaSanepar === null) return serie;
  const inicio = somarDias(ultimaSanepar, 1);
  return serie.filter((p) => p.data >= inicio);
}

function Grafico({ pontos }: { pontos: PontoGrafico[] }) {
  const valores = pontos.flatMap((p) =>
    p.mediaMovel === null ? [p.mediaDiaria] : [p.mediaDiaria, p.mediaMovel],
  );
  const min = Math.min(0, ...valores);
  const max = Math.max(...valores, 0.01);
  const amplitude = max - min || 1;

  const larguraUtil = LARGURA - MARGEM_ESQUERDA - MARGEM_DIREITA;
  const alturaUtil = ALTURA - MARGEM_TOPO - MARGEM_BAIXO;
  const passoX = pontos.length > 1 ? larguraUtil / (pontos.length - 1) : 0;

  const escalaX = (i: number) => MARGEM_ESQUERDA + i * passoX;
  const escalaY = (valor: number) =>
    MARGEM_TOPO + alturaUtil - ((valor - min) / amplitude) * alturaUtil;

  const coordenadas = pontos.map((p, i) => ({
    x: escalaX(i),
    y: escalaY(p.mediaDiaria),
    rotulo: `${p.data.slice(8)}/${p.data.slice(5, 7)}`, // DD/MM
  }));

  const linha = coordenadas.map((p) => `${p.x},${p.y}`).join(' ');
  // Rótulos a cada 1/6 da amplitude; só mínimo, meio e máximo ganham linha de grade.
  const ticksY = Array.from({ length: TICKS_Y + 1 }, (_, i) => ({
    valor: min + (amplitude * i) / TICKS_Y,
    grade: i % (TICKS_Y / 2) === 0,
  }));
  const passoRotuloX = Math.max(1, Math.ceil(pontos.length / MAX_ROTULOS_X));
  const linhaMedia = pontos
    .flatMap((p, i) => (p.mediaMovel === null ? [] : [`${escalaX(i)},${escalaY(p.mediaMovel)}`]))
    .join(' ');

  return (
    <Svg width="100%" height={ALTURA} viewBox={`0 0 ${LARGURA} ${ALTURA}`}>
      {ticksY.map(({ valor, grade }, i) => (
        <Fragment key={i}>
          {grade ? (
            <Line
              x1={MARGEM_ESQUERDA}
              y1={escalaY(valor)}
              x2={LARGURA - MARGEM_DIREITA}
              y2={escalaY(valor)}
              stroke="#e4e4e7"
              strokeWidth={1}
            />
          ) : (
            <Line
              x1={MARGEM_ESQUERDA - 3}
              y1={escalaY(valor)}
              x2={MARGEM_ESQUERDA}
              y2={escalaY(valor)}
              stroke="#a1a1aa"
              strokeWidth={1}
            />
          )}
          <SvgText
            x={MARGEM_ESQUERDA - 8}
            y={escalaY(valor) + 3}
            fontSize={10}
            fill="#71717a"
            textAnchor="end"
          >
            {valor.toFixed(2)}
          </SvgText>
        </Fragment>
      ))}

      <Polyline points={linha} fill="none" stroke="#18181b" strokeWidth={2} />

      {linhaMedia ? (
        <Polyline points={linhaMedia} fill="none" stroke="#2563eb" strokeWidth={2} />
      ) : null}

      {coordenadas.map((p, i) => {
        const comRotulo = i % passoRotuloX === 0 || i === coordenadas.length - 1;
        return (
          <Fragment key={i}>
            <Line
              x1={p.x}
              y1={ALTURA - MARGEM_BAIXO}
              x2={p.x}
              y2={ALTURA - MARGEM_BAIXO + (comRotulo ? 5 : 3)}
              stroke="#a1a1aa"
              strokeWidth={1}
            />
            {comRotulo ? (
              <SvgText
                x={p.x}
                y={ALTURA - MARGEM_BAIXO + 17}
                fontSize={10}
                fill="#71717a"
                textAnchor="middle"
              >
                {p.rotulo}
              </SvgText>
            ) : null}
          </Fragment>
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
    gap: 8,
  },
  cabecalho: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titulo: { fontSize: 16, fontWeight: '600', color: '#18181b' },
  rodape: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rodapeRotulo: { fontSize: 12, color: '#71717a' },
  botoes: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  botao: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#f4f4f5',
  },
  botaoAtivo: { backgroundColor: '#18181b', borderColor: '#18181b' },
  botaoDesabilitado: { opacity: 0.4 },
  botaoTexto: { fontSize: 12, color: '#18181b' },
  botaoTextoAtivo: { color: '#fff' },
  vazio: { fontSize: 13, color: '#71717a' },
});
