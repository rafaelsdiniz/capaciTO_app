@AGENTS.md

# CapaciTO — Guia operacional (Claude Code + equipe)

> Plataforma de Qualificação e Conexão Profissional da Indústria de Alimentos do Tocantins
> **Desafio Industrial FIETO 2026 — Frente A** · Hackathon 48h
> Fonte da verdade: [docs/requisitos-fieto.md](docs/requisitos-fieto.md). **Leia a spec inteira antes de codar.**

---

## 1. Visão do produto (3 linhas)
O trabalhador **aprende** em microvídeos verticais e treinos Just-in-Time por QR na estação → cada treino concluído **certifica** uma competência na sua Carteira de Qualificação Digital (o perfil) → com o perfil certificado ele **é encontrado** pelas indústrias de alimentos do TO → a **indústria contrata** gente qualificada. O perfil/carteira é o coração; aprendizagem, QR e vagas existem para preencher ou consumir esse perfil.

### 1.1 Segmento herói: frigorífico de pescado / piscicultura
**Decisão de produto:** a plataforma é **horizontal** (multi-segmento no modelo de dados — `Empresa.segmento`, RNF08), mas a **demo, o seed e a narrativa são ancorados em pescado** — a cara da indústria de alimentos do TO (potência em tilápia/piscicultura) e onde a dor sanitária (cadeia de frio, câmara fria) é mais palpável.

Implicações práticas:
- **Microvídeos e estações** giram em torno de pescado: *higienização de mãos*, *recepção de pescado*, *como agir na câmara fria*.
- **Seed:** 1 frigorífico de pescado completo (estações, competências, vaga) + 1 laticínio e 1 panificadora só de figuração (1–2 registros) para mostrar escala.
- **Pitch:** "Começamos no pescado e a mesma plataforma já atende laticínio, polpa e panificação" — protege Aderência (25) **e** Modelo de negócio/escala (15).
- **Não** estreitar o produto/código a um nicho: o catálogo de competências e o multi-empresa continuam genéricos.

---

## 2. Estrutura do repositório (REAL — NÃO é monorepo)
Dois projetos Git **separados**, lado a lado em `Desktop\CapaciTO\`:

```
Desktop\CapaciTO\
├── CapaciTO\          ← APP (este diretório) — Expo / React Native / TypeScript
│   ├── src\app\       ← telas (expo-router, file-based routing)
│   ├── src\components\← componentes UI (themed-text, themed-view, app-tabs…)
│   ├── src\constants\ ← theme.ts (Spacing, cores)
│   ├── src\hooks\     ← use-color-scheme, use-theme
│   ├── assets\        ← imagens, ícones
│   ├── docs\          ← requisitos-fieto.md (spec compartilhada) + este CLAUDE.md/ROADMAP.md
│   ├── app.json       ← config Expo
│   └── package.json
│
└── CapaciTO_API\      ← BACKEND — Spring Boot / Java 21 / Maven
    ├── src\main\java\br\com\capacito\   ← código (hoje só CapacitoApplication.java)
    ├── src\main\resources\
    │   ├── application.properties
    │   └── db\migration\                ← migrations Flyway V1__*.sql (A CRIAR)
    ├── src\test\java\…
    └── pom.xml
