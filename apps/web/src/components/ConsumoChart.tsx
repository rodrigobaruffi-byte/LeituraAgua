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

type Periodo = 'total' | '30dias' | 'sanepar';

const PERIODOS: { chave: Periodo; rotulo: string }[] = [
  { chave: 'total', rotulo: 'Total' },
  { chave: '30dias', rotulo: 'Últimos 30 dias' },
  { chave: 'sanepar', rotulo: 'Leitura Sanepar' },
];

type Props = {
  leituras: Leitura[];
  leiturasSanepar: LeituraSanepar[];
};

export function ConsumoChart({ leituras, leiturasSanepar }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('total');

  const serie = calcularSerieDiaria(leituras);
  const ultimaSanepar = leiturasSanepar.reduce<string | null>(
    (maior, l) => (maior === null || l.datasanepar > maior ? l.datasanepar : maior),
    null,
  );

  const pontos = filtrarPeriodo(serie, periodo, ultimaSanepar);

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
    </View>
  );
}

function filtrarPeriodo(
  serie: PontoDiario[],
  periodo: Periodo,
  ultimaSanepar: string | null,
): PontoDiario[] {
  if (serie.length === 0 || periodo === 'total') return serie;

  if (periodo === '30dias') {
    const inicio = somarDias(serie[serie.length - 1].data, -29);
    return serie.filter((p) => p.data >= inicio);
  }

  if (ultimaSanepar === null) return serie;
  const inicio = somarDias(ultimaSanepar, 1);
  return serie.filter((p) => p.data >= inicio);
}

function Grafico({ pontos }: { pontos: PontoDiario[] }) {
  const valores = pontos.map((p) => p.mediaDiaria);
  const media = valores.reduce((soma, v) => soma + v, 0) / valores.length;
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
  const ticksY = [min, (min + max) / 2, max];
  const passoRotuloX = Math.max(1, Math.ceil(pontos.length / 6));
  const yMedia = escalaY(media);

  return (
    <Svg width="100%" height={ALTURA} viewBox={`0 0 ${LARGURA} ${ALTURA}`}>
      {ticksY.map((valor, i) => (
        <Fragment key={i}>
          <Line
            x1={MARGEM_ESQUERDA}
            y1={escalaY(valor)}
            x2={LARGURA - MARGEM_DIREITA}
            y2={escalaY(valor)}
            stroke="#e4e4e7"
            strokeWidth={1}
          />
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

      <Line
        x1={MARGEM_ESQUERDA}
        y1={yMedia}
        x2={LARGURA - MARGEM_DIREITA}
        y2={yMedia}
        stroke="#2563eb"
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
      <SvgText
        x={LARGURA - MARGEM_DIREITA}
        y={yMedia - 4}
        fontSize={10}
        fill="#2563eb"
        textAnchor="end"
      >
        {`média ${media.toFixed(2)}`}
      </SvgText>

      {coordenadas.map((p, i) =>
        i % passoRotuloX === 0 || i === coordenadas.length - 1 ? (
          <SvgText
            key={i}
            x={p.x}
            y={ALTURA - MARGEM_BAIXO + 16}
            fontSize={10}
            fill="#71717a"
            textAnchor="middle"
          >
            {p.rotulo}
          </SvgText>
        ) : null,
      )}
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
