import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { createLeituraSanepar } from '../api';

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  onSalva: () => void;
};

export function SaneparForm({ onSalva }: Props) {
  const [data, setData] = useState(hoje());
  const [valor, setValor] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    const valorNumerico = Number(valor.replace(',', '.'));
    if (!data || Number.isNaN(valorNumerico)) {
      setErro('Preencha data e valor corretamente.');
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      await createLeituraSanepar({ datasanepar: data, valorsanepar: valorNumerico });
      setValor('');
      setData(hoje());
      onSalva();
    } catch {
      setErro('Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Registrar leitura Sanepar</Text>

      <View style={styles.campo}>
        <Text style={styles.rotulo}>Data da leitura Sanepar</Text>
        <TextInput
          style={styles.input}
          value={data}
          onChangeText={setData}
          placeholder="AAAA-MM-DD"
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.rotulo}>Valor da leitura Sanepar (m³)</Text>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={setValor}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      </View>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <Pressable style={styles.botao} onPress={salvar} disabled={salvando}>
        <Text style={styles.botaoTexto}>{salvando ? 'Salvando…' : 'Salvar'}</Text>
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
