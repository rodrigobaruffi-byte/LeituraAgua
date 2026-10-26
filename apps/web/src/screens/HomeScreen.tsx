import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  deleteLeitura,
  Leitura,
  LeituraSanepar,
  listFotosLeituras,
  listLeiturasSanepar,
  listLeituras,
} from '../api';
import { ConsumoChart } from '../components/ConsumoChart';
import { HistoricoLeituras } from '../components/HistoricoLeituras';
import { EstimativaFatura, UltimaLeituraSanepar } from '../components/Indicadores';
import { NovaLeituraForm } from '../components/NovaLeituraForm';

type Props = {
  onAbrirSanepar: () => void;
};

export function HomeScreen({ onAbrirSanepar }: Props) {
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [leiturasSanepar, setLeiturasSanepar] = useState<LeituraSanepar[]>([]);

  const [fotos, setFotos] = useState<Map<number, string>>(new Map());

  // Fotos (base64, pesadas) vêm numa segunda requisição, depois de indicadores e gráfico.
  const carregar = useCallback(async () => {
    const [leiturasData, saneparData] = await Promise.all([
      listLeituras(),
      listLeiturasSanepar(),
    ]);
    setLeituras(leiturasData);
    setLeiturasSanepar(saneparData);

    const fotosData = await listFotosLeituras();
    setFotos(new Map(fotosData.map((f) => [f.id, f.fotoleitura])));
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

      <EstimativaFatura leituras={leituras} leiturasSanepar={leiturasSanepar} />

      <NovaLeituraForm onCriada={carregar} />

      <UltimaLeituraSanepar leiturasSanepar={leiturasSanepar} onAbrirSanepar={onAbrirSanepar} />

      <ConsumoChart leituras={leituras} leiturasSanepar={leiturasSanepar} />

      <HistoricoLeituras
        leituras={leituras}
        leiturasSanepar={leiturasSanepar}
        fotos={fotos}
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
});
