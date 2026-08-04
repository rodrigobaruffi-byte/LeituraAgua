import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { Leitura } from '../api';
import { calcularConsumoPorPeriodo } from '../consumo';

const ALTURA = 160;
const LARGURA = 560;
const MARGEM = 24;

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
        <Grafico pontos={pontos.map((p) => p.mediaDiaria)} />
      )}
    </View>
  );
}

function Grafico({ pontos }: { pontos: number[] }) {
  const min = Math.min(0, ...pontos);
  const max = Math.max(...pontos, 0.01);
  const passoX = (LARGURA - MARGEM * 2) / (pontos.length - 1);

  const escalaY = (valor: number) =>
    ALTURA - MARGEM - ((valor - min) / (max - min)) * (ALTURA - MARGEM * 2);

  const coordenadas = pontos.map((valor, i) => ({
    x: MARGEM + i * passoX,
    y: escalaY(valor),
  }));

  const linha = coordenadas.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width="100%" height={ALTURA} viewBox={`0 0 ${LARGURA} ${ALTURA}`}>
      <Line
        x1={MARGEM}
        y1={escalaY(0)}
        x2={LARGURA - MARGEM}
        y2={escalaY(0)}
        stroke="#e4e4e7"
        strokeWidth={1}
      />
      <Polyline points={linha} fill="none" stroke="#18181b" strokeWidth={2} />
      {coordenadas.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill="#18181b" />
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
