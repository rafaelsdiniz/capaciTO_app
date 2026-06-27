# ROADMAP — Front (App React Native) · CapaciTO

Checklist de desenvolvimento do **frontend** (`CapaciTO`, Expo 56 / React Native), para **2 devs front em paralelo**, ambos com Claude Code no mesmo repo. **Marque `- [x]` ao concluir cada item.**

- **Dev F1 — Capacitação & Certificação** (dono da **fatia ao vivo**)
- **Dev F2 — Conexão, Indústria & Fundação compartilhada**
- **Backend** = 1 dev separado em `CapaciTO_API` → fronteira externa, **mock-first** (§2).

🎯 **Estrela-guia:** fatia **QR → microvídeo → certificação na carteira**. 🐟 **Segmento herói: frigorífico de pescado** (CLAUDE.md §1.1) — demo, seed e vídeos ancorados em pescado/câmara fria.
Fonte da verdade: [docs/requisitos-fieto.md](docs/requisitos-fieto.md). Convenções/DoD: [CLAUDE.md](CLAUDE.md).

---

## 📊 Progresso por milestone
- [x] **M0 — Fundação** (auth + shell + design system + mock-first)
- [x] **M1 — Esqueleto navegável** (todas as telas dos dois papéis, navegáveis)
- [x] **M2 — Fatia ao vivo 🟢** (QR → microvídeo → certificação na carteira, rodando no mock)
- [x] **M3 — Conexão & Indústria** (vagas+match, estações+QR, publicar vaga, buscar talentos)
- [ ] **M4 — Polimento & demo** (vídeos próprios, integração backend real, ensaio)

> **Status:** app completo dos dois lados (Trabalhador + Indústria) rodando **mock-first**, identidade visual "Rio e Sol" aplicada, tema claro. Falta: 2 microvídeos próprios, virar `USE_MOCK` para a API real quando o backend entregar, e ensaio de pitch.

### ➕ Extras implementados (pós-M3)
- [x] **Área do usuário / conta** (aba Perfil): cartão de identidade, atalhos com contadores, sair
- [x] **Editar dados do perfil** persistindo no mock (nome, cidade, funções) → **RF05**
- [x] **Minhas candidaturas**: separadas em *em andamento* e *encerradas*, com status → **RF27**
- [x] **Visibilidade** do perfil acessível também no hub de conta → **RF08; RN06**
- [x] **Busca + filtros** na aba **Vagas** (texto, compatíveis, segmento, município) → **RF26**
- [x] **Busca + filtros** na aba **Aprender** (texto, tema) → **RF10**
- [x] **Busca + filtros** na aba **Buscar talentos** (texto, competência, cidade, qualificação) → **RF28**

> Todos os filtros rodam client-side sobre o mock; quando o backend existir viram query params nos endpoints (UI não muda).

---

## 1. Regras de convivência (não colidir no mesmo repo)
Propriedade de pastas — cada dev só edita os arquivos da sua trilha; compartilhado tem dono único.

```
src/app/
├── (auth)/          login, registro            ← F1 criou, F2 revisa
├── (trabalhador)/   carteira, aprender, curso/[id], scan   ← DONO: F1
├── (industria)/     dashboard, estacoes, vagas, buscar      ← DONO: F2
├── _layout.tsx      shell + roteamento por papel            ← DONO: F2
└── index.tsx        gate de sessão por papel                ← DONO: F2
src/components/
├── ui/              design system compartilhado             ← DONO: F2 (F1 consome)
├── capacitacao/     player, card de curso, badge cert.      ← DONO: F1
└── conexao/         card de vaga, match badge, form vaga    ← DONO: F2
src/lib/
├── api/             cliente HTTP + endpoints + mocks         ← DONO: F2
├── session/         auth context, storage do JWT            ← DONO: F2
└── theme/           tokens (já há base em src/constants/theme.ts) ← DONO: F2
```
- [ ] Branches por trilha (`feat/f1-...`, `feat/f2-...`), PRs pequenos, merge frequente.
- [ ] Não editar arquivo de outro dono sem combinar (sync point).
- [ ] `src/lib/api` é o contrato: mudou DTO → avisa o outro no mesmo commit.

---

## 2. Fronteira de API (mock-first — front nunca trava)
- [x] `src/lib/api` com interface + impl **mock** + flag `USE_MOCK` por recurso *(stub F1, F2 endurece)*
- [ ] Combinar DTOs da fatia ao vivo com o dev de backend cedo
- [ ] Virar `USE_MOCK.<recurso> = false` conforme o backend entrega: `/auth/login`, `/estacoes/qr/{codigo}`, `/conclusoes`, `/perfil/me`

---

# TRILHA F1 — Capacitação & Certificação 🐟

> O trabalhador chega, busca cursos, se capacita por microvídeo (catálogo ou QR na estação) e cada conclusão **certifica uma competência que aparece na carteira**.