```

**Convenção de pacotes backend** (a criar sob `br.com.capacito`):
`config` · `security` · `auth` · `usuario` · `perfil` · `empresa` · `competencia` · `conteudo` · `estacao` · `conclusao` · `certificacao` · `vaga` · `candidatura` · `common` (exceptions, DTOs base).
Cada módulo de domínio segue camadas `controller / service / repository / model / dto`.

> ⚠️ Os docs de coordenação (este `CLAUDE.md`, `ROADMAP.md`, `docs/`) vivem no repo do **app** por ser o diretório primário. Quem trabalha no backend deve abrir `CapaciTO_API` e consultar estes arquivos no repo irmão.

---

## 3. Stack e versões EXATAS (estado real do repo)

### Backend — `CapaciTO_API`
| Item | Versão real (pom.xml) | Observação |
|---|---|---|
| Spring Boot | **4.1.0** | ⚠️ A spec diz "3.x"; o scaffold já veio em 4.1.0. **Usamos 4.1.0.** |
| Java | **21** | virtual threads disponíveis |
| Build | Maven (wrapper `mvnw`) | |
| Persistência | Spring Data JPA + **H2** embarcado | |
| Migrations | **Flyway** | `src/main/resources/db/migration` |
| Segurança | Spring Security (+ **JWT a adicionar**: jjwt) | BCrypt nativo do Spring Security |
| Validação | Bean Validation (starter-validation) | |
| Web | Spring Web MVC | |
| Lombok | presente | |

> **Falta adicionar ao pom:** dependência de JWT (`io.jsonwebtoken:jjwt-api/impl/jackson` ou similar) e, se gerarmos QR no backend, uma lib de QR (ex.: `com.google.zxing:core+javase`).

### App — `CapaciTO` (este repo)
| Item | Versão real (package.json) |
|---|---|
| Expo | **~56.0.12** — leia https://docs.expo.dev/versions/v56.0.0/ antes de codar |
| React Native | **0.85.3** |
| React | **19.2.3** |
| Roteamento | **expo-router ~56.2.11** (file-based, `src/app/`) |
| TypeScript | ~6.0.3 |

> **Falta instalar no app:** `expo-camera` (leitura de QR), `expo-video` (microvídeo vertical) e um cliente HTTP/estado (axios ou fetch + um store leve). Confirmar versões compatíveis com Expo 56 na doc oficial.

---

## 4. Comandos

### Backend (`CapaciTO_API`)
```bash
cd ../CapaciTO_API
./mvnw spring-boot:run          # sobe a API (porta padrão 8080)
./mvnw clean package            # build + testes
./mvnw test                     # só testes
# Flyway roda automaticamente no boot; migrations em src/main/resources/db/migration
# Console H2 (após habilitar): http://localhost:8080/h2-console
```

### App (`CapaciTO` — este repo)
```bash
npm install
npm run start        # Expo dev server (QR para Expo Go / dev build)
npm run android      # abre no Android
npm run ios          # abre no iOS
npm run web          # abre no navegador
npm run lint
```
> Para escanear QR de verdade e usar câmera/vídeo nativo, use **dev build** ou device físico (a câmera não funciona no web).

---

## 5. Convenções de código

### Backend
- **Camadas:** `Controller` (só HTTP/DTO) → `Service` (regra de negócio, `@Transactional`) → `Repository` (Spring Data). Controller nunca acessa repository direto.
- **REST versionado:** todos os endpoints sob **`/api/v1/...`**. Recursos no plural (`/api/v1/vagas`, `/api/v1/certificacoes`).
- **DTOs:** entrada/saída via `record` DTO + Bean Validation (`@NotNull`, `@Email`, `@Min`…). **Nunca** expor entidade JPA direto no JSON.
- **Auth:** JWT no header `Authorization: Bearer <token>`. Autorização por papel com `@PreAuthorize("hasRole('INDUSTRIA')")` etc. Papéis: `TRABALHADOR`, `INDUSTRIA`, `ADMIN`.
- **Senhas:** sempre `BCryptPasswordEncoder`. Nunca logar/retornar `senha_hash`.
- **Erro padronizado:** `@RestControllerAdvice` global retornando JSON uniforme:
  ```json
  { "timestamp": "...", "status": 422, "error": "Unprocessable Entity",
    "code": "RN09_IDADE_MINIMA", "message": "Trabalhador deve ter 18 anos ou mais", "path": "/api/v1/usuarios" }
  ```
  Use `code` para regras de negócio violadas (mapeia direto pra RN01–RN10).
- **Nomenclatura:** classes `PascalCase`; entidades = substantivo singular (`Certificacao`); tabelas/colunas `snake_case` (`data_emissao`); enums em MAIÚSCULA.
- **Migrations:** `V<n>__descricao_snake.sql` (ex.: `V1__schema_inicial.sql`, `V2__seed_competencias.sql`). **Nunca editar migration já aplicada** — crie a próxima versão.

### App
- **Nomes de arquivo:** `kebab-case.tsx` (padrão do template). Componentes `PascalCase`.
- **Rotas:** file-based em `src/app/`. Agrupar por papel quando fizer sentido (ex.: telas de indústria vs. trabalhador).
- **Estilo/tema:** reutilizar `ThemedText`, `ThemedView`, `Spacing` de `src/constants/theme.ts`. Mobile-first, PT-BR, ícones grandes, alto contraste (RNF01/RNF09).
- **API base URL** em um único lugar (config/env) — apontando para `http://<ip-da-máquina>:8080/api/v1` em dev (não use `localhost` no device físico).

