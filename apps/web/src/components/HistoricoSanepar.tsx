import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LeituraSanepar } from '../api';
import { tabelaTarifa } from '../consumo';

type Props = {
  leituras: LeituraSanepar[];
  onExcluir: (id: number) => void;
};

export function HistoricoSanepar({ leituras, onExcluir }: Props) {
  const crescente = [...leituras].sort((a, b) => a.datasanepar.localeCompare(b.datasanepar));
  // Consumo = leitura do mês menos a do mês anterior (a mais antiga não tem anterior).
  const consumoPorId = new Map(
    crescente.map((l, i) => [
      l.id,
      i > 0 ? Number(l.valorsanepar) - Number(crescente[i - 1].valorsanepar) : null,
    ]),
  );
  const ordenadas = [...crescente].reverse();

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Histórico de leituras Sanepar</Text>

      <View style={styles.linhaCabecalho}>
        <Text style={[styles.celula, styles.cabecalho]}>Data</Text>
        <Text style={[styles.celula, styles.cabecalho]}>Leitura (m³)</Text>
        <Text style={[styles.celula, styles.cabecalho]}>Consumo (m³)</Text>
        <Text style={[styles.celula, styles.cabecalho]}> </Text>
      </View>

      {ordenadas.length === 0 ? (
        <Text style={styles.vazio}>Nenhum registro ainda.</Text>
      ) : (
        ordenadas.map((item) => {
          const consumo = consumoPorId.get(item.id) ?? null;
          return (
            <View key={item.id} style={styles.linha}>
              <Text style={styles.celula}>{item.datasanepar}</Text>
              <Text style={styles.celula}>{Number(item.valorsanepar).toFixed(2)}</Text>
              <Text style={styles.celula}>{consumo !== null ? consumo.toFixed(2) : '—'}</Text>
              <View style={styles.celula}>
                <Pressable onPress={() => onExcluir(item.id)}>
                  <Text style={styles.excluir}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

export function RegraCalculoConsumo() {
  const linhas = tabelaTarifa();

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Regra de cálculo da fatura</Text>
      <Text style={styles.nota}>
        O consumo do mês é cobrado por faixas: cada faixa vale só para os m³ que caem dentro dela.
        Valores do m³ já somam água e esgoto (esgoto = 85% da água).
      </Text>

      <View style={styles.linhaCabecalho}>
        <Text style={[styles.celula, styles.cabecalho, { flex: 1.4 }]}>Faixa</Text>
        <Text style={[styles.celula, styles.cabecalho]}>Volume</Text>
        <Text style={[styles.celula, styles.cabecalho]}>Valor do m³</Text>
      </View>

      {linhas.map((l) => (
        <View key={l.faixa} style={styles.linha}>
          <Text style={[styles.celula, { flex: 1.4 }]}>{l.faixa}</Text>
          <Text style={styles.celula}>{l.volume !== null ? `${l.volume} m³` : '—'}</Text>
          <Text style={styles.celula}>
            {l.valorM3 !== null
              ? reais(l.valorM3)
              : l.valorFixo !== null
                ? `${reais(l.valorFixo)} (fixo)`
                : '—'}
          </Text>
        </View>
      ))}

      <Text style={styles.nota}>
        O consumo é considerado sem casas decimais, arredondado para baixo (19,98 m³ vale 19 m³).
      </Text>
    </View>
  );
}

/** 17.5565 -> 'R$ 17,56' */
function reais(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
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
  linhaCabecalho: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
    paddingBottom: 6,
  },
  cabecalho: { fontSize: 12, color: '#71717a', fontWeight: '600' },
  nota: { fontSize: 12, color: '#71717a' },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
    paddingVertical: 8,
  },
  celula: { flex: 1, fontSize: 13, color: '#18181b' },
  vazio: { fontSize: 13, color: '#71717a', paddingVertical: 8 },
  excluir: { color: '#b91c1c', fontSize: 13 },
});
