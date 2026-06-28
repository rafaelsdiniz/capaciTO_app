# ROADMAP — Front (App React Native) · CapaciTO (pós-pivot)

> **PIVOT (28/06/2026):** acabou a parte de cursos/treino por QR.
> O app é o **"LinkedIn da indústria de alimentos do TO"**, dois lados (Trabalhador e Empresa), com **vagas + match** no centro e **qualificação/plano de carreira** como diferencial.

**Legenda:** ✅ feito · 🔧 em andamento · ⬜ a fazer · ❌ removido no pivot

---

## 🧭 Nova arquitetura de navegação

### App do TRABALHADOR — 4 abas (nesta ordem)
1. **Vagas** 🟢 *(home — visual focado nisso)* — feed de vagas com match
2. **Editais & Cursos** — onde buscar conhecimento (editais, cursos gratuitos, bolsas)
3. **Plano de carreira** — como o trabalhador pode evoluir (lacunas + próximos passos)
4. **Meu perfil** — currículo, questionário, atualizar dados

### App da EMPRESA
- **Dashboard** — gráficos e números sobre vagas, candidaturas e funcionários
- **Vagas** — abrir e gerenciar vagas + ver candidatos
- **Funcionários** — quem já foi contratado (seu time)
- **Buscar talentos** — procurar trabalhadores por competência

---

## 📊 Progresso por milestone — ✅ ESTRUTURA COMPLETA (typecheck verde)
- [x] **M0 — Demolição + nova navegação** (removidos QR/cursos/estações; abas reorganizadas)
- [x] **M1 — Trabalhador: Vagas (home)** 🟢 (já existia, virou home)
- [x] **M2 — Trabalhador: Perfil** (currículo + competências + completude + visibilidade)
- [x] **M3 — Trabalhador: Editais & Cursos** (`editais.tsx`)
- [x] **M4 — Trabalhador: Plano de carreira** (`plano-carreira.tsx`)
- [x] **M5 — Empresa: Dashboard com gráficos** (`inicio.tsx`, barras nativas)
- [x] **M6 — Empresa: Vagas + Candidatos + Funcionários** (`funcionarios.tsx`)
- [ ] **M7 — Integração backend real + polimento + ensaio** (telas novas ainda mock-first)

> Validado: `npx tsc --noEmit` sem erros. Falta: `npx expo start` no device + ligar mock→real + polimento visual fino.

---

## M0 · Demolição + nova navegação ⬜

- [ ] ❌ Remover telas/fluxo de **QR / scanner** (`scan`, `expo-camera`)
- [ ] ❌ Remover telas/fluxo de **Aprender/catálogo/curso/player** (`expo-video`, `react-native-qrcode-svg` se não usar mais)
- [ ] ❌ Remover **estações** do lado empresa
- [ ] ❌ Remover mocks de conteúdo/conclusão/estação em `lib/api`
- [ ] Reabar **Trabalhador**: Vagas · Editais & Cursos · Plano de carreira · Perfil
- [ ] Reabar **Empresa**: Dashboard · Vagas · Funcionários · Buscar talentos
- [ ] Atualizar `lib/api` (mock-first) com os novos recursos: `vagas`, `oportunidades`, `planoCarreira`, `perfil/questionario`, `funcionarios`, `dashboard`
- [ ] Typecheck `tsc` verde

---

## M1 · Trabalhador — Vagas (HOME) 🟢 ⬜

> Primeira tela do app, visual caprichado (é o coração).

- [ ] **Feed de vagas** com card forte: função, empresa, município, **badge de match** (% / "compatível")
- [ ] **Busca + filtros** (texto, compatíveis, segmento, município)
- [ ] **Detalhe da vaga**: descrição, competências obrigatórias/desejáveis (marcando o que o usuário já tem), botão **Candidatar-se**
- [ ] Estado vazio/loading/erro amigável
- [ ] Consome `GET /vagas` e `/trabalhadores/{id}/vagas-compativeis` (mock → real)

---

## M2 · Trabalhador — Perfil + Questionário ⬜

> O questionário monta o currículo; competências autodeclaradas alimentam o match.