---

## 6. Modelo de dados (resumo — seção 8 da spec)
Entidades e relações-chave:

- **Usuario** (nome, email, telefone, senha_hash, papel, data_criacao) — base de auth.
- **PerfilTrabalhador** (1–1 Usuario) — foto, cidade, data_nascimento, funcoes_interesse, **visivel**, **completude%**.
- **Empresa** (1–1 Usuario papel INDUSTRIA) — nome, segmento, municipio.
- **Competencia** — catálogo (nome, descricao).
- **Conteudo** — titulo, tipo (MICROVIDEO/TRILHA), url_video, **competencia_id**, duracao.
- **Estacao** (N–1 Empresa) — nome, **conteudo_id** (procedimento vigente), **codigo_qr**.
- **Conclusao** (N–1 Trabalhador, N–1 Conteudo) — origem (CATALOGO/QR/ESTACAO), resultado_quiz, data_hora.
- **Certificacao** (N–1 Trabalhador, N–1 Competencia) — data_emissao, data_validade, status (ATIVA/EXPIRADA).
- **Vaga** (N–1 Empresa) — funcao, municipio, **competencias_obrigatorias**, competencias_desejaveis, status.
- **Candidatura** (N–1 Vaga, N–1 Trabalhador) — data, status.

Fluxo central: `Conclusao` (de um Conteudo ligado a uma Competencia) → gera `Certificacao` ATIVA → aparece no `PerfilTrabalhador` → entra no **match** de `Vaga` (RN05).

---

## 7. As 10 regras de negócio (RN01–RN10) — checklist obrigatório
Todo código que toca esses fluxos DEVE respeitar:

- [ ] **RN01** — Certificação só emite após concluir o treino **e** passar na verificação rápida (quando houver).
- [ ] **RN02** — Certificação é vinculada automaticamente ao perfil e **não** editável manualmente pelo trabalhador.
- [ ] **RN03** — Certificação vencida = status `EXPIRADA`; **não** conta no match de vagas.
- [ ] **RN04** — 1 QR = 1 estação + procedimento **vigente**; atualizar procedimento mantém o mesmo QR apontando pra versão nova.
- [ ] **RN05** — Trabalhador só é compatível com a vaga se tiver **todas** as competências obrigatórias (ATIVAS). Desejáveis só melhoram a ordenação.
- [ ] **RN06** — Perfil só visível à indústria se `visivel = true` (consentimento LGPD).
- [ ] **RN07** — Estação/vaga/conteúdo pertencem a **uma** empresa; indústria só vê/gerencia o que é seu.
- [ ] **RN08** — Só INDUSTRIA publica vaga/cadastra estação; só TRABALHADOR se certifica/se candidata.
- [ ] **RN09** — Cadastro de trabalhador exige **idade ≥ 18** (validar data_nascimento).
- [ ] **RN10** — Conclusão é única por (trabalhador, versão de conteúdo); reapresentar não gera nova certificação, só atualiza último acesso.

---

## 8. A "fatia que roda ao vivo" — PRIORIDADE MÁXIMA
**QR → microvídeo → certificação aparecendo no perfil.**

Esta jornada é o que será demonstrado ao vivo e protege as notas de **Qualidade do protótipo (15)** e **Viabilidade (20)**. Ela **não pode quebrar**.

**Cenário da demo (pescado):** o trabalhador chega na estação da **câmara fria** do frigorífico de pescado, escaneia o QR → abre o microvídeo *"Como agir na câmara fria"* → conclui → a competência **"Segurança em câmara fria"** aparece na carteira → uma vaga de pescado que exige essa competência passa a dar match.

Caminho mínimo de ponta a ponta:

