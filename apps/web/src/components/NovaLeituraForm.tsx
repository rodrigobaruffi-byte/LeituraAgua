import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { createLeitura } from '../api';
import { DateInput } from './DateInput';
import { FotoInput } from './FotoInput';

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  onCriada: () => void;
};

export function NovaLeituraForm({ onCriada }: Props) {
  const [data, setData] = useState(hoje());
  const [valor, setValor] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    const valorNumerico = Number(valor.replace(',', '.'));
    if (!data || Number.isNaN(valorNumerico)) {
      setErro('Preencha data e leitura corretamente.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      await createLeitura({
        dataleitura: data,
        valorleitura: valorNumerico,
        fotoleitura: foto,
      });
      setValor('');
      setFoto(null);
      setData(hoje());
      onCriada();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar a leitura.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Nova leitura</Text>

      <View style={styles.campo}>
        <Text style={styles.rotulo}>Data</Text>
        <DateInput value={data} onChange={setData} />
      </View>

      <View style={styles.campo}>
        <Text style={styles.rotulo}>Leitura (m³)</Text>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={setValor}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.rotulo}>Foto</Text>
        <FotoInput value={foto} onChange={setFoto} />
      </View>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <Pressable style={styles.botao} onPress={salvar} disabled={salvando}>
        <Text style={styles.botaoTexto}>{salvando ? 'Salvando…' : 'Adicionar'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  titulo: { fontSize: 16, fontWeight: '600', color: '#18181b' },
  campo: { gap: 4 },
  rotulo: { fontSize: 12, color: '#71717a' },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  erro: { color: '#b91c1c', fontSize: 12 },
  botao: {
    alignSelf: 'flex-start',
    backgroundColor: '#18181b',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  botaoTexto: { color: '#fff', fontWeight: '600' },
});
