import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Tag } from '@/components/ui/tag';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { Conteudo, OrigemConclusao, ResultadoConclusao } from '@/lib/api/types';
import { useSession } from '@/lib/session/session-context';

// Remove o contorno (quadrado) que o navegador desenha no input focado (RN Web).
const NO_OUTLINE = (Platform.OS === 'web' ? { outlineStyle: 'none' } : null) as object | null;

type Comentario = { id: string; autor: string; texto: string; quando: string; curtidas: number };

const COMENTARIOS_SEED: Comentario[] = [
  { id: 'c1', autor: 'Joana Pescados', texto: 'Excelente! Agora entendi direitinho como manter a cadeia de frio na câmara.', quando: 'há 2 dias', curtidas: 12 },
  { id: 'c2', autor: 'Carlos Andrade', texto: 'Vídeo curto e direto, ajudou muito no meu primeiro dia no frigorífico.', quando: 'há 5 dias', curtidas: 7 },
  { id: 'c3', autor: 'Marina Souza', texto: 'Consegui meu certificado logo depois de assistir 🐟', quando: 'há 1 semana', curtidas: 4 },
];

/**
 * Detalhe + player do conteúdo, em layout estilo YouTube.
 * Fatia ao vivo (preservada): assistir → concluir → POST /conclusoes → certificação
 * (RF11/13/20/21). O player simula o progresso; conteúdo próprio entra depois via
 * expo-video trocando a área do player por <VideoView/>.
 */
