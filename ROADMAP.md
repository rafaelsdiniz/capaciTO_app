# ROADMAP — Front (App React Native) · CapaciTO

Plano de desenvolvimento do **frontend** (`CapaciTO`, Expo 56 / React Native), dividido para **2 desenvolvedores front trabalhando em paralelo**, ambos usando Claude Code no mesmo repo.

- **Dev F1 — Capacitação & Certificação** (dono da **fatia ao vivo**)
- **Dev F2 — Conexão, Indústria & Fundação compartilhada**
- **Backend** = 1 dev separado em `CapaciTO_API`. Aqui ele é tratado como **fronteira externa**: o front consome `/api/v1` e **não espera** o backend (mock-first — ver §"Fronteira de API").

Fonte da verdade: [docs/requisitos-fieto.md](docs/requisitos-fieto.md). Convenções e DoD: [CLAUDE.md](CLAUDE.md).

> 🎯 **Estrela-guia:** a fatia **QR → microvídeo → certificação na carteira** (CLAUDE.md §8). Tudo que não a protege é secundário.

---

## 1. Como as duas trilhas não colidem (regras de convivência)

Mesmo repo, 2 devs, ambos com Claude Code → o que evita conflito é **propriedade de pastas**. Cada dev só edita os arquivos da sua trilha; arquivos compartilhados têm dono único.

**Estrutura de rotas (expo-router) com route groups por dono:**
```
src/app/
├── (auth)/          login, registro            ← F1 cria, F2 revisa
├── (trabalhador)/   carteira, aprender, curso/[id], scan   ← DONO: F1
├── (industria)/     dashboard, estacoes, vagas, buscar      ← DONO: F2
├── _layout.tsx      shell + roteamento por papel            ← DONO: F2
└── index.tsx        splash/redirect por sessão              ← DONO: F2

src/components/
├── ui/              design system compartilhado             ← DONO: F2 (F1 só consome)
├── capacitacao/     player, card de curso, badge cert.      ← DONO: F1
└── conexao/         card de vaga, match badge, form vaga    ← DONO: F2

src/lib/
├── api/             cliente HTTP + endpoints + mocks         ← DONO: F2 (contrato compartilhado)
├── session/         auth context, storage do JWT            ← DONO: F2
└── theme/           tokens, cores, tipografia (PT-BR/acessível) ← DONO: F2
```

**Regras:**
1. **Não editar arquivo de outro dono.** Precisa de algo no domínio do outro? Abre como tarefa de sync, não edita por fora.
2. **`src/lib/api` é o contrato.** Mudou assinatura de endpoint/DTO? Avisa o outro no mesmo commit.
3. **Branches por trilha** (`feat/f1-...`, `feat/f2-...`), PRs pequenos, merge frequente na main para reduzir divergência.
4. **Componente reusável vira `components/ui` (F2)**; componente de feature mora junto da feature.

---

## 2. Fronteira de API (mock-first — o front nunca fica travado)
F2 monta `src/lib/api` com **duas implementações atrás da mesma interface**: `mock` (dados fake locais) e `real` (HTTP para `/api/v1`). Um flag escolhe qual usar.

- Front desenvolve contra **mock** desde a hora 0.
- Quando o backend entrega um endpoint, vira o flag daquele recurso para **real**.
- Combinar os DTOs cedo com o dev de backend (CLAUDE.md §5). Endpoints da fatia ao vivo têm prioridade de contrato: `POST /auth/login`, `GET /estacoes/qr/{codigo}`, `POST /conclusoes`, `GET /perfil/me`.

---

## 3. Milestones dinâmicos (não são blocos de hora fixos)
Cada milestone é um **estado verificável** que destrava o próximo. Os dois devs puxam tarefas da sua trilha em paralelo; os **sync points** são onde convergem.

| Milestone | Estado alcançado | F1 | F2 |
|---|---|---|---|
| **M0 — Fundação** | App roda, navega por papel, mock de API responde | telas de auth | design system + shell + `lib/api` mock + sessão |
| **M1 — Esqueleto navegável** | Todas as rotas existem (mock), login funciona, dá pra "passear" no app | carteira + catálogo (mock) | telas indústria + vagas (mock) |
| **M2 — Fatia ao vivo 🟢** | QR→vídeo→conclusão→**certificação na carteira** rodando contra API real | **prioridade total** | vagas compatíveis + match real |
| **M3 — Conexão & complementos** | Lado indústria e busca de cursos funcionais | busca/catálogo de cursos, completude, microquiz | cadastro estação+QR, publicar vaga, buscar por certificação |
| **M4 — Polimento & demo** | App coeso, mocks redondos, ensaio do pitch | polir fatia ao vivo | polir conexão + estados de erro |