## M0 · Fundação [F1] — ✅ FEITO
- [x] Telas `(auth)/login` e `(auth)/registro` consumindo `lib/api` (mock) → **RF01, RF02**
- [x] Validação **RN09 (idade ≥18)** no registro de trabalhador
- [x] Sessão (`useSession`) + gate de roteamento por papel → **RF03**
- [x] Landing pós-login: `(trabalhador)/carteira` (placeholder) + botão Sair
- [x] Typecheck `tsc` verde

## M1 · Esqueleto navegável [F1] — ✅ FEITO
- [x] **Carteira/Perfil** exibindo competências certificadas (consumir `GET /perfil/me`, mock primeiro) → **RF06**
- [x] Indicador de **completude** do perfil (barra/percentual) → **RF07**
- [x] Toggle de **visibilidade do perfil** (visível/oculto p/ indústrias) → **RF08; RN06**
- [x] Tela **Aprender (catálogo)**: lista de microvídeos de pescado + **busca** → **RF10**
- [x] Mock de catálogo no `lib/api` (higienização, recepção de pescado, câmara fria)
- [x] Placeholder de detalhe do curso (`curso/[id]`) — base do player do M2
- [x] Acesso livre/demo no login (enquanto não há backend)

## M2 · Fatia ao vivo 🟢 [F1] — ✅ FEITO (no mock)
- [x] Instalar/configurar `expo-camera` e `expo-video` (⚠️ scanner real só em dev build/device, não web)
- [x] **Player de microvídeo vertical** (área da marca com progresso; trocar por `<VideoView/>` ao ter vídeo próprio) → **RF11**
- [x] **Scanner de QR** (`expo-camera`) → `resolverQr` → abre o vídeo da estação ("câmara fria") + botão "Simular leitura" → **RF17; RN04**
- [x] Ao concluir → `conclusoes.registrar` (origem QR/CATALOGO), idempotente → **RF13, RF18; RN10**
- [x] Após concluir, tela de sucesso → Carteira mostra a **certificação nova** (recarrega no foco) → **RF20, RF21; RN01, RN02**
- [ ] Integração real: virar `USE_MOCK` desses recursos quando o backend entregar

## M3 · Complementos [F1]
- [ ] Busca/filtros do catálogo por tema (higiene, manipulação, segurança alimentar) → **RF10** *(busca por texto feita)*
- [ ] Trilhas (sequência de vídeos) 🟡 navegável → **RF12**
- [ ] Microquiz de 1–3 questões ao fim do conteúdo → **RF14; RN01**
- [x] Edição de perfil (nome, cidade, funções de interesse) → **RF05**

## M4 · Polimento [F1]
- [ ] Estados de loading/erro amigáveis na fatia ao vivo → **RNF01**
- [ ] Tolerância a rede instável (cache do vídeo já aberto) → **RNF02**
- [ ] Smoke test QR→vídeo→certificação em device físico (não pode quebrar)

---

# TRILHA F2 — Conexão, Indústria & Fundação compartilhada

> Fundação que o F1 consome + lado "LinkedIn da indústria": empresa publica vagas / busca por certificação; trabalhador vê vagas compatíveis.

## M0 · Fundação compartilhada [F2] — ✅ FEITO (por F1, assumindo tudo)
- [x] **Design system** em `components/ui`: Button, Input, Card, Tag, Screen, AppHeader, Logo, Avatar, ProgressBar, EmptyState, StatCard, TabBar → **RNF01, RNF09**
- [x] `theme` tokens em `constants/theme.ts` (paleta Rio/Sol, Radius, fontes) — tema claro fixo
- [x] **Shell** (`_layout.tsx`, `index.tsx`): roteamento por papel → **RF03**
- [x] **`lib/api`** estruturado (mock + flag `USE_MOCK` por recurso) — *falta endurecer HTTP real*
- [x] Logo aplicada no auth e nos headers
- [ ] **`lib/session`**: persistir JWT (expo-secure-store) + header Authorization *(hoje em memória)*
- [x] Limpeza dos órfãos do template (`explore.tsx`, `app-tabs`)

## M1 · Esqueleto navegável [F2] — ✅ FEITO
- [x] Telas da **indústria**: dashboard, estações, vagas → RF15, RF24
- [x] Tabs do Trabalhador (Carteira / Aprender / Escanear / Vagas) com TabBar bonita (azul)
- [x] Tabs da Indústria (Início / Estações / Vagas / Buscar) com TabBar bonita (teal)

## M2 · Conexão real 🟢 [F2] — ✅ FEITO (no mock)
- [x] **Vagas compatíveis** (trabalhador) com **badge de match** + detalhe + candidatar → **RF25, RF26, RF27; RN05, RN03**

