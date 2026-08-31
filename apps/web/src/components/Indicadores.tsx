import { StyleSheet, Text, View } from 'react-native';
import { Leitura, LeituraSanepar } from '../api';
import { estimarConsumoProximaLeitura } from '../consumo';

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

  const hoje = new Date().toISOString().slice(0, 10);
  const estimativa =
    consumoAteHoje !== null && ultimaLeitura && ultimaSanepar
      ? estimarConsumoProximaLeitura(
          consumoAteHoje,
          ultimaSanepar.datasanepar,
          ultimaLeitura.dataleitura,
          hoje,
        )
      : null;

  return (
    <View style={styles.container}>
      <Cartao
        rotulo={
          estimativa
            ? `Próximo Consumo estimado, com data de leitura em ${dataCurta(estimativa.dataProximaLeitura)}`
            : 'Consumo estimado'
        }
        valor={estimativa ? `${estimativa.consumoEstimado.toFixed(2)} m³` : '—'}
        destaque
      />
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

function Cartao({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <View style={[styles.cartao, destaque && styles.cartaoDestaque]}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={[styles.valor, destaque && styles.valorDestaque]}>{valor}</Text>
    </View>
  );
}

/** '2026-09-15' -> '15/09' */
function dataCurta(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
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
  cartaoDestaque: {
    minWidth: '100%',
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
  },
  rotulo: { fontSize: 12, color: '#71717a', marginBottom: 4 },
  valor: { fontSize: 18, fontWeight: '600', color: '#18181b' },
  valorDestaque: { fontSize: 24, color: '#0369a1' },
});