export default function CursoScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { usuario } = useSession();
  const { id, origem } = useLocalSearchParams<{ id: string; origem?: string }>();
  const origemConclusao: OrigemConclusao = origem === 'QR' ? 'QR' : 'CATALOGO';

  const [conteudo, setConteudo] = useState<Conteudo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [progresso, setProgresso] = useState(0); // 0..100 do vídeo
  const [assistindo, setAssistindo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoConclusao | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Interações sociais (visuais — não persistem no back).
  const [curtido, setCurtido] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [descExpandida, setDescExpandida] = useState(false);
  const [comentario, setComentario] = useState('');
  const [comentarios, setComentarios] = useState<Comentario[]>(COMENTARIOS_SEED);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const c = await api.conteudos.obter(String(id));
        if (ativo) setConteudo(c);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
      if (timer.current) clearInterval(timer.current);
    };
  }, [id]);

  function assistir() {
    if (progresso >= 100) return;
    setAssistindo(true);
    timer.current = setInterval(() => {
      setProgresso((p) => {
        const next = p + 5;
        if (next >= 100) {
          if (timer.current) clearInterval(timer.current);
          setAssistindo(false);
          return 100;
        }
        return next;
      });
    }, 150);
  }

  async function concluir() {
    if (!conteudo) return;
    setEnviando(true);
    try {
      const res = await api.conclusoes.registrar(conteudo.id, origemConclusao);
      setResultado(res);
    } finally {
      setEnviando(false);
    }
  }

  function enviarComentario() {
    const texto = comentario.trim();
    if (!texto) return;
    setComentarios((cur) => [
      { id: `local-${Date.now()}`, autor: usuario?.nome ?? 'Você', texto, quando: 'agora', curtidas: 0 },
      ...cur,
    ]);
    setComentario('');
  }

  const assistido = progresso >= 100;
  const duracao = conteudo?.duracao ?? 0;
  const tempoAtual = Math.round((progresso / 100) * duracao);
  const descricao = useMemo(() => (conteudo ? gerarDescricao(conteudo) : ''), [conteudo]);

  // ── Estados de carregamento / erro / sucesso ────────────────────────────────
  if (carregando) {
    return (
      <Screen padded={false}>
        <AppHeader back title="Treinamento" />
        <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.six }} />
      </Screen>
    );
  }

  if (!conteudo) {
    return (
      <Screen padded={false}>
        <AppHeader back title="Treinamento" />
        <ThemedText type="small" themeColor="textSecondary" style={styles.padX}>
          Conteúdo não encontrado.
        </ThemedText>
      </Screen>
    );
  }

  if (resultado) {
    return (
      <Screen scroll padded={false}>
        <AppHeader back title="Treinamento" />
        <View style={styles.sucesso}>
          <View style={styles.sucessoIcon}>
            <Ionicons name="ribbon" size={56} color={Brand.branco} />
          </View>
          <ThemedText type="subtitle" style={styles.center}>
            {resultado.jaCertificada ? 'Treinamento concluído!' : 'Competência certificada!'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
            {resultado.jaCertificada
              ? `Você já tinha a competência "${conteudo.competencia.nome}".`
              : `"${conteudo.competencia.nome}" foi adicionada à sua carteira.`}
          </ThemedText>
          <View style={{ height: Spacing.four }} />
          <Button title="Ver na carteira" icon="wallet" onPress={() => router.replace('/carteira')} />
          <View style={{ height: Spacing.two }} />
          <Button title="Voltar aos treinamentos" variant="ghost" onPress={() => router.replace('/aprender')} />
        </View>
      </Screen>
    );
  }

  // ── Player estilo YouTube ───────────────────────────────────────────────────
  return (
    <Screen scroll padded={false}>
      <AppHeader back title="Treinamento" />

      {/* Vídeo 16:9 */}
      <View style={styles.player}>
        {assistido ? (
          <Pressable
            onPress={() => setProgresso(0)}
            style={styles.playerCenter}
            accessibilityRole="button"
            accessibilityLabel="Assistir novamente">
            <View style={styles.playBtn}>
              <Ionicons name="refresh" size={30} color={Brand.azulRio} />
            </View>
            <ThemedText type="small" style={styles.playerHint}>
              Assistir novamente
            </ThemedText>
          </Pressable>
        ) : (
          <Pressable onPress={assistir} disabled={assistindo} style={styles.playerCenter} accessibilityRole="button">
            <View style={styles.playBtn}>
              <Ionicons name={assistindo ? 'pause' : 'play'} size={30} color={Brand.azulRio} />
            </View>
            <ThemedText type="small" style={styles.playerHint}>
              {assistindo ? 'Reproduzindo…' : 'Tocar microvídeo'}
            </ThemedText>
          </Pressable>
        )}

        {/* Barra de tempo no rodapé do vídeo */}
        <View style={styles.playerBar}>
          <ThemedText style={styles.playerTime}>
            {formatarTempo(tempoAtual)} / {formatarTempo(duracao)}
          </ThemedText>
          <View style={styles.playerTrack}>
            <View style={[styles.playerFill, { width: `${progresso}%` }]} />
          </View>
        </View>
      </View>

      {/* Título + métricas */}
      <View style={styles.bloco}>
        <ThemedText style={styles.titulo}>{conteudo.titulo}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatarViews()} · {formatarTempo(duracao)} de duração
        </ThemedText>
        <View style={styles.tags}>
          <Tag label={`#${conteudo.tema}`} tone="teal" />
          {origemConclusao === 'QR' ? <Tag label="Estação QR" tone="primary" icon="📍" /> : null}
        </View>
      </View>

      {/* Ações (curtir / compartilhar / salvar) */}
      <View style={styles.acoes}>
        <AcaoChip
          icon={curtido ? 'thumbs-up' : 'thumbs-up-outline'}
          label={curtido ? '127' : '126'}
          ativo={curtido}
          onPress={() => setCurtido((v) => !v)}
        />
        <AcaoChip icon="arrow-redo-outline" label="Compartilhar" onPress={() => undefined} />
        <AcaoChip
          icon={salvo ? 'bookmark' : 'bookmark-outline'}
          label={salvo ? 'Salvo' : 'Salvar'}
          ativo={salvo}
          onPress={() => setSalvo((v) => !v)}
        />
      </View>

      {/* Callout de certificação (núcleo da fatia ao vivo) */}
      <View style={styles.bloco}>
        <View style={styles.certCard}>
          <View style={styles.certIcon}>
            <Ionicons name="ribbon" size={22} color={Brand.branco} />
          </View>
          <View style={styles.flex}>
            <ThemedText type="smallBold">Ao concluir você certifica</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {conteudo.competencia.nome}
            </ThemedText>
          </View>
        </View>
        <Button
          title={assistido ? 'Concluir e certificar' : 'Assista o vídeo para concluir'}
          icon="checkmark-done"
          onPress={concluir}
          loading={enviando}
          disabled={!assistido}
        />
      </View>

      {/* Descrição */}
      <View style={styles.bloco}>
        <ThemedText type="smallBold">Descrição</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={descExpandida ? undefined : 3}>
          {descricao}
        </ThemedText>
        <Pressable onPress={() => setDescExpandida((v) => !v)} hitSlop={6}>
          <ThemedText type="link" style={{ color: Brand.azulRio }}>
            {descExpandida ? 'Mostrar menos' : 'Mostrar mais'}
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.separador, { backgroundColor: theme.border }]} />

      {/* Comentários */}
      <View style={styles.bloco}>
        <ThemedText type="smallBold">Comentários · {comentarios.length}</ThemedText>

        <View style={styles.comentarInput}>
          <Avatar nome={usuario?.nome} size={36} />
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }, NO_OUTLINE]}
            placeholder="Adicione um comentário…"
            placeholderTextColor={theme.textSecondary}
            value={comentario}
            onChangeText={setComentario}
            selectionColor={Brand.azulRio}
            multiline
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar comentário"
            onPress={enviarComentario}
            disabled={!comentario.trim()}
            hitSlop={8}
            style={[styles.enviarBtn, !comentario.trim() && styles.enviarBtnOff]}>
            <Ionicons name="send" size={18} color={Brand.branco} />
          </Pressable>
        </View>

        <View style={styles.comentarios}>
          {comentarios.map((c) => (
            <ComentarioItem key={c.id} comentario={c} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

// ── Subcomponentes ──────────────────────────────────────────────────────────────

function AcaoChip({
  icon,
  label,
  ativo,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  ativo?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: theme.backgroundSelected },
        ativo && styles.chipAtivo,
        pressed && styles.chipPressed,
      ]}>
      <Ionicons name={icon} size={18} color={ativo ? Brand.azulRio : theme.text} />
      <ThemedText type="tag" style={{ color: ativo ? Brand.azulRio : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function ComentarioItem({ comentario }: { comentario: Comentario }) {
  const [curtido, setCurtido] = useState(false);
  const curtidas = comentario.curtidas + (curtido ? 1 : 0);
  return (
    <View style={styles.comentario}>
      <Avatar nome={comentario.autor} size={36} tone="teal" />
      <View style={styles.flex}>
        <ThemedText type="tag" themeColor="textSecondary">
          {comentario.autor} · {comentario.quando}
        </ThemedText>
        <ThemedText type="small">{comentario.texto}</ThemedText>
        <View style={styles.comentarioAcoes}>
          <Pressable onPress={() => setCurtido((v) => !v)} hitSlop={6} style={styles.comentarioCurtir}>
            <Ionicons name={curtido ? 'thumbs-up' : 'thumbs-up-outline'} size={14} color={curtido ? Brand.azulRio : '#6E7681'} />
            <ThemedText type="tag" themeColor="textSecondary">
              {curtidas}
            </ThemedText>
          </Pressable>
          <ThemedText type="tag" themeColor="textSecondary">
            Responder
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

function formatarTempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Visualizações "fixas" por conteúdo (apenas estético, derivado do id).
function formatarViews(): string {
  return '1,2 mil visualizações';
}

function gerarDescricao(c: Conteudo): string {
  return (
    `Neste microvídeo você aprende ${c.tema} aplicado ao dia a dia da indústria de alimentos do Tocantins. ` +
    `O conteúdo é curto e direto, pensado para o chão de fábrica. ` +
    `Ao concluir, a competência "${c.competencia.nome}" é certificada automaticamente na sua Carteira de Qualificação Digital — ` +
    `e passa a contar nos matches de vagas das indústrias.`
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padX: { paddingHorizontal: Spacing.four },
  center: { alignItems: 'center', justifyContent: 'center' },
  centerText: { textAlign: 'center', paddingHorizontal: Spacing.four },

  // Player
  player: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#0B1218', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  playerCenter: { alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: Brand.branco, alignItems: 'center', justifyContent: 'center' },
  playerHint: { color: 'rgba(255,255,255,0.9)' },
  playerBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.three, paddingBottom: Spacing.two, gap: 4 },
  playerTime: { color: 'rgba(255,255,255,0.85)', fontFamily: FontFamily.corpoMedio, fontSize: 11 },
  playerTrack: { height: 3, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  playerFill: { height: 3, borderRadius: Radius.pill, backgroundColor: Brand.dourado },

  // Blocos de conteúdo
  bloco: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.two },
  titulo: { fontFamily: FontFamily.tituloBold, fontSize: 19, lineHeight: 25 },
  tags: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap' },

  // Ações
  acoes: { flexDirection: 'row', gap: Spacing.two, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  chip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 8 },
  chipAtivo: { backgroundColor: '#E6EEF4' },
  chipPressed: { opacity: 0.85 },

  // Callout de certificação
  certCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, backgroundColor: '#E0F2F1', borderRadius: Radius.lg, padding: Spacing.three },
  certIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Brand.teal, alignItems: 'center', justifyContent: 'center' },

  // Descrição
  separador: { height: 1, marginHorizontal: Spacing.four, marginTop: Spacing.four },

  // Comentários
  comentarInput: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, marginTop: Spacing.one },
  input: { flex: 1, minHeight: 40, maxHeight: 120, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, fontFamily: FontFamily.corpo, fontSize: 14 },
  enviarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Brand.azulRio, alignItems: 'center', justifyContent: 'center' },
  enviarBtnOff: { opacity: 0.4 },
  comentarios: { gap: Spacing.three, marginTop: Spacing.two },
  comentario: { flexDirection: 'row', gap: Spacing.two },
  comentarioAcoes: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: 2 },
  comentarioCurtir: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  // Sucesso
  sucesso: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four, gap: Spacing.two },
  sucessoIcon: { alignSelf: 'center', width: 96, height: 96, borderRadius: 48, backgroundColor: Brand.teal, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.four, marginBottom: Spacing.three },
});
