<div align="center">

<img src="assets/images/icon.png" width="120" alt="CapaciTO" />

# CapaciTO

**Qualificação e conexão profissional para a indústria de alimentos do Tocantins.**

Aprenda na estação por QR → certifique a competência → seja encontrado pela indústria.

[![Expo](https://img.shields.io/badge/Expo-SDK%2056-000?logo=expo&logoColor=white)](https://docs.expo.dev/versions/v56.0.0/)
[![React Native](https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Platforms](https://img.shields.io/badge/Android%20·%20iOS%20·%20Web-lightgrey)](#-rodando)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

_Desafio Industrial FIETO 2026 — Frente A_

</div>

---

## 🎯 O problema

A indústria de alimentos do Tocantins não acha gente qualificada. O trabalhador não tem como **provar** o que sabe fazer. Treinamento formal é caro, lento e some assim que termina.

## 💡 A solução

Um ciclo curto, que roda no celular do chão de fábrica:

```
  📱 QR na estação  →  🎬 Microvídeo  →  ✅ Certificação  →  💼 Match com vagas
     (RF17)             (RF11)            (RF20/21)          (RN05)
```

1. O trabalhador **escaneia o QR** da estação (ex.: câmara fria do frigorífico).
2. Abre o **microvídeo vertical** do procedimento vigente daquela estação.
3. Ao concluir, a competência entra automaticamente na **Carteira de Qualificação Digital**.
4. Vagas que exigem essa competência passam a dar **match** — e a indústria encontra o perfil.

> **Segmento herói:** frigorífico de pescado / piscicultura (tilápia). O produto é **horizontal** — o mesmo modelo já atende laticínio, polpa e panificação.

---

## ✨ O que o app faz

### 👷 Trabalhador

| Tela | O que entrega |
|---|---|
| **Carteira** | Carteira de Qualificação Digital — competências certificadas, completude do perfil, atalho para escanear |
| **Escanear** | Leitor de QR (`expo-camera`) → resolve a estação → abre o procedimento vigente |
| **Aprender** | Catálogo de microvídeos e trilhas, com busca por tema (higiene, manipulação, segurança) |
| **Curso** | Player vertical (`expo-video`) + microquiz → registra conclusão → emite certificação |
| **Vagas** | Vagas compatíveis, com o que já bate e **o que falta** para dar match |
| **Perfil** | Edição, funções de interesse e **controle de visibilidade** (consentimento LGPD) |

### 🏭 Indústria

| Tela | O que entrega |
|---|---|
| **Início** | Painel com estações, vagas publicadas e candidatos |
| **Estações** | Cadastro de estação + **QR gerado no app** (`react-native-qrcode-svg`) para imprimir e colar |
| **Vagas** | Publicação de vaga com competências obrigatórias e desejáveis |
| **Buscar** | Busca de trabalhadores **por competência certificada**, respeitando a visibilidade do perfil |

---

## 🧱 Stack

| Camada | Escolha |
|---|---|
| Runtime | **Expo SDK ~56** · React Native 0.85 · React 19 |
| Linguagem | **TypeScript 6** (`strict`), alias `@/* → src/*` |
| Navegação | **expo-router** (file-based, typed routes) com route groups por papel |
| Câmera / QR | `expo-camera` (leitura) · `react-native-qrcode-svg` (geração) |
| Vídeo | `expo-video` (microvídeo vertical) |
| UI | Design system próprio (`src/components/ui`) · `react-native-reanimated` · `expo-linear-gradient` · Nunito |
| Sessão | Context + `expo-secure-store` |
| Backend | [`CapaciTO_API`](https://github.com/rafaelsdiniz) — Spring Boot 4 · Java 21 · JPA/H2 · Flyway · JWT (repo separado) |

**Identidade visual — "O Rio e o Sol":** Azul Rio `#0A3659` · Teal Água-Doce `#008F8C` · Dourado Jalapão `#F2A900` · Chumbo `#2C3E50`. Tokens em [src/constants/theme.ts](src/constants/theme.ts).

---

## 🚀 Rodando

**Pré-requisitos:** Node.js 20+ e npm. Para câmera de verdade: device físico com Expo Go (ou dev build).

```bash
npm install
npm run start      # dev server + QR do Expo Go
```

Ou direto na plataforma:

```bash
npm run android
npm run ios
npm run web        # ⚠️ câmera/QR não funcionam no navegador
```

### 🔑 Contas de demonstração

Funcionam sem backend (modo mock):

| Papel | Login | Senha |
|---|---|---|
| Trabalhador | `maria@trab.com` | `123456` |
| Indústria | `rh@pescado.com` | `123456` |

### 🔌 Conectando ao backend

A base da API fica em [src/lib/api/http.ts](src/lib/api/http.ts#L15):

```ts
export const API_BASE_URL = 'http://localhost:8080/api/v1';
```

Em **device físico, troque `localhost` pelo IP da máquina** que roda a API (ex.: `http://192.168.0.10:8080/api/v1`). Para forçar 100% mock, defina `BACKEND_ATIVO = false` em [src/lib/api/index.ts](src/lib/api/index.ts#L77).

Subindo a API (repo irmão):

```bash
cd ../CapaciTO_API
./mvnw spring-boot:run    # porta 8080; Flyway aplica as migrations no boot
```

---

## 🏗️ Arquitetura

### A fronteira de API: mock-first com fallback

Todo o app conversa com **um único objeto** `api` ([src/lib/api/index.ts](src/lib/api/index.ts)). Cada método escolhe entre a chamada HTTP real e o mock — e, se o backend estiver **inacessível**, cai automaticamente para o mock:

```
        UI (telas)
            │
      api.*  ◄── contrato único, tipado (types.ts)
       ╱   ╲
   real.ts   mock.ts
      │         │
   HTTP /api/v1  dados em memória (seed de pescado)
      │
   ✗ rede fora ──► fallback → mock   (a demo nunca trava · RNF02)
```

- Erros **4xx/5xx** do servidor sobem normalmente — só falha de rede (`status: 0`) faz fallback.
- Se o **login** caiu no mock, a sessão inteira segue no mock, para não misturar estados.
- Cada método mockado tem um comentário dizendo **qual endpoint falta** no backend.

### Navegação por papel

```
src/app/
├── index.tsx            → animação de entrada → roteia por papel
├── (auth)/              → login · registro
├── (trabalhador)/       → carteira · aprender · vagas · perfil  (+ escanear, curso/[id], vaga/[id])
└── (industria)/         → inicio · estacoes · vagas · buscar    (+ vaga-nova, estacao/[id])
```

### Estrutura

```
capaciTO_app/
├── src/
│   ├── app/           # rotas (expo-router, file-based)
│   ├── components/    # ui/ (design system) · capacitacao/ · animações
│   ├── constants/     # theme.ts — cores, tipografia, espaçamento, sombras
│   ├── hooks/         # use-theme, use-color-scheme
│   └── lib/
│       ├── api/       # index (fronteira) · real · mock · http · types · auth-store
│       └── session/   # session-context (usuário + JWT)
├── assets/            # imagens, ícones, splash
├── docs/              # requisitos-fieto.md (a spec — fonte da verdade)
├── CLAUDE.md          # guia operacional da equipe
└── ROADMAP.md         # trilhas, milestones e sync points do front
```

---

## 📐 Regras de negócio no front

O app respeita as RN da spec — não só o backend:

- **RN02** — certificação não é editável pelo trabalhador; ela aparece sozinha após a conclusão.
- **RN03** — certificação `EXPIRADA` não conta no match.
- **RN04** — 1 QR = 1 estação; atualizar o procedimento mantém o mesmo QR apontando para a versão nova.
- **RN05** — só há match com **todas** as obrigatórias ativas; desejáveis apenas melhoram a ordenação.
- **RN06** — perfil só visível à indústria com `visivel = true`.
- **RN09** — cadastro de trabalhador exige **idade ≥ 18** (validado na UI e no mock).
- **RN10** — conclusão é única por conteúdo; repetir não duplica certificação.

Lista completa: [CLAUDE.md §7](CLAUDE.md) · spec: [docs/requisitos-fieto.md](docs/requisitos-fieto.md).

---

## 🎨 Decisões de design

Público de baixa escolaridade, celular Android, chão de fábrica, conexão precária:

- **PT-BR em tudo** — código, rotas e domínio (`carteira`, `estacoes`, `vagas`).
- **Ícones grandes, alto contraste, um objetivo por tela.**
- **Mobile-first**, com largura máxima de conteúdo para não quebrar no web.
- **Tolerância a rede ruim** — fallback offline na camada de API.
- **Vídeo próprio** — nada de conteúdo de terceiros.

---

## 📜 Scripts

| Comando | O que faz |
|---|---|
| `npm run start` | Expo dev server |
| `npm run android` / `ios` / `web` | Abre na plataforma |
| `npm run lint` | ESLint (`eslint-config-expo`) |
| `npm run reset-project` | Move o exemplo para `app-example` e cria um `app` limpo |

---

## 🤝 Contribuindo

1. Leia [docs/requisitos-fieto.md](docs/requisitos-fieto.md) — é a fonte da verdade.
2. Confira o [ROADMAP.md](ROADMAP.md) para saber de quem é a trilha.
3. Antes do PR: `npm run lint` e app subindo sem crash.
4. **Nunca quebre a fatia ao vivo** (QR → vídeo → certificação no perfil).

Convenções: arquivos `kebab-case.tsx`, componentes `PascalCase`, reuso de `Spacing`/`Colors`/`Brand` do tema, sem cores soltas.

---

## 📄 Licença

MIT — ver [LICENSE](LICENSE).

<div align="center">

Feito no Tocantins 🐟 · **FIETO 2026**

</div>
