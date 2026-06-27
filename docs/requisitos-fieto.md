# Plataforma de Qualificação e Conexão Profissional da Indústria de Alimentos do Tocantins

**Documento de requisitos — Desafio Industrial FIETO 2026 — Frente A (Mão de obra e qualificação)**

> Nome provisório. A ideia central: "o LinkedIn do trabalhador da indústria de alimentos do TO" — onde ele aprende, certifica suas competências e é encontrado pelas indústrias que precisam de mão de obra qualificada.

---

## 1. Visão geral

### 1.1 Problema
A indústria de alimentos do Tocantins (frigoríficos de pescado, laticínios, polpas de fruta, panificadoras) sofre com alta rotatividade, falta de mão de obra qualificada e dificuldade de comprovar treinamento em boas práticas e segurança alimentar para conformidade sanitária. O conhecimento certo não chega na hora certa ao trabalhador, e a empresa não consegue provar nem encontrar quem está qualificado.

### 1.2 Solução
Uma plataforma centrada no perfil do trabalhador (a "Carteira de Qualificação Digital"), que reúne quatro módulos em torno desse perfil:

1. **Aprendizagem** — microtreinamentos em vídeo curto (formato vertical) e trilhas completas.
2. **Treinamento Just-in-Time** — QR Code por estação de trabalho que abre o procedimento correto da tarefa.
3. **Certificação** — cada treino concluído valida uma competência no perfil.
4. **Vagas** — as indústrias encontram e contratam quem já está certificado.

O ciclo é: **aprende → certifica no perfil → é encontrado para a vaga → a indústria contrata gente qualificada.**

### 1.3 Correções em relação ao rascunho inicial
- A "carteira/perfil" é o coração do produto — os demais módulos existem para preencher ou consumir esse perfil (antes eram 6 funcionalidades soltas).
- Vagas deixa de ser um produto à parte e passa a ser o desfecho da certificação (evita virar "mais um portal de empregos genérico").
- Não há dependência do TikTok real — usa-se apenas o formato de vídeo curto, com conteúdo próprio (uso de marca/conteúdo de terceiros pode gerar desclassificação).
- Tudo ancorado na cadeia de alimentos do TO — treinamentos de manipulação, higiene e segurança alimentar, não treinamento genérico.

---

## 2. Escopo do MVP (contexto hackathon)

O regulamento permite que o protótipo seja apresentado por meio de fluxos e interfaces, sem desenvolvimento completo. A estratégia é entregar a história completa de ponta a ponta, com uma fatia rodando de verdade e o restante navegável/mockado.

| Camada | Entregar funcional (demo ao vivo) | Mockado / navegável | Visão futura |
|---|---|---|---|
| **Perfil (Carteira)** | Perfil exibindo competências certificadas | Edição completa | — |
| **Aprendizagem** | Reproduzir 1–2 microvídeos próprios | Catálogo completo de trilhas | Exportar PDF da carteira |
| **QR Just-in-Time** | Escanear QR → abrir procedimento → concluir | Cadastro de estações pela empresa | Recomendação personalizada |
| **Certificação** | Competência aparecendo no perfil após concluir | Histórico/validade | Modo offline completo |
| **Vagas** | Tela de vagas + match por certificação | Candidatura completa | Verificação por terceiros / Chat indústria-candidato |

**Fatia que roda de verdade na demo:** QR → microvídeo → certificação surgindo no perfil. É o trecho mais convincente e protege as notas de protótipo (15) e viabilidade (20).

---

## 3. Atores do sistema
- **Trabalhador** — cria seu perfil, assiste aos treinamentos, escaneia QR nas estações, acumula certificações e se candidata a vagas.
- **Indústria (empresa)** — perfil de gestor de RH e/ou responsável técnico; cadastra estações, procedimentos e conteúdos, publica vagas e busca candidatos certificados.
- **Administrador da plataforma** — gerencia usuários, conteúdos base e catálogo de competências (papel mínimo no MVP).

