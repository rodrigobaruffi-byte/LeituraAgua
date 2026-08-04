import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

// Web-only: usa o <input type="date"> nativo do navegador, que já vem
// com o botão de calendário embutido. Criado imperativamente para não
// depender das tipagens DOM no tsconfig do React Native.
export function DateInput({ value, onChange }: Props) {
  const containerRef = useRef<View>(null);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    const doc = (globalThis as any).document;
    const container = containerRef.current as unknown as HTMLElement | null;
    if (!doc || !container) return;

    const input = doc.createElement('input');
    input.type = 'date';
    input.value = value;
    Object.assign(input.style, {
      border: 'none',
      outline: 'none',
      background: 'transparent',
      font: 'inherit',
      fontSize: '14px',
      width: '100%',
    });
    input.oninput = (event: any) => onChange(event.target.value);
    inputRef.current = input;
    container.appendChild(input);

    return () => {
      container.removeChild(input);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return <View ref={containerRef} style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
