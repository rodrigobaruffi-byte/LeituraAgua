import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { deleteLeituraSanepar, LeituraSanepar, listLeiturasSanepar } from '../api';
import { HistoricoSanepar } from '../components/HistoricoSanepar';
import { SaneparForm } from '../components/SaneparForm';

type Props = {
  onVoltar: () => void;
};

export function SaneparScreen({ onVoltar }: Props) {
  const [leituras, setLeituras] = useState<LeituraSanepar[]>([]);

  const carregar = useCallback(async () => {
    setLeituras(await listLeiturasSanepar());
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function excluir(id: number) {
    await deleteLeituraSanepar(id);
    carregar();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cabecalho}>
        <Pressable onPress={onVoltar}>
          <Text style={styles.voltar}>← Voltar</Text>
        </Pressable>
        <Text style={styles.titulo}>Leitura Sanepar</Text>
      </View>

      <SaneparForm onSalva={carregar} />

      <HistoricoSanepar leituras={leituras} onExcluir={excluir} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, maxWidth: 720, width: '100%', alignSelf: 'center' },
  cabecalho: { gap: 4, marginBottom: 4 },
  voltar: { color: '#71717a', fontSize: 13 },
  titulo: { fontSize: 22, fontWeight: '700', color: '#18181b' },
});
