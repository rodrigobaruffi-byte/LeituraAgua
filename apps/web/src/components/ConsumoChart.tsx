import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { Leitura } from '../api';
import { calcularConsumoPorPeriodo, PontoConsumo } from '../consumo';

const ALTURA = 200;
const LARGURA = 640;
const MARGEM_ESQUERDA = 44;
const MARGEM_DIREITA = 16;
const MARGEM_TOPO = 16;
const MARGEM_BAIXO = 32;

type Props = {
  leituras: Leitura[];
};

export function ConsumoChart({ leituras }: Props) {
  const pontos = calcularConsumoPorPeriodo(leituras);

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Consumo diário (m³/dia)</Text>

      {pontos.length < 2 ? (
        <Text style={styles.vazio}>
          Registre pelo menos duas leituras para ver o gráfico.
        </Text>
      ) : (
        <Grafico pontos={pontos} />
      )}
    </View>
  );
}

function Grafico({ pontos }: { pontos: PontoConsumo[] }) {
  const valores = pontos.map((p) => p.mediaDiaria);
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
    rotulo: p.data.slice(5), // MM-DD
  }));

  const linha = coordenadas.map((p) => `${p.x},${p.y}`).join(' ');
  const ticksY = [min, (min + max) / 2, max];
  const passoRotuloX = Math.max(1, Math.ceil(pontos.length / 6));

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

      {coordenadas.map((p, i) => (
        <Fragment key={i}>
          <Circle cx={p.x} cy={p.y} r={3} fill="#18181b" />
          {i % passoRotuloX === 0 || i === coordenadas.length - 1 ? (
            <SvgText
              x={p.x}
              y={ALTURA - MARGEM_BAIXO + 16}
              fontSize={10}
              fill="#71717a"
              textAnchor="middle"
            >
              {p.rotulo}
            </SvgText>
          ) : null}
        </Fragment>
      ))}
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
  titulo: { fontSize: 16, fontWeight: '600', color: '#18181b' },
  vazio: { fontSize: 13, color: '#71717a' },
});