1. App: trabalhador logado **escaneia QR** de uma estação (RF17).
2. Backend: resolve `codigo_qr` → `Estacao` → `Conteudo` vigente (RN04).
3. App: **abre o microvídeo vertical** da estação e reproduz (RF11).
4. App→Backend: ao concluir (+ microquiz se houver), registra **Conclusao** (RF18, RN01/RN10).
5. Backend: emite **Certificacao** ATIVA da competência ligada ao conteúdo (RF20).
6. App: certificação **aparece automaticamente no perfil/carteira** (RF21, RN02).

> Toda decisão de escopo, corte ou priorização passa por: "isso protege ou ameaça a fatia ao vivo?". O resto pode ser mock.

---

## 9. Funcional vs. mockado (seção 2 da spec)
| Camada | Funcional na demo | Mock/navegável |
|---|---|---|
| Perfil | Exibe competências certificadas | Edição completa |
| Aprendizagem | Reproduz 1–2 microvídeos próprios | Catálogo completo de trilhas; PDF |
| QR Just-in-Time | Escanear → abrir procedimento → concluir | Cadastro de estações pela empresa |
| Certificação | Competência surge no perfil após concluir | Histórico/validade; offline |
| Vagas | Tela de vagas + match por certificação | Candidatura completa; chat; verificação 3º |

---

## 10. Restrições do hackathon
- **Sem hardware** — nada de dispositivos físicos especiais; só smartphone + câmera.
- **Mobile-first** — o público usa celular Android no chão de fábrica.
- **Baixa escolaridade** — UI simples, visual, com ícones e linguagem clara; PT-BR (RNF01/RNF09).
- **Conexão precária** — telas-chave devem tolerar rede instável; cache do conteúdo já carregado (RNF02).
- **LGPD** — consentimento, finalidade específica, controle de visibilidade e remoção de dados (RNF05/RN06).
- **Conteúdo de vídeo próprio** — nada de marca/conteúdo de terceiros (TikTok, etc.) → risco de **desclassificação**. Gravar microvídeos próprios (ex.: higienização de mãos, recepção de pescado).

---

## 11. Definition of Done (por tarefa)
Uma tarefa só está "pronta" quando:
- [ ] **Compila / builda** sem erro (`./mvnw package` no backend; app sobe no Expo sem crash).
- [ ] Se mexeu no schema: **migration Flyway versionada** criada e aplicando limpo do zero.
- [ ] Endpoint **testável** (documentado: método, rota `/api/v1/...`, body, resposta) — verificável via curl/Postman ou tela do app.
- [ ] **Respeita as RN aplicáveis** (checklist da seção 7) e autorização por papel.
- [ ] Não quebra a **fatia que roda ao vivo** (seção 8).
- [ ] Sem segredos/credenciais hardcoded; sem expor `senha_hash`.

---

## 12. Divisão de trabalho (3 desenvolvedores: 1 back + 2 front)
- **Dev Back — `CapaciTO_API`:** schema Flyway, auth/JWT/papéis, services de domínio, endpoints `/api/v1`, seed de dados, regras RN.
- **Dev F1 — App, trilha Capacitação & Certificação (`CapaciTO`):** dono da **fatia ao vivo** — auth, carteira/perfil, catálogo/busca de cursos, player de microvídeo, scanner QR → vídeo → conclusão → certificação.
- **Dev F2 — App, trilha Conexão, Indústria & Fundação:** design system + shell de navegação por papel + `lib/api` (mock-first), telas da indústria (estação/QR, publicar vaga, buscar por certificação), vagas compatíveis + match.
- **Contrato de integração:** a API REST `/api/v1` é a fronteira. O front trabalha **mock-first** (`src/lib/api`) e vira para a API real conforme o backend entrega. Endpoints da fatia ao vivo (`/auth/login`, `/estacoes/qr/{codigo}`, `/conclusoes`, `/perfil/me`) têm prioridade de contrato.
- **Convivência F1/F2 no mesmo repo:** propriedade de pastas (route groups + `components/`), branches por trilha, merges pequenos e frequentes.
- Plano completo do front (trilhas, milestones, sync points) em [ROADMAP.md](ROADMAP.md).
