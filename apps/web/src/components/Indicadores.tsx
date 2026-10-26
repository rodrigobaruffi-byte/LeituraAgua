import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Leitura, LeituraSanepar } from '../api';
import { calcularValorFatura, estimarConsumoProximaLeitura } from '../consumo';

type EstimativaProps = {
  leituras: Leitura[];
  leiturasSanepar: LeituraSanepar[];
};

export function EstimativaFatura({ leituras, leiturasSanepar }: EstimativaProps) {
  const ultimaSanepar = ultimaDaSanepar(leiturasSanepar);

  const ultimaLeitura = [...leituras].sort((a, b) =>
    b.dataleitura.localeCompare(a.dataleitura),
  )[0];

  const consumoAteHoje =
    ultimaLeitura && ultimaSanepar
      ? Number(ultimaLeitura.valorleitura) - Number(ultimaSanepar.valorsanepar)
      : null;

  const hoje = new Date().toISOString().slice(0, 10);
  const estimativa =
    consumoAteHoje !== null && ultimaLeitura && ultimaSanepar
      ? estimarConsumoProximaLeitura(
          consumoAteHoje,
          ultimaSanepar.datasanepar,
          ultimaLeitura.dataleitura,
          hoje,
        )
      : null;

  // O valor é calculado sobre o consumo truncado (a tarifa não considera decimais).
  const fatura = estimativa ? calcularValorFatura(Math.floor(estimativa.consumoEstimado)) : null;

  return (
    <Grupo
      titulo="Estimativa próxima fatura"
      subtitulo={estimativa ? `Leitura prevista em ${dataCurta(estimativa.dataProximaLeitura)}` : undefined}
      destaque
    >
      <View style={styles.linha}>
        <Cartao
          rotulo="Consumo"
          valor={estimativa ? `${estimativa.consumoEstimado.toFixed(2)} m³` : '—'}
          destaque
        />
        <Cartao
          rotulo="Valor"
          valor={fatura ? reais(fatura.total) : '—'}
          detalhe={
            fatura ? `Água ${reais(fatura.agua)} + esgoto ${reais(fatura.esgoto)}` : undefined
          }
          destaque
        />
      </View>
      <View style={styles.linha}>
        <Cartao rotulo="Leituras realizadas" valor={String(leituras.length)} />
        <Cartao
          rotulo="Consumo até hoje"
          valor={consumoAteHoje !== null ? `${consumoAteHoje.toFixed(2)} m³` : '—'}
        />
      </View>
    </Grupo>
  );
}

type UltimaSaneparProps = {
  leiturasSanepar: LeituraSanepar[];
  onAbrirSanepar: () => void;
};

export function UltimaLeituraSanepar({ leiturasSanepar, onAbrirSanepar }: UltimaSaneparProps) {
  const ultimaSanepar = ultimaDaSanepar(leiturasSanepar);

  return (
    <Grupo titulo="Última Leitura Sanepar">
      <View style={styles.linha}>
        <Cartao rotulo="Data" valor={ultimaSanepar ? ultimaSanepar.datasanepar : '—'} />
        <Cartao
          rotulo="Leitura"
          valor={ultimaSanepar ? `${Number(ultimaSanepar.valorsanepar).toFixed(2)} m³` : '—'}
        />
      </View>
      <Pressable style={styles.botaoSanepar} onPress={onAbrirSanepar}>
        <Text style={styles.botaoSaneparTexto}>Leitura Sanepar</Text>
      </Pressable>
    </Grupo>
  );
}

function ultimaDaSanepar(leiturasSanepar: LeituraSanepar[]): LeituraSanepar | undefined {
  return [...leiturasSanepar].sort((a, b) => b.datasanepar.localeCompare(a.datasanepar))[0];
}

function Grupo({
  titulo,
  subtitulo,
  destaque,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  destaque?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={[styles.grupo, destaque && styles.grupoDestaque]}>
      <View style={styles.grupoCabecalho}>
        <Text style={styles.grupoTitulo}>{titulo}</Text>
        {subtitulo ? <Text style={styles.grupoSubtitulo}>{subtitulo}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Cartao({
  rotulo,
  valor,
  detalhe,
  destaque,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  destaque?: boolean;
}) {
  return (
    <View style={[styles.cartao, destaque && styles.cartaoDestaque]}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={[styles.valor, destaque && styles.valorDestaque]}>{valor}</Text>
      {detalhe ? <Text style={styles.detalhe}>{detalhe}</Text> : null}
    </View>
  );
}

/** 123.4 -> 'R$ 123,40' */
function reais(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

/** '2026-09-15' -> '15/09' */
function dataCurta(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  grupo: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    backgroundColor: '#fff',
  },
  grupoDestaque: { borderColor: '#bae6fd' },
  grupoCabecalho: { gap: 2 },
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
  grupoTitulo: { fontSize: 14, fontWeight: '600', color: '#18181b' },
  grupoSubtitulo: { fontSize: 12, color: '#71717a' },
  cartao: {
    flexGrow: 1,
    flexBasis: 140,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  cartaoDestaque: {
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
  },
  rotulo: { fontSize: 12, color: '#71717a', marginBottom: 4 },
  valor: { fontSize: 18, fontWeight: '600', color: '#18181b' },
  valorDestaque: { fontSize: 24, color: '#0369a1' },
  detalhe: { fontSize: 11, color: '#71717a', marginTop: 2 },
});
