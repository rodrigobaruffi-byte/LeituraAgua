import { StyleSheet, Text, View } from 'react-native';
import { Leitura, LeituraSanepar } from '../api';

type Props = {
  leituras: Leitura[];
  leiturasSanepar: LeituraSanepar[];
};

export function Indicadores({ leituras, leiturasSanepar }: Props) {
  const ultimaSanepar = [...leiturasSanepar].sort((a, b) =>
    b.datasanepar.localeCompare(a.datasanepar),
  )[0];

  const ultimaLeitura = [...leituras].sort((a, b) =>
    b.dataleitura.localeCompare(a.dataleitura),
  )[0];

  const consumoAteHoje =
    ultimaLeitura && ultimaSanepar
      ? Number(ultimaLeitura.valorleitura) - Number(ultimaSanepar.valorsanepar)
      : null;

  return (
    <View style={styles.container}>
      <Cartao rotulo="Leituras registradas" valor={String(leituras.length)} />
      <Cartao
        rotulo="Dt última leitura Sanepar"
        valor={ultimaSanepar ? ultimaSanepar.datasanepar : '—'}
      />
      <Cartao
        rotulo="Valor leitura Sanepar"
        valor={ultimaSanepar ? `${Number(ultimaSanepar.valorsanepar).toFixed(2)} m³` : '—'}
      />
      <Cartao
        rotulo="Consumo até hoje"
        valor={consumoAteHoje !== null ? `${consumoAteHoje.toFixed(2)} m³` : '—'}
      />
    </View>
  );
}

function Cartao({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.cartao}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cartao: {
    flexGrow: 1,
    minWidth: 160,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  rotulo: { fontSize: 12, color: '#71717a', marginBottom: 4 },
  valor: { fontSize: 18, fontWeight: '600', color: '#18181b' },
});
