# ROADMAP — Front (App React Native) · CapaciTO

Checklist de desenvolvimento do **frontend** (`CapaciTO`, Expo 56 / React Native), para **2 devs front em paralelo**, ambos com Claude Code no mesmo repo. **Marque `- [x]` ao concluir cada item.**

- **Dev F1 — Capacitação & Certificação** (dono da **fatia ao vivo**)
- **Dev F2 — Conexão, Indústria & Fundação compartilhada**
- **Backend** = 1 dev separado em `CapaciTO_API` → fronteira externa, **mock-first** (§2).

🎯 **Estrela-guia:** fatia **QR → microvídeo → certificação na carteira**. 🐟 **Segmento herói: frigorífico de pescado** (CLAUDE.md §1.1) — demo, seed e vídeos ancorados em pescado/câmara fria.
Fonte da verdade: [docs/requisitos-fieto.md](docs/requisitos-fieto.md). Convenções/DoD: [CLAUDE.md](CLAUDE.md).

---

## 📊 Progresso por milestone
- [x] **M0 — Fundação** (auth + shell mínimo + mock-first) — *F1 feito; F2 pendente*
- [ ] **M1 — Esqueleto navegável**
- [ ] **M2 — Fatia ao vivo 🟢** (coração da demo)
- [ ] **M3 — Conexão & complementos**
- [ ] **M4 — Polimento & demo**

> **Trava de segurança:** se M2 não fechar, **F2 pausa M3 e ajuda F1** a estabilizar a fatia ao vivo.

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

## M1 · Esqueleto navegável [F1]
- [ ] **Carteira/Perfil** exibindo competências certificadas (consumir `GET /perfil/me`, mock primeiro) → **RF06**
- [ ] Indicador de **completude** do perfil (barra/percentual) → **RF07**
- [ ] Toggle de **visibilidade do perfil** (visível/oculto p/ indústrias) → **RF08; RN06**
- [ ] Tela **Aprender (catálogo)**: lista de microvídeos de pescado + **busca** → **RF10**
- [ ] Mock de catálogo no `lib/api` (higienização, recepção de pescado, câmara fria)

## M2 · Fatia ao vivo 🟢 [F1] — PRIORIDADE MÁXIMA
- [ ] Instalar/configurar `expo-camera` e `expo-video` (testar em **dev build/device**, não web)
- [ ] **Player de microvídeo vertical** (`expo-video`) → **RF11**
- [ ] **Scanner de QR** (`expo-camera`) → `GET /estacoes/qr/{codigo}` → abre o vídeo da estação ("câmara fria") → **RF17; RN04**
- [ ] Ao concluir → `POST /conclusoes` (origem QR/CATALOGO), idempotente → **RF13, RF18; RN10**
- [ ] Após concluir, navegar à Carteira e mostrar a **certificação nova surgindo** → **RF20, RF21; RN01, RN02**
- [ ] Integração real: virar `USE_MOCK` desses recursos quando o backend entregar

## M3 · Complementos [F1]
- [ ] Busca/filtros do catálogo por tema (higiene, manipulação, segurança alimentar) → **RF10**
- [ ] Trilhas (sequência de vídeos) 🟡 navegável → **RF12**
- [ ] Microquiz de 1–3 questões ao fim do conteúdo → **RF14; RN01**
- [ ] Edição completa do perfil (nome, foto, cidade, funções de interesse) → **RF05**

## M4 · Polimento [F1]
- [ ] Estados de loading/erro amigáveis na fatia ao vivo → **RNF01**
- [ ] Tolerância a rede instável (cache do vídeo já aberto) → **RNF02**
- [ ] Smoke test QR→vídeo→certificação em device físico (não pode quebrar)

---

# TRILHA F2 — Conexão, Indústria & Fundação compartilhada

> Fundação que o F1 consome + lado "LinkedIn da indústria": empresa publica vagas / busca por certificação; trabalhador vê vagas compatíveis.

## M0 · Fundação compartilhada [F2] — entregar cedo, destrava o F1
- [ ] **Design system** em `components/ui`: botão, input, card, lista, header, estado vazio (PT-BR, ícones grandes, alto contraste) → **RNF01, RNF09**
- [ ] `theme/` tokens reaproveitando `src/constants/theme.ts`
- [ ] **Assumir o shell** (`_layout.tsx`, `index.tsx`): roteamento por papel definitivo → **RF03**
- [ ] **Assumir `lib/api`**: endurecer cliente HTTP real + base URL por IP da máquina (não localhost)
- [ ] **Assumir `lib/session`**: persistir JWT (expo-secure-store) + header Authorization
- [ ] Extrair os componentes inline do auth (`(auth)/_form.tsx`) para `components/ui`
- [ ] Limpar template órfão (`src/app/explore.tsx`, `app-tabs` se não usado)

## M1 · Esqueleto navegável [F2]
- [ ] Telas da **indústria** (mock navegável): dashboard, lista de estações, lista de vagas → base RF15, RF24
- [ ] Tabs do Trabalhador (Carteira / Aprender / Escanear) no shell → consome telas do F1
- [ ] Tela **Vagas** (trabalhador) mock → base RF26

## M2 · Conexão real 🟢 [F2]
- [ ] **Vagas compatíveis** (trabalhador) via `GET /vagas/compativeis` com **badge de match** → **RF25, RF26; RN05, RN03**
- [ ] (Priorizar só depois do M2 do F1 estar verde)

## M3 · Indústria & busca [F2]
- [ ] **Cadastrar estação** + associar conteúdo + **gerar/exibir QR** (o QR que o F1 escaneia) → **RF15, RF16; RN04, RN07**
- [ ] **Publicar vaga** (função, município, competências obrigatórias/desejáveis) → **RF24; RN08**
- [ ] **Buscar trabalhadores por competência certificada** (respeita `visivel`) → **RF28; RN06, RN07**
- [ ] **Candidatar-se** a vaga (lado trabalhador) → **RF27**

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

| RF | Prior. | Trilha · Milestone | Status |
|---|---|---|---|
| RF01, RF02, RF03 | M | F1/F2 M0 | ✅ |
| RF04 (recuperar senha) | S | — | 🔵 corte |
| RF05 | M | F1 M3 | ⬜ |
| RF06, RF07 | M | F1 M1 | ⬜ |
| RF08 | S | F1 M1 | ⬜ |
| RF09 (PDF) | C | — | 🔵 |
| RF10, RF11, RF13 | M | F1 M1/M2 | ⬜ |
| RF12 (trilhas) | S | F1 M3 | ⬜ |
| RF14 (microquiz) | S | F1 M3 | ⬜ |
| RF15, RF16 | M | F2 M3 | ⬜ |
| RF17, RF18 | M | F1 M2 | ⬜ |
| RF19 (offline) | C | — | 🔵 |
| RF20, RF21 | M | F1 M2 | ⬜ |
| RF22 (validade) | S | F1 M1 | ⬜ |
| RF23 (verificação 3º) | C | — | 🔵 |
| RF24, RF25, RF26 | M | F2 M1–M3 | ⬜ |
| RF27 | S | F2 M3 | ⬜ |
| RF28 | S | F2 M3 | ⬜ |

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
