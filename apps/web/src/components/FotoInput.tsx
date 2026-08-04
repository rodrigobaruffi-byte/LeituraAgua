import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  value: string | null;
  onChange: (base64: string | null) => void;
};

// Projeto é Expo for web (não app nativo), então o acesso à câmera é feito
// via <input type="file" capture="environment">, criado imperativamente
// para não depender das tipagens DOM no tsconfig do React Native.
export function FotoInput({ value, onChange }: Props) {
  if (Platform.OS !== 'web') {
    return null;
  }

  function abrirSeletor() {
    const doc = (globalThis as any).document;
    if (!doc) return;

    const input = doc.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;

      const reader = new (globalThis as any).FileReader();
      reader.onload = () => onChange(reader.result);
      reader.readAsDataURL(file);
    };
    input.click();
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={abrirSeletor}>
        <Text style={styles.buttonText}>{value ? 'Trocar foto' : 'Tirar foto'}</Text>
      </Pressable>
      {value ? (
        <Image source={{ uri: value }} style={styles.preview} resizeMode="cover" />
      ) : null}
      {value ? (
        <Pressable onPress={() => onChange(null)}>
          <Text style={styles.remover}>Remover foto</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, alignItems: 'flex-start' },
  button: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f4f4f5',
  },
  buttonText: { color: '#18181b', fontWeight: '500' },
  preview: { width: 96, height: 96, borderRadius: 6, backgroundColor: '#e4e4e7' },
  remover: { color: '#b91c1c', fontSize: 12 },
});
