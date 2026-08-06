# CapaciTO — Plataforma de Qualificação Profissional (App)

![CapaciTO logo](assets/images/icon.png)

Uma aplicação móvel construída com Expo + React Native em TypeScript, parte da solução CapaciTO — Plataforma de Qualificação e Conexão Profissional para a indústria de alimentos do Tocantins.

> Demonstração ancorada em um frigorífico de pescado (tilápia). O produto é horizontal e aplicável a outros segmentos (laticínios, panificação, polpas etc.).

---

## Visão rápida

- Microvídeos verticais + treinos Just‑in‑Time via QR Code nas estações de trabalho.
- Cada conclusão gera uma certificação que compõe a Carteira de Qualificação Digital do trabalhador.
- Empresas procuram e contratam trabalhadores com certificações.

---

## Recursos principais

- Catálogo de conteúdos (microvídeos e trilhas).
- Leitura de QR Code para abrir o procedimento correto da estação.
- Registro de conclusão e emissão de certificações no perfil do trabalhador.
- Perfis para Trabalhador e Indústria (papéis com permissões distintas).

---

## Stack

- Language(s): TypeScript, JavaScript
- Framework / runtime: Expo (SDK ~56) + React Native 0.85
- Notable libraries: expo-router, expo-camera, expo-video, react-native-qrcode-svg

Versões relevantes estão em `package.json`.

---

## Estrutura do repositório

```
/ (repo root)
├── app.json                # config do Expo
├── package.json            # dependências e scripts
├── app/                    # código do aplicativo (file-based routing)
├── src/                    # componentes, hooks, constantes, utilitários
├── assets/                 # imagens, ícones e splash
├── docs/                   # requisitos, roadmap e notas de projeto
└── scripts/                # utilitários (ex.: reset-project)
```

Como se integra: o app consome a API (projeto separado `CapaciTO_API`) via REST + JWT; QR Codes são gerados pelo backend e lidos pelo app (expo-camera).

---

## Começar (desenvolvimento)

Pré-requisitos

- Node.js (compatível com Expo SDK ~56)
- npm ou yarn
- Android Studio (emulador) ou Xcode (simulador) — opcional

Instalar dependências

```bash
npm install
# ou
# yarn install
```

Executar em desenvolvimento

```bash
npx expo start
```

Abrir no Android/iOS ou usar Expo Go para testes rápidos.

Script úteis

- `npm run reset-project` — move o código de exemplo para `app-example` e cria um `app` limpo (útil para começar do zero)
- `npm run android` / `npm run ios` / `npm run web`

---

## Backend (rodando localmente — projeto irmão)

O backend está em um repositório separado (procure por `CapaciTO_API`). Para rodar localmente (exemplo):

```bash
cd ../CapaciTO_API
./mvnw spring-boot:run
```

A API usa Java 21 + Spring Boot e Flyway para migrations (H2 embarcado em dev).

---

## Arquitetura & padrões

- API REST versionada (ex.: `/api/v1`) com autenticação JWT.
- Separação clara entre perfis (Trabalhador / Indústria / Admin).
- QR Codes vinculados a estações → abrem conteúdos específicos (procedimentos/microvídeos).
- Persistência e versionamento de esquema via Flyway (no backend).

---

## Documentação e requisitos

Leia `docs/requisitos-fieto.md` para o panorama completo dos requisitos funcionais e das regras de negócio do MVP (foco: QR → vídeo → certificação no perfil).

---

## Contribuindo

1. Leia `docs/requisitos-fieto.md` para entender o fluxo que precisa rodar na demo.
2. Abra uma issue antes de começar mudanças maiores.
3. Siga a convenção de código do projeto e rode `npx expo lint` antes de abrir PR.

Sugestões de primeiras tarefas

- Implementar cache offline para conteúdos de estação.
- Melhorar onboarding e fluxo de cadastro de perfil.
- Adicionar testes básicos para componentes críticos.

---

## Licença

Ver arquivo `LICENSE` (se presente). Caso não haja, escolha uma licença compatível (ex.: MIT).

---

## Contato

Maintainer: @rafaelsdiniz

---

_Se quiser, eu adapto este README para inglês, adiciono badges (build / expo / license) ou incluo um GIF demonstrando o fluxo QR → vídeo → certificação._