---

## 4. Arquitetura e stack
- **Aplicativo mobile:** React Native (app do trabalhador; a indústria acessa o mesmo app com papel diferenciado no MVP; painel web da empresa fica como evolução).
- **Backend / API:** Spring Boot 3.x sobre Java 21 (aproveitando virtual threads para I/O), Spring Web (REST), Spring Data JPA, Spring Security com JWT, Bean Validation.
- **Banco de dados:** H2 (embarcado), com versionamento de schema via Flyway. Por rodar dentro da própria aplicação, dispensa instalar e subir um servidor de banco — ideal para o ritmo das 48h e para a demo (pode iniciar em memória ou em arquivo).
- **Leitura de QR Code:** geração dos códigos no backend (um código por estação/procedimento); leitura via câmera no app (biblioteca de QR do React Native).
- **Conteúdo de vídeo:** no MVP, vídeos curtos servidos de armazenamento simples/CDN; em produção, object storage dedicado.
- **Padrão de API:** REST com JSON, autenticação por token JWT, versionada em `/api/v1`.

```
[ App React Native ]  (Trabalhador / Indústria)
        │  HTTPS / REST + JWT
        ▼
[ API Spring Boot 3 — Java 21 ]
Auth · Perfil · Aprendizagem · Estações/QR · Certificação · Vagas
        │  Spring Data JPA
        ▼
[ H2 embarcado ]  (+ Flyway migrations)
```

---

## 5. Requisitos funcionais (RF)
Prioridade pela técnica MoSCoW: M (Must), S (Should), C (Could).

### Módulo 1 — Autenticação e perfis de acesso
- **RF01 (M):** O sistema deve permitir cadastro de usuário como Trabalhador ou Indústria.
- **RF02 (M):** O sistema deve autenticar o usuário via e-mail/telefone e senha, retornando um token JWT.
- **RF03 (M):** O sistema deve restringir funcionalidades conforme o papel do usuário (Trabalhador, Indústria, Administrador).
- **RF04 (S):** O sistema deve permitir recuperação de senha.

### Módulo 2 — Perfil / Carteira de Qualificação Digital
- **RF05 (M):** O trabalhador deve poder criar e editar seu perfil (nome, foto, cidade, experiências, funções de interesse).
- **RF06 (M):** O perfil deve exibir a lista de competências certificadas do trabalhador.
- **RF07 (M):** O sistema deve calcular e exibir um indicador de completude/qualificação do perfil.
- **RF08 (S):** O trabalhador deve poder controlar a visibilidade do perfil para as indústrias (visível/oculto).
- **RF09 (C):** O sistema deve permitir exportar a carteira de qualificação em PDF.

### Módulo 3 — Aprendizagem (microvídeos e trilhas)
- **RF10 (M):** O sistema deve exibir um catálogo de conteúdos de treinamento da cadeia de alimentos (higiene, manipulação, segurança alimentar, boas práticas).
- **RF11 (M):** O trabalhador deve poder assistir a microvídeos em formato vertical curto.
- **RF12 (S):** O sistema deve organizar conteúdos em trilhas (sequências de vídeos sobre um tema).
- **RF13 (M):** O sistema deve registrar a conclusão de um conteúdo/trilha por um trabalhador.
- **RF14 (S):** Ao final de um conteúdo, o sistema deve aplicar uma verificação rápida (microquiz de 1–3 questões).

### Módulo 4 — Treinamento Just-in-Time via QR Code
- **RF15 (M):** A indústria deve poder cadastrar estações de trabalho e associar a cada uma um procedimento/conteúdo.
- **RF16 (M):** O sistema deve gerar um QR Code único por estação.
- **RF17 (M):** O trabalhador deve poder escanear o QR Code e abrir, na hora, o procedimento/vídeo correto daquela estação.
- **RF18 (M):** O sistema deve registrar que o trabalhador acessou e concluiu o procedimento da estação (quem, o quê, quando).
- **RF19 (C):** O conteúdo da estação deve ficar disponível para consulta offline após o primeiro acesso.