> **Trava de segurança:** M2 é o coração. Se M2 não fechar, **F2 pausa M3 e ajuda F1** a estabilizar a fatia ao vivo antes de qualquer tela nova.

---

## TRILHA F1 — Capacitação & Certificação (dono da fatia ao vivo)

**Objetivo:** o trabalhador chega, busca cursos, se capacita por microvídeo (catálogo ou QR na estação), e cada conclusão **certifica uma competência que aparece na carteira**.

### M0 · Fundação [F1]
- Telas `(auth)/login` e `(auth)/registro` consumindo `lib/api` (mock → real). Validar **RN09 (idade ≥18)** na UI de registro de trabalhador. → **RF01, RF02**.
- Guardar/usar sessão (via `lib/session` do F2).

### M1 · Esqueleto [F1]
- Tela **Carteira/Perfil** exibindo competências certificadas + indicador de completude. → **RF06, RF07**.
- Tela **Aprender (catálogo)**: lista de cursos/microvídeos com **busca** (o trabalhador procura como se capacitar). → **RF10**.
- Toggle de **visibilidade do perfil** para indústrias. → **RF08; RN06**.

### M2 · Fatia ao vivo 🟢 [F1] — PRIORIDADE MÁXIMA
- **Player de microvídeo vertical** (`expo-video`). → **RF11**.
- **Scanner de QR** (`expo-camera`) → `GET /estacoes/qr/{codigo}` → abre o vídeo do procedimento da estação (ex.: "como agir na câmara fria"). → **RF17; RN04**.
- Ao concluir → `POST /conclusoes` (origem QR/CATALOGO), idempotente. → **RF13, RF18; RN10**.
- Após concluir, navegar à **Carteira** e mostrar a **nova certificação surgindo**. → **RF20, RF21; RN01, RN02**.

### M3 · Complementos [F1]
- Busca/filtros do catálogo por tema (higiene, manipulação, segurança alimentar). → **RF10**.
- Trilhas (sequência de vídeos) 🟡 navegável. → **RF12**.
- Microquiz de 1–3 questões ao fim do conteúdo. → **RF14; RN01**.
- Edição completa do perfil (nome, foto, cidade, funções de interesse). → **RF05**.

### M4 · Polimento [F1]
- Estados de loading/erro amigáveis na fatia ao vivo; tolerância a rede instável (cache do vídeo já aberto). → **RNF01, RNF02**.
- Garantir que QR→vídeo→certificação nunca quebra (smoke test em device físico).

**Entregável-chave da trilha:** demo ao vivo QR→vídeo→certificação na carteira, ponta a ponta.

---

## TRILHA F2 — Conexão, Indústria & Fundação compartilhada

**Objetivo:** a fundação que o F1 consome (design system, navegação, API) + o lado "LinkedIn da indústria": empresa publica vagas / busca pessoas por certificação, e o trabalhador vê vagas compatíveis.

### M0 · Fundação compartilhada [F2] — entregar cedo, destrava o F1
- **Design system** em `components/ui`: botão, input, card, lista, header, estados vazios — PT-BR, mobile-first, ícones grandes, alto contraste. → **RNF01, RNF09**.
- `theme/` tokens (cores, tipografia, spacing) reaproveitando o que já existe em `src/constants/theme.ts`.
- **Shell de navegação por papel** (`_layout.tsx`, `index.tsx`): após login, roteia Trabalhador vs. Indústria. → **RF03**.
- **`lib/api`**: interface + implementação **mock** + cliente HTTP real + flag por recurso; base URL configurável (IP da máquina, não `localhost`).
- **`lib/session`**: contexto de auth, storage do JWT, guarda de rotas.

### M1 · Esqueleto [F2]
- Telas da **indústria** (mock navegável): dashboard, lista de estações, lista de vagas. → estrutura p/ RF15, RF24.
- Tela **Vagas** (trabalhador) mock. → estrutura p/ RF26.

### M2 · Conexão real 🟢 [F2]
- **Vagas compatíveis** (trabalhador): lista vinda de `GET /vagas/compativeis` com **badge de match**. Só aparece se tiver todas as competências obrigatórias ATIVAS. → **RF25, RF26; RN05, RN03**.
- (Se ajudar a fatia ao vivo, priorizar isso só após M2 do F1 estar verde.)

