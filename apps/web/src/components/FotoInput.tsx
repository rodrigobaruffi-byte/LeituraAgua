import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  value: string | null;
  onChange: (base64: string | null) => void;
};

// Máximo do maior lado, em px. Uma foto de hidrômetro não precisa de mais
// que isso para o número ficar legível.
const MAX_LADO = 1280;
const QUALIDADE_JPEG = 0.7;

// Redimensiona e recomprime como JPEG usando <canvas>, para não gravar a
// foto crua da câmera (vários MB) no banco. Browsers atuais já aplicam a
// orientação EXIF ao desenhar no canvas, então não tratamos rotação aqui.
function comprimirImagem(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const g = globalThis as any;
    const url = g.URL.createObjectURL(file);
    const img = new g.Image();

    img.onload = () => {
      g.URL.revokeObjectURL(url);
      const escala = Math.min(1, MAX_LADO / Math.max(img.width, img.height));
      const w = Math.round(img.width * escala);
      const h = Math.round(img.height * escala);

      const canvas = g.document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);

      resolve(canvas.toDataURL('image/jpeg', QUALIDADE_JPEG));
    };
    img.onerror = () => {
      g.URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar a imagem'));
    };
    img.src = url;
  });
}

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

      comprimirImagem(file)
        .then(onChange)
        .catch(() => {
          // Se a compressão falhar, cai para a imagem original.
          const reader = new (globalThis as any).FileReader();
          reader.onload = () => onChange(reader.result);
          reader.readAsDataURL(file);
        });
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