### Módulo 5 — Certificação e competências
- **RF20 (M):** O sistema deve emitir uma certificação (competência validada) ao trabalhador quando ele concluir o treinamento e a verificação correspondentes.
- **RF21 (M):** A certificação emitida deve passar a constar automaticamente no perfil do trabalhador.
- **RF22 (S):** Cada certificação deve registrar data de emissão e, quando aplicável, data de validade.
- **RF23 (C):** A indústria deve poder verificar a autenticidade de uma certificação de um candidato.

### Módulo 6 — Vagas e conexão com a indústria
- **RF24 (M):** A indústria deve poder publicar vagas, indicando função, local e competências exigidas.
- **RF25 (M):** O sistema deve associar (match) candidatos às vagas conforme as competências certificadas.
- **RF26 (M):** O trabalhador deve poder visualizar vagas compatíveis com seu perfil.
- **RF27 (S):** O trabalhador deve poder se candidatar a uma vaga.
- **RF28 (S):** A indústria deve poder buscar trabalhadores por competência certificada.

---

## 6. Requisitos não funcionais (RNF)
- **RNF01 — Usabilidade / inclusão:** interface mobile-first, simples e visual, adequada a usuários de baixa escolaridade; linguagem clara e ícones; idioma PT-BR.
- **RNF02 — Disponibilidade em campo:** os conteúdos de estação (QR + vídeo) devem tolerar conexão instável; acesso já carregado deve continuar utilizável (cache local), dado que a internet no chão de fábrica é precária.
- **RNF03 — Desempenho:** as principais telas (perfil, leitura de QR, abertura de vídeo) devem responder em até ~2 segundos em condições normais de rede.
- **RNF04 — Segurança:** autenticação via JWT, senhas armazenadas com hash forte (ex.: BCrypt), comunicação sobre HTTPS, autorização por papel.
- **RNF05 — Privacidade / LGPD:** o tratamento de dados pessoais deve observar a LGPD (Lei 13.709/2018), com consentimento, finalidade específica e possibilidade de o trabalhador controlar a visibilidade e remover seus dados. (O próprio regulamento do evento exige observância à LGPD.)
- **RNF06 — Portabilidade:** o app React Native deve rodar em Android (foco principal do público) e, idealmente, iOS.
- **RNF07 — Manutenibilidade:** código organizado em camadas (controller, service, repository), migrations versionadas (Flyway), API REST versionada.
- **RNF08 — Escalabilidade:** arquitetura preparada para crescer de uma indústria-piloto para várias, sem reescrita (multi-empresa no modelo de dados).
- **RNF09 — Acessibilidade:** contraste adequado, textos legíveis e suporte a áudio/legenda nos vídeos.
- **RNF10 — Observabilidade:** registro de logs das operações principais (acessos, conclusões, emissões de certificação) para auditoria de conformidade.

---

## 7. Regras de negócio (RN)
- **RN01:** Uma certificação só é emitida quando o trabalhador conclui o treinamento associado e é aprovado na verificação rápida (quando ela existir).
- **RN02:** Toda certificação emitida é vinculada automaticamente ao perfil do trabalhador e não pode ser editada manualmente por ele (integridade da carteira).
- **RN03:** Uma certificação com data de validade vencida deve ser exibida como "expirada" e não conta como competência ativa para match de vagas.
- **RN04:** Cada QR Code corresponde a exatamente uma estação e um procedimento/conteúdo vigente; ao atualizar o procedimento, o mesmo QR passa a apontar para a versão vigente.
- **RN05:** Um trabalhador só aparece como compatível com uma vaga se possuir todas as competências marcadas como obrigatórias naquela vaga (competências desejáveis aumentam a ordenação, mas não são exigidas).
- **RN06:** O perfil do trabalhador só fica visível para as indústrias se ele estiver com a visibilidade ativada (padrão a definir no onboarding, respeitando consentimento LGPD).
- **RN07:** Cada estação pertence a uma única indústria; uma indústria só enxerga e gerencia suas próprias estações, vagas e conteúdos.
- **RN08:** Apenas usuários com papel Indústria podem publicar vagas e cadastrar estações; apenas usuários com papel Trabalhador podem se certificar e se candidatar.
- **RN09:** O cadastro de trabalhador exige idade mínima de 18 anos.
- **RN10:** O registro de conclusão de um conteúdo é único por trabalhador e versão de conteúdo; reapresentar o mesmo conteúdo concluído não gera nova certificação, apenas atualiza o último acesso.