## M3 · Indústria & busca [F2] — ✅ FEITO (no mock)
- [x] **Cadastrar estação** + associar conteúdo + **gerar QR escaneável** (react-native-qrcode-svg) → **RF15, RF16; RN04, RN07**
- [x] **Publicar vaga** (função, município, obrigatórias/desejáveis) → **RF24; RN08**
- [x] **Buscar trabalhadores por competência** → **RF28; RN06, RN07**
- [x] **Candidatar-se** a vaga (lado trabalhador) → **RF27**

## M4 · Polimento [F2]
- [ ] Estados de erro/vazio em todas as telas de conexão
- [ ] Telas só de pitch 🔵 (PDF, verificação por terceiros, chat) como mock estático se ajudar — **não implementar**

---

## 3. Sync points (onde os dois conversam)
- [ ] **Fim do M0:** F2 entrega `components/ui` + assume `lib/*` + shell → destrava F1 plenamente
- [ ] **Contrato de DTO** sempre que `lib/api` muda (alinhar com backend)
- [ ] **Início do M2:** virar flags mock→real e testar a fatia ao vivo juntos em device físico
- [ ] **QR ponta a ponta:** QR gerado pela indústria (F2) precisa ser lido pelo scanner do trabalhador (F1)

---

## 4. Seed & conteúdo de demo (🐟 pescado) — combinar com backend + quem grava
- [ ] **1 frigorífico de pescado** completo: estações (Recepção de pescado, Câmara fria, Higienização), competências, 1 vaga
- [ ] **1 laticínio + 1 panificadora** de figuração (1–2 registros) para mostrar escala
- [ ] **2 microvídeos próprios** gravados: *higienização de mãos* e *como agir na câmara fria* (⚠️ conteúdo próprio, sem marca de terceiros)
- [ ] **QR(s) impressos/na tela** correspondentes ao seed, testados no scanner
- [ ] **Vídeo de backup** do fluxo QR→vídeo→certificação (plano B contra falha de rede/câmera no evento)

---

## 5. Cobertura de RFs (só os que tocam o front)

| RF | Prior. | Status |
|---|---|---|
| RF01, RF02, RF03 | M | ✅ |
| RF04 (recuperar senha) | S | 🔵 corte |
| RF05 (editar perfil) | M | ✅ |
| RF06, RF07 (carteira/completude) | M | ✅ |
| RF08 (visibilidade) | S | ✅ |
| RF09 (PDF) | C | 🔵 |
| RF10 (catálogo+busca) | M | ✅ |
| RF11 (player) | M | ✅ (placeholder da marca; trocar por vídeo próprio) |
| RF12 (trilhas) | S | ⬜ |
| RF13, RF18 (conclusão) | M | ✅ |
| RF14 (microquiz) | S | ⬜ |
| RF15, RF16 (estação+QR) | M | ✅ |
| RF17 (escanear QR) | M | ✅ |
| RF19 (offline) | C | 🔵 |
| RF20, RF21 (certificação auto) | M | ✅ |
| RF22 (validade) | S | parcial (status ATIVA/EXPIRADA) |
| RF23 (verificação 3º) | C | 🔵 |
| RF24 (publicar vaga) | M | ✅ |
| RF25, RF26 (match/ver vagas) | M | ✅ |
| RF27 (candidatar) | S | ✅ |
| RF28 (buscar por competência) | S | ✅ |

> Tudo ✅ roda **no mock** (mock-first). Falta: vídeos próprios (RF11), persistência/HTTP real e os 🔵/⬜ acima.

---

## 6. Riscos e cortes (proteger sempre a fatia ao vivo do F1)
Cortar de fora pra dentro, **nunca** QR→vídeo→certificação:
- [ ] Corte primeiro (🔵): RF04, RF09 (PDF), RF19 (offline), RF23, chat
- [ ] Vira mock 🟡: RF15 cadastro de estação (usar seed/QR pré-gerado), RF27, RF28, RF12, RF05
- [ ] Simplificar: RF14 microquiz → pular (RN01 cobre "quando existir"); RF22 → só exibir `ATIVA`
- [ ] Se M2 do F1 atrasar: F2 pausa M3 e ajuda no scanner/player/carteira

**Riscos técnicos a vigiar (cedo, no M0):**
- ⚠️ Câmera/QR e vídeo **não rodam no Expo web**; podem falhar no Expo Go → testar em **dev build/device** já no M0
- ⚠️ Base URL no device físico ≠ `localhost` → usar IP da máquina; checar firewall na porta 8080
- ⚠️ Colisão Git F1/F2 → respeitar propriedade de pastas (§1), merges pequenos e frequentes
- ⚠️ Dependência do backend → mock-first (§2)
- ⚠️ Conteúdo de vídeo próprio (sem marca de terceiros) → combinar gravação dos 2 microvídeos de pescado
