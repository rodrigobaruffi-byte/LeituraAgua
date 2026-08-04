import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LeituraSanepar } from '../api';

type Props = {
  leituras: LeituraSanepar[];
  onExcluir: (id: number) => void;
};

export function HistoricoSanepar({ leituras, onExcluir }: Props) {
  const ordenadas = [...leituras].sort((a, b) => b.datasanepar.localeCompare(a.datasanepar));

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Histórico de leituras Sanepar</Text>

      {ordenadas.length === 0 ? (
        <Text style={styles.vazio}>Nenhum registro ainda.</Text>
      ) : (
        ordenadas.map((item) => (
          <View key={item.id} style={styles.linha}>
            <Text style={styles.celula}>{item.datasanepar}</Text>
            <Text style={styles.celula}>{Number(item.valorsanepar).toFixed(2)} m³</Text>
            <Pressable onPress={() => onExcluir(item.id)}>
              <Text style={styles.excluir}>Excluir</Text>
            </Pressable>
          </View>
        ))
      )}
    </View>
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
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
    paddingVertical: 8,
  },
  celula: { fontSize: 13, color: '#18181b' },
  vazio: { fontSize: 13, color: '#71717a', paddingVertical: 8 },
  excluir: { color: '#b91c1c', fontSize: 13 },
});