---

## 8. Modelo de dados (entidades principais)
- **Usuario** — id, nome, email, telefone, senha_hash, papel (TRABALHADOR/INDUSTRIA/ADMIN), data_criacao.
- **PerfilTrabalhador** — id, usuario_id, foto, cidade, data_nascimento, funcoes_interesse, visivel (bool), completude (%).
- **Empresa** — id, usuario_id, nome, segmento (pescado/laticínio/polpa/panificação), municipio.
- **Competencia** — id, nome, descricao (catálogo de competências da cadeia de alimentos).
- **Conteudo** — id, titulo, tipo (MICROVIDEO/TRILHA), url_video, competencia_id, duracao.
- **Estacao** — id, empresa_id, nome, conteudo_id (procedimento vigente), codigo_qr.
- **Conclusao** — id, trabalhador_id, conteudo_id, origem (CATALOGO/QR/ESTACAO), resultado_quiz, data_hora.
- **Certificacao** — id, trabalhador_id, competencia_id, data_emissao, data_validade, status (ATIVA/EXPIRADA).
- **Vaga** — id, empresa_id, funcao, municipio, competencias_obrigatorias, competencias_desejaveis, status.
- **Candidatura** — id, vaga_id, trabalhador_id, data, status.

**Relações-chave:** um Trabalhador acumula várias Conclusões e Certificações; uma Certificação referencia uma Competência; uma Estação aponta para um Conteúdo; uma Vaga exige Competências e é correspondida (match) às Certificações ativas dos trabalhadores.

---

## 9. Mapeamento nos critérios de avaliação

| Critério | Peso | Como o projeto pontua |
|---|---|---|
| **Aderência ao desafio** | 25 | Frente A (mão de obra) ancorada na indústria de alimentos do TO; cobre atração, capacitação, segurança e retenção. |
| **Viabilidade e aplicabilidade** | 20 | Sem hardware; MVP com fatia real + telas mockadas (permitido pelo regulamento); stack madura. |
| **Inovação** | 15 | Une microtreino, QR just-in-time e um "LinkedIn da área" num ciclo até o emprego — diferente de um app de treinamento comum. |
| **Qualidade do protótipo** | 15 | Fatia QR → vídeo → certificação no perfil rodando ao vivo. |
| **Modelo de negócio e impacto** | 15 | SaaS para indústrias + impacto social (empregabilidade) e sanitário (conformidade). |
| **Qualidade do pitch** | 10 | História clara do ciclo aprende → certifica → é contratado. |

---

## 10. Próximos passos sugeridos
1. Detalhar os endpoints da API (contratos REST por módulo).
2. Modelar o banco em DDL/Flyway a partir da seção 8.
3. Definir as 1–2 telas que rodam ao vivo e prototipar as demais (navegáveis).
4. Produzir 2 microvídeos próprios de exemplo (ex.: higienização de mãos, recepção de pescado).
5. Montar o roteiro de pitch de 5 minutos com a demo ao vivo no centro.

---

*Documento de requisitos — Desafio Industrial FIETO 2026 — Frente A. Stack: Spring Boot 3 / Java 21, React Native, H2 (embarcado).*
