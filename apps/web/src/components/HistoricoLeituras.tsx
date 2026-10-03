import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Leitura, LeituraSanepar } from '../api';
import {
  calcularConsumoPorPeriodo,
  EstimativaProximaLeitura,
  estimativaAcumuladaNaLeitura,
} from '../consumo';

type Props = {
  leituras: Leitura[];
  leiturasSanepar: LeituraSanepar[];
  fotos: Map<number, string>;
  onExcluir: (id: number) => void;
};

export function HistoricoLeituras({ leituras, leiturasSanepar, fotos, onExcluir }: Props) {
  const mediaPorData = new Map(
    calcularConsumoPorPeriodo(leituras).map((p) => [p.data, p.mediaDiaria]),
  );

  const estimativaPorId = new Map(
    leituras.map((l) => [l.id, estimativaAcumuladaNaLeitura(l, leiturasSanepar)]),
  );

  const ordenadas = [...leituras].sort((a, b) => b.dataleitura.localeCompare(a.dataleitura));

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Histórico de leituras</Text>

      <View style={styles.linhaCabecalho}>
        <Text style={[styles.celula, styles.cabecalho, { flex: 1.2 }]}>Data</Text>
        <Text style={[styles.celula, styles.cabecalho]}>Leitura (m³)</Text>
        <Text style={[styles.celula, styles.cabecalho]}>Foto</Text>
        <Text style={[styles.celula, styles.cabecalho]}>Consumo diário</Text>
        <Text style={[styles.celula, styles.cabecalho, { flex: 1.3 }]}>Estimativa ciclo</Text>
        <Text style={[styles.celula, styles.cabecalho]}> </Text>
      </View>

      {ordenadas.length === 0 ? (
        <Text style={styles.vazio}>Nenhuma leitura registrada.</Text>
      ) : (
        ordenadas.map((leitura) => (
          <LinhaLeitura
            key={leitura.id}
            leitura={leitura}
            foto={fotos.get(leitura.id) ?? null}
            mediaDiaria={mediaPorData.get(leitura.dataleitura) ?? null}
            estimativa={estimativaPorId.get(leitura.id) ?? null}
            onExcluir={() => onExcluir(leitura.id)}
          />
        ))
      )}
    </View>
  );
}

function LinhaLeitura({
  leitura,
  foto,
  mediaDiaria,
  estimativa,
  onExcluir,
}: {
  leitura: Leitura;
  foto: string | null;
  mediaDiaria: number | null;
  estimativa: EstimativaProximaLeitura | null;
  onExcluir: () => void;
}) {
  const [ampliada, setAmpliada] = useState(false);

  return (
    <View style={styles.linha}>
      <Text style={[styles.celula, { flex: 1.2 }]}>{leitura.dataleitura}</Text>
      <Text style={styles.celula}>{Number(leitura.valorleitura).toFixed(2)}</Text>
      <View style={styles.celula}>
        {foto ? (
          <>
            <Pressable onPress={() => setAmpliada(true)}>
              <Image source={{ uri: foto }} style={styles.fotoMiniatura} resizeMode="cover" />
            </Pressable>
            <Modal
              visible={ampliada}
              transparent
              animationType="fade"
              onRequestClose={() => setAmpliada(false)}
            >
              <Pressable style={styles.modalFundo} onPress={() => setAmpliada(false)}>
                <Image source={{ uri: foto }} style={styles.fotoModal} resizeMode="contain" />
                <Text style={styles.modalFechar}>Toque para fechar</Text>
              </Pressable>
            </Modal>
          </>
        ) : leitura.temfoto ? (
          <View style={styles.fotoMiniatura} />
        ) : (
          <Text style={styles.vazioInline}>—</Text>
        )}
      </View>
      <Text style={styles.celula}>
        {mediaDiaria !== null ? mediaDiaria.toFixed(2) : '—'}
      </Text>
      <View style={[styles.celula, { flex: 1.3 }]}>
        {estimativa ? (
          <>
            <Text style={styles.estimativaValor}>
              {estimativa.consumoEstimado.toFixed(2)} m³
            </Text>
            <Text style={styles.estimativaDetalhe}>
              {estimativa.diasLidos}d lidos · {estimativa.diasRestantes}d restantes
            </Text>
            <Text style={styles.estimativaDetalhe}>
              até {dataCurta(estimativa.dataProximaLeitura)}
            </Text>
          </>
        ) : (
          <Text style={styles.vazioInline}>—</Text>
        )}
      </View>
      <View style={styles.celula}>
        <Pressable onPress={onExcluir}>
          <Text style={styles.excluir}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** '2026-09-15' -> '15/09' */
function dataCurta(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
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
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
    paddingVertical: 8,
  },
  celula: { flex: 1, fontSize: 13, color: '#18181b' },
  cabecalho: { fontSize: 12, color: '#71717a', fontWeight: '600' },
  estimativaValor: { fontSize: 13, color: '#18181b' },
  estimativaDetalhe: { fontSize: 11, color: '#a1a1aa' },
  vazio: { fontSize: 13, color: '#71717a', paddingVertical: 8 },
  vazioInline: { fontSize: 13, color: '#a1a1aa' },
  fotoMiniatura: { width: 40, height: 40, borderRadius: 4, backgroundColor: '#e4e4e7' },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 12,
  },
  fotoModal: { width: '100%', height: '85%' },
  modalFechar: { color: '#d4d4d8', fontSize: 12 },
  excluir: { color: '#b91c1c', fontSize: 13 },
});