- [ ] **Questionário de onboarding** (multi-step): dados pessoais → formação → experiência → competências → funções de interesse → visibilidade
- [ ] Validação **idade ≥ 18 (RN09)**
- [ ] **Tela de perfil/currículo**: dados, formação, experiência, competências (comprovante opcional), **% de completude** (RF07)
- [ ] **Editar** qualquer seção do currículo
- [ ] Toggle de **visibilidade** (LGPD — RN06)
- [ ] Consome `POST /perfis/questionario`, `GET/PUT /perfis/me`

---

## M3 · Trabalhador — Editais & Cursos ⬜

- [ ] **Lista de oportunidades**: editais, cursos gratuitos, bolsas (instituição, tipo, modalidade, prazo, gratuito)
- [ ] **Filtros**: por competência, município, tipo, online/presencial
- [ ] **Detalhe** com link externo p/ inscrição
- [ ] Destaque "indicado pra você" (ligado ao plano de carreira)
- [ ] Consome `GET /oportunidades`

---

## M4 · Trabalhador — Plano de carreira ⬜

- [ ] Tela "**Como evoluir**": mostra **lacunas** (competências que faltam pras vagas que quer)
- [ ] Pra cada lacuna → **oportunidade recomendada** (atalho pra aba Editais & Cursos)
- [ ] **Próximo passo** (cargo atual → cargo alvo) e vagas que destravam ao preencher a lacuna
- [ ] Consome `GET /trabalhadores/{id}/plano-carreira`

---

## M5 · Empresa — Dashboard com gráficos ⬜

- [ ] **Cards** de número: vagas abertas, candidaturas, funcionários
- [ ] **Gráficos**: candidaturas por vaga, funil (recebido→análise→contratado), competências mais buscadas, vagas por status/mês
- [ ] Escolher lib de gráfico compatível com Expo 56 (ex.: `react-native-svg` + `victory-native` ou `react-native-gifted-charts` — validar versão)
- [ ] Consome `GET /empresas/dashboard`

---

## M6 · Empresa — Vagas + Candidatos + Funcionários ⬜

- [ ] **Publicar vaga** (função, município, competências obrigatórias/desejáveis) — RN08
- [ ] **Minhas vagas** (lista, status) — RN07
- [ ] **Candidatos** de uma vaga (com match) + **mudar status** (análise/contratar/recusar)
- [ ] **Seus funcionários** (contratados): lista do time + competências agregadas
- [ ] **Buscar talentos** por competência (só perfis públicos — RN06/RN07)
- [ ] Consome `/vagas`, `/vagas/{id}/candidatos`, `/candidaturas/{id}/status`, `/empresas/{id}/funcionarios`, `/trabalhadores?competencia=`

---

## M7 · Integração + polimento + demo ⬜

- [ ] Virar `USE_MOCK.<recurso> = false` conforme o backend entrega
- [ ] `lib/session`: persistir JWT (expo-secure-store) + header Authorization
- [ ] Base URL por env (IP da máquina no device físico, não `localhost`)
- [ ] Estados de erro/vazio em todas as telas
- [ ] Identidade visual revisada com foco em **Vagas** como home
- [ ] Ensaio de pitch + vídeo de backup do fluxo principal

---

## Fronteira de API (mock-first — front nunca trava)
- Recursos: `auth`, `perfil` (+questionario), `vagas`, `match`, `candidaturas`, `oportunidades`, `planoCarreira`, `funcionarios`, `dashboard`, `competencias`
- Prioridade de contrato com o backend: `/vagas`, `/trabalhadores/{id}/vagas-compativeis`, `/perfis/questionario`, `/oportunidades`

## RNs que tocam o front
RN05 (match), RN06 (visibilidade/LGPD), RN07 (multiempresa), RN08 (papéis), RN09 (idade ≥18).
~~RN01/RN04/RN10~~ removidas (eram QR/treino).

## Cortes se o tempo apertar (de fora pra dentro — nunca cortar Vagas)
1. 🔵 Plano de carreira vira versão simples (só lista de lacunas)
2. 🔵 Dashboard com menos gráficos
3. 🔵 Buscar talentos / mudar status de candidatura
4. 🟡 Editais como lista estática do seed
> **Nunca** cortar: Vagas (home) + Perfil/Questionário + match.
