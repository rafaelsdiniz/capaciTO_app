import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, FontFamily, Radius, Spacing } from '@/constants/theme';

type Mensagem = { id: string; autor: 'ia' | 'voce'; texto: string };
type Sugestao = { pergunta: string; resposta: string; palavras: string[] };

/**
 * Chat de orientação de carreira (assistente simulada).
 * Sem backend: além das perguntas prontas, a pessoa pode escrever livremente —
 * a resposta é escolhida por casamento de palavras-chave, com um fallback
 * amigável. Demonstra o valor sem depender de IA real.
 */
const SUGESTOES: Sugestao[] = [
  {
    pergunta: 'Por onde começo na indústria de alimentos?',
    resposta:
      'O primeiro passo é dominar higiene e Boas Práticas de Fabricação (BPF) — é o que toda indústria exige. Na aba Editais tem o curso gratuito "Higiene e Manipulação de Alimentos" (SENAC, online) e o de BPF do SENAI. Com essas duas competências na carteira você já destrava várias vagas de auxiliar.',
    palavras: ['comecar', 'comeco', 'inicio', 'iniciar', 'primeiro', 'primeira', 'sem experiencia', 'novato'],
  },
  {
    pergunta: 'Quais competências abrem mais vagas?',
    resposta:
      'Hoje as mais pedidas no Tocantins são: Higienização e Sanitização, Boas Práticas de Fabricação (BPF) e, para frigoríficos de pescado, Segurança em Câmara Fria. Foque nelas primeiro — cada certificação ativa entra automaticamente no match das vagas.',
    palavras: ['competencia', 'competencias', 'habilidade', 'mais vagas', 'pedidas', 'procuradas', 'demanda'],
  },
  {
    pergunta: 'Como tiro minha primeira certificação?',
    resposta:
      'É simples e de graça: na estação de trabalho, escaneie o QR Code, assista ao microvídeo do procedimento e conclua o treino. A competência aparece sozinha na sua carteira — você não preenche nada. Treino concluído = vaga compatível.',
    palavras: ['certificacao', 'certificado', 'certificar', 'qr', 'qrcode', 'treino', 'treinamento', 'carteira'],
  },
  {
    pergunta: 'Quero virar Operador. O que falta?',
    resposta:
      'Para sair de Auxiliar e virar Operador costumam faltar: Operação de Máquinas de Processamento e Segurança do Trabalho (NR). Veja em "Suas próximas conquistas", aqui embaixo, quais competências destravam mais vagas e onde fazer o curso.',
    palavras: ['operador', 'crescer', 'evoluir', 'promocao', 'subir', 'auxiliar', 'maquina', 'maquinas'],
  },
  {
    pergunta: 'Tem curso gratuito perto de mim?',
    resposta:
      'Tem bastante! SENAI, SENAC, IFTO e Pronatec oferecem cursos gratuitos em Palmas, Araguaína e Gurupi. Abra a aba Editais para ver os abertos, com prazo de inscrição e link direto.',
    palavras: ['curso', 'cursos', 'gratuito', 'gratis', 'gratuita', 'edital', 'editais', 'senai', 'senac', 'ifto', 'pronatec', 'bolsa'],
  },
];

const BOAS_VINDAS =
  'Oi! Sou a IA de Carreira do CapaciTO. Posso te ajudar a escolher por onde começar e quais competências buscar para conseguir mais vagas. Toque numa pergunta abaixo ou escreva a sua. 👇';

const FALLBACK =
  'Boa pergunta! Posso te orientar sobre: por onde começar, quais competências abrem mais vagas, como tirar sua primeira certificação, como virar Operador e onde achar cursos gratuitos. Toque numa das sugestões ou escreva uma dessas palavras. 🙂';

/** Remove acentos e baixa a caixa para casar palavras-chave de forma tolerante. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Escolhe a melhor resposta por número de palavras-chave encontradas no texto. */
function responder(textoUsuario: string): string {
  const t = normalizar(textoUsuario);
  let melhor: Sugestao | null = null;
  let melhorPontos = 0;
  for (const s of SUGESTOES) {
    const pontos = s.palavras.reduce((acc, p) => (t.includes(normalizar(p)) ? acc + 1 : acc), 0);
    if (pontos > melhorPontos) {
      melhorPontos = pontos;
      melhor = s;
    }
  }
  return melhor ? melhor.resposta : FALLBACK;
}

