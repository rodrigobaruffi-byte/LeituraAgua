import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { deleteLeitura, Leitura, LeituraSanepar, listLeiturasSanepar, listLeituras } from '../api';
import { ConsumoChart } from '../components/ConsumoChart';
import { HistoricoLeituras } from '../components/HistoricoLeituras';
import { Indicadores } from '../components/Indicadores';
import { NovaLeituraForm } from '../components/NovaLeituraForm';

type Props = {
  onAbrirSanepar: () => void;
};

export function HomeScreen({ onAbrirSanepar }: Props) {
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [leiturasSanepar, setLeiturasSanepar] = useState<LeituraSanepar[]>([]);

  const carregar = useCallback(async () => {
    const [leiturasData, saneparData] = await Promise.all([
      listLeituras(),
      listLeiturasSanepar(),
    ]);
    setLeituras(leiturasData);
    setLeiturasSanepar(saneparData);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function excluir(id: number) {
    await deleteLeitura(id);
    carregar();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>💧 Controle de Consumo de Água</Text>
        <Text style={styles.subtitulo}>
          Acompanhamento de leituras do hidrômetro e consumo desde a última referência da Sanepar
        </Text>
      </View>

      <Indicadores leituras={leituras} leiturasSanepar={leiturasSanepar} />

      <Pressable style={styles.botaoSanepar} onPress={onAbrirSanepar}>
        <Text style={styles.botaoSaneparTexto}>Leitura Sanepar</Text>
      </Pressable>

      <NovaLeituraForm onCriada={carregar} />

      <ConsumoChart leituras={leituras} />

      <HistoricoLeituras
        leituras={leituras}
        leiturasSanepar={leiturasSanepar}
        onExcluir={excluir}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, maxWidth: 720, width: '100%', alignSelf: 'center' },
  cabecalho: { gap: 4, marginBottom: 4 },
  titulo: { fontSize: 22, fontWeight: '700', color: '#18181b' },
  subtitulo: { fontSize: 13, color: '#71717a' },
  botaoSanepar: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f4f4f5',
  },
  botaoSaneparTexto: { color: '#18181b', fontWeight: '500' },
});
