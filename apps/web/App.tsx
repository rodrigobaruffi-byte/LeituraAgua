import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { SaneparScreen } from './src/screens/SaneparScreen';

type Tela = 'home' | 'sanepar';

export default function App() {
  const [tela, setTela] = useState<Tela>('home');

  return (
    <SafeAreaView style={styles.container}>
      {tela === 'home' ? (
        <HomeScreen onAbrirSanepar={() => setTela('sanepar')} />
      ) : (
        <SaneparScreen onVoltar={() => setTela('home')} />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