export function CarreiraChat() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { id: 'm0', autor: 'ia', texto: BOAS_VINDAS },
  ]);
  const [digitando, setDigitando] = useState(false);
  const [texto, setTexto] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Envia uma pergunta (do usuário) e responde após um pequeno atraso. */
  function enviar(pergunta: string, respostaFixa?: string) {
    const limpo = pergunta.trim();
    if (!limpo || digitando) return;
    const base = String(Date.now());
    setMensagens((m) => [...m, { id: base + 'u', autor: 'voce', texto: limpo }]);
    setTexto('');
    setDigitando(true);
    timer.current = setTimeout(() => {
      const resposta = respostaFixa ?? responder(limpo);
      setMensagens((m) => [...m, { id: base + 'ia', autor: 'ia', texto: resposta }]);
      setDigitando(false);
    }, 700);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={16} color={Brand.branco} />
        </View>
        <View style={styles.flex}>
          <ThemedText type="smallBold">IA de Carreira</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Orientação para crescer na indústria
          </ThemedText>
        </View>
      </View>

      <View style={styles.thread}>
        {mensagens.map((m) => (
          <View
            key={m.id}
            style={[styles.bolha, m.autor === 'ia' ? styles.bolhaIa : styles.bolhaVoce]}>
            <ThemedText type="small" style={m.autor === 'ia' ? styles.textoIa : styles.textoVoce}>
              {m.texto}
            </ThemedText>
          </View>
        ))}
        {digitando ? (
          <View style={[styles.bolha, styles.bolhaIa, styles.digitando]}>
            <ActivityIndicator size="small" color={Brand.teal} />
            <ThemedText type="small" themeColor="textSecondary">
              digitando…
            </ThemedText>
          </View>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        {SUGESTOES.map((s) => (
          <Pressable
            key={s.pergunta}
            accessibilityRole="button"
            onPress={() => enviar(s.pergunta, s.resposta)}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.85 }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={13} color={Brand.azulRio} />
            <ThemedText type="tag" style={{ color: Brand.azulRio }}>
              {s.pergunta}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, NO_OUTLINE]}
          placeholder="Escreva sua pergunta…"
          placeholderTextColor="#9AA8BA"
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={() => enviar(texto)}
          returnKeyType="send"
          multiline
          selectionColor={Brand.azulRio}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar pergunta"
          onPress={() => enviar(texto)}
          disabled={!texto.trim() || digitando}
          style={({ pressed }) => [
            styles.enviar,
            (!texto.trim() || digitando) && styles.enviarOff,
            pressed && { opacity: 0.85 },
          ]}>
          <Ionicons name="arrow-up" size={18} color={Brand.branco} />
        </Pressable>
      </View>
    </View>
  );
}

// Remove o contorno que o navegador desenha no input focado (RN Web).
const NO_OUTLINE = (Platform.OS === 'web' ? { outlineStyle: 'none' } : null) as object | null;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: {
    backgroundColor: Brand.branco,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#E6EAEF',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    backgroundColor: Brand.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },

  thread: { gap: Spacing.two },
  bolha: { maxWidth: '88%', borderRadius: Radius.md, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  bolhaIa: { alignSelf: 'flex-start', backgroundColor: '#EFF4F8', borderTopLeftRadius: 4 },
  bolhaVoce: { alignSelf: 'flex-end', backgroundColor: Brand.azulRio, borderTopRightRadius: 4 },
  textoIa: { color: Brand.chumbo, lineHeight: 19 },
  textoVoce: { color: Brand.branco, lineHeight: 19 },
  digitando: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },

  chips: { gap: Spacing.one, paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: Brand.azulRio,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    backgroundColor: '#F4F8FC',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    paddingTop: Spacing.two,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 110,
    borderWidth: 1.5,
    borderColor: '#E6EAEF',
    borderRadius: Radius.md,
    backgroundColor: '#F8FAFE',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    color: Brand.chumbo,
    fontFamily: FontFamily.corpo,
    fontSize: 14,
  },
  enviar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Brand.azulRio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enviarOff: { opacity: 0.4 },
});