### M3 · Indústria & busca [F2]
- **Cadastrar estação** + associar conteúdo/procedimento + **gerar/exibir QR** da estação (o QR que o F1 vai escanear). → **RF15, RF16; RN04, RN07**.
- **Publicar vaga** (função, município, competências obrigatórias/desejáveis). → **RF24; RN08**.
- **Buscar trabalhadores por competência certificada** (respeitando `visivel`). → **RF28; RN06, RN07**.
- **Candidatar-se** a vaga (lado trabalhador). → **RF27**.

### M4 · Polimento [F2]
- Estados de erro/vazio em todas as telas de conexão; telas 🟡 sem becos sem saída.
- Telas só de pitch 🔵 (PDF da carteira, verificação por terceiros, chat) como mock estático se ajudar a narrativa — **não implementar**.

**Entregável-chave da trilha:** fundação estável + ciclo de conexão (publica vaga → match por certificação → trabalhador vê vaga compatível).

---

## 4. Sync points (onde os dois conversam)
1. **Fim do M0:** F2 entrega `components/ui` + `lib/api` (mock) + shell de navegação → **destrava F1**. Sem isso, F1 fica limitado.
2. **Contrato de DTO:** sempre que `lib/api` muda, ambos alinham (e com o dev de backend).
3. **Início do M2:** virar flags de mock→real conforme o backend entrega; testar a fatia ao vivo juntos em device físico.
4. **QR ponta a ponta (M2/M3):** o QR gerado pela tela da indústria (F2) precisa ser lido pelo scanner do trabalhador (F1) → testar o par junto.

---

## 5. Cobertura de RFs (só os que tocam o front)

| RF | Prioridade | Trilha · Milestone | Entrega |
|---|---|---|---|
| RF01, RF02, RF03 | M | F1 M0 / F2 M0 | 🟢 |
| RF04 (recuperar senha) | S | — | 🔵 corte |
| RF05 | M | F1 M3 (edição) | 🟢/🟡 |
| RF06, RF07 | M | F1 M1 | 🟢 |
| RF08 | S | F1 M1 | 🟢 toggle |
| RF09 (PDF) | C | — | 🔵 |
| RF10, RF11, RF13 | M | F1 M1/M2 | 🟢 |
| RF12 (trilhas) | S | F1 M3 | 🟡 |
| RF14 (microquiz) | S | F1 M3 | 🟢/🟡 |
| RF15, RF16 | M | F2 M3 | 🟢 (cadastro+QR) |
| RF17, RF18 | M | F1 M2 | 🟢 |
| RF19 (offline) | C | — | 🔵 |
| RF20, RF21 | M | F1 M2 | 🟢 |
| RF22 (validade) | S | F1 M1 (exibir status) | 🟢/🟡 |
| RF23 (verificação 3º) | C | — | 🔵 |
| RF24, RF25, RF26 | M | F2 M1–M3 | 🟢 |
| RF27 | S | F2 M3 | 🟡/🟢 |
| RF28 | S | F2 M3 | 🟢 |

---

## 6. Riscos e cortes (proteger sempre a fatia ao vivo do F1)
Cortar de fora pra dentro, **nunca** a fatia QR→vídeo→certificação:

1. **Corte primeiro (🔵):** RF04, RF09 (PDF), RF19 (offline), RF23, chat.
2. **Vira mock 🟡:** RF15 cadastro de estação pela UI (usar seed/QR pré-gerado do backend), RF27 candidatura, RF28 busca, RF12 trilhas, edição completa de perfil (RF05).
3. **Simplificar:** RF14 microquiz → pular (RN01 cobre "quando existir"); RF22 → só exibir `ATIVA`.
4. **Se M2 do F1 atrasar:** F2 pausa M3 e migra para ajudar o scanner/player/carteira.
5. **Plano B de demo:** F1 grava um **vídeo do fluxo** QR→vídeo→certificação como backup contra falha de câmera/rede no evento.

**Riscos técnicos a vigiar (cedo, no M0):**
- ⚠️ **Câmera/QR e vídeo não rodam no Expo web** e podem falhar no Expo Go → testar em **dev build / device físico** já no M0 (não deixar pro M2).
- ⚠️ **Base URL no device físico** ≠ `localhost` → usar IP da máquina; checar firewall na porta 8080.
- ⚠️ **Colisão de Git entre F1/F2** → respeitar a propriedade de pastas (§1) e fazer merges pequenos e frequentes.
- ⚠️ **Dependência do backend** → mock-first (§2); o front demonstra mesmo se um endpoint atrasar.
- ⚠️ **Conteúdo de vídeo próprio** (sem marca de terceiros) → combinar com quem grava os 2 microvídeos (higienização de mãos, câmara fria/recepção de pescado).
