import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { Competencia } from '@/lib/api/types';

/** Publicação de vaga com competências exigidas/desejáveis (RF24; RN05, RN08). */
export default function VagaNovaScreen() {
  const router = useRouter();
  const [funcao, setFuncao] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [descricao, setDescricao] = useState('');
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [obrigatorias, setObrigatorias] = useState<Set<string>>(new Set());
  const [desejaveis, setDesejaveis] = useState<Set<string>>(new Set());
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.competencias.listar().then(setCompetencias);
  }, []);

  function alternar(set: Set<string>, setter: (s: Set<string>) => void, id: string, outro: Set<string>, setOutro: (s: Set<string>) => void) {
    const novo = new Set(set);
    if (novo.has(id)) novo.delete(id);
    else {
      novo.add(id);
      if (outro.has(id)) {
        const o = new Set(outro);
        o.delete(id);
        setOutro(o);
      }
    }
    setter(novo);
  }

  async function publicar() {
    setErro(null);
    if (!funcao.trim() || !municipio.trim()) {
      setErro('Informe função e município.');
      return;
    }
    if (obrigatorias.size === 0) {
      setErro('Selecione ao menos uma competência obrigatória.');
      return;
    }
    setSalvando(true);
    try {
      await api.vagas.publicar({
        funcao: funcao.trim(),
        municipio: municipio.trim(),
        descricao: descricao.trim() || undefined,
        obrigatoriasIds: [...obrigatorias],
        desejaveisIds: [...desejaveis],
      });
      router.back();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen scroll>
      <AppHeader back title="Publicar vaga" />

      <Input label="Função" value={funcao} onChangeText={setFuncao} placeholder="Ex.: Auxiliar de câmara fria" />
      <Input label="Município" icon="location-outline" value={municipio} onChangeText={setMunicipio} placeholder="Ex.: Palmas" />
      <Input label="Descrição (opcional)" value={descricao} onChangeText={setDescricao} placeholder="Resumo da vaga" multiline />

      <View style={styles.secao}>
        <ThemedText type="smallBold">Competências obrigatórias</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          O trabalhador precisa ter todas certificadas para dar match (RN05).
        </ThemedText>
        <View style={styles.chips}>
          {competencias.map((c) => (
            <Chip
              key={c.id}
              label={c.nome}
              ativo={obrigatorias.has(c.id)}
              tone="primary"
              onPress={() => alternar(obrigatorias, setObrigatorias, c.id, desejaveis, setDesejaveis)}
            />
          ))}
        </View>
      </View>

      <View style={styles.secao}>
        <ThemedText type="smallBold">Competências desejáveis</ThemedText>
        <View style={styles.chips}>
          {competencias.map((c) => (
            <Chip
              key={c.id}
              label={c.nome}
              ativo={desejaveis.has(c.id)}
              tone="accent"
              onPress={() => alternar(desejaveis, setDesejaveis, c.id, obrigatorias, setObrigatorias)}
            />
          ))}
        </View>
      </View>

      {erro ? (
        <ThemedText type="small" style={{ color: Brand.perigo }}>
          {erro}
        </ThemedText>
      ) : null}

      <Button title="Publicar vaga" icon="megaphone" onPress={publicar} loading={salvando} />
    </Screen>
  );
}

function Chip({ label, ativo, tone, onPress }: { label: string; ativo: boolean; tone: 'primary' | 'accent'; onPress: () => void }) {
  const theme = useTheme();
  const cor = tone === 'accent' ? Brand.dourado : Brand.azulRio;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      onPress={onPress}
      style={[styles.chip, { borderColor: ativo ? cor : theme.border, backgroundColor: ativo ? cor : theme.backgroundElement }]}>
      {ativo ? <Ionicons name="checkmark" size={14} color={tone === 'accent' ? Brand.chumbo : Brand.branco} /> : null}
      <ThemedText type="tag" style={{ color: ativo ? (tone === 'accent' ? Brand.chumbo : Brand.branco) : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  secao: { gap: Spacing.two },
  chips: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 8 },
});
