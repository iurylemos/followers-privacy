# Implementation Plan: Seguir Criadora

**Branch**: `001-seguir-criadora` | **Date**: 2026-10-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification derived from the user-provided implementation-plan document.

## Summary

Construir uma aplicação web local para que uma pessoa use um identificador demonstrativo para
seguir ou deixar de seguir uma criadora e consulte a contagem e o estado persistidos. A solução
terá uma interface React, API REST Express e SQLite como fonte de verdade. A unicidade será
garantida pela chave composta no banco; a interface exibirá sucesso somente após confirmação da
API. O escopo fica limitado a uma página e uma criadora demonstrativa, sem autenticação real,
cadastro ou administração.

## Technical Context

**Language/Version**: TypeScript 7.0.x com `strict: true`; Node.js 24.x LTS (mínimo 24.15).

**Primary Dependencies**: React 19, Vite 8, Tailwind CSS 4 com `@tailwindcss/vite`; Express 5,
Zod 4, `better-sqlite3` 13; Vitest 5, Supertest 7.x e `user-event` 14.

**Storage**: SQLite em arquivo local configurável por `DATABASE_PATH`; banco isolado em memória
nos testes.

**Testing**: TDD Red-Green-Refactor obrigatório nas regras e camadas do backend com Vitest;
Supertest para integração HTTP; Vitest com `user-event` para testes por componente;
Agent Browser para validação integrada complementar.

**Target Platform**: Aplicação local Node.js 24 LTS e navegadores modernos, incluindo viewport
móvel a partir de 320 px.

**Project Type**: Aplicação web full-stack com workspaces npm independentes para frontend e
backend.

**Performance Goals**: Nenhuma meta arbitrária de throughput ou latência. Operações síncronas de
SQLite permanecem curtas e adequadas ao uso local demonstrativo.

**Constraints**:

- Uma criadora demonstrativa (`creator-1`), configurada de forma consistente em cliente e servidor.
- `userId` é identificador de demonstração, não prova de identidade nem autorização.
- IDs aceitam somente `[A-Za-z0-9_-]{1,64}`; toda entrada externa é validada.
- API usa SQL parametrizado e erros não expõem detalhes internos.
- CORS aceita somente a origem configurada; ambiente e exemplos não contêm segredos reais.
- Sem autenticação real, ORM, microsserviços, estado global, Docker ou dependências não justificadas.
- TypeScript 7 passa por smoke test estrito de compilação e compatibilidade das ferramentas antes
  de ser fixado; usar TypeScript 6.x/5.x se houver bloqueio confirmado.

**Scale/Scope**: Uma página, uma criadora, um identificador demonstrativo por interação e quatro
operações: seguir, deixar de seguir, consultar contagem e consultar o estado do seguimento.

## Constitution Check

**Gate inicial — antes da Fase 0**: aprovado. As escolhas propostas não conflitam com os sete
princípios; decisões sobre comportamento ambíguo estão registradas em
[`PROMPTS.md`](../../PROMPTS.md) e na especificação.

| Princípio                                    | Verificação no plano                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| I. Simplicidade com Responsabilidade Técnica | Uma aplicação local e dois workspaces; sem serviços externos, ORM ou infraestrutura adicional.                            |
| II. Integridade e Consistência dos Dados     | SQLite é fonte de verdade; chave composta impede duplicidade; respostas refletem persistência.                            |
| III. Separação de Responsabilidades          | Rotas adaptam HTTP, serviços aplicam regras, repositório acessa SQLite; interface usa serviço HTTP próprio.               |
| IV. Testabilidade e Qualidade Verificável    | Testes HTTP verificam estado persistido; interface e erros são cobertos com dados isolados.                               |
| V. Segurança por Padrão                      | Validação Zod, SQL parametrizado, CORS configurado e erros sem detalhes internos; identificador de cliente não autentica. |
| VI. Experiência do Usuário e Acessibilidade  | Estados claros, confirmação após API, semântica e teclado; contraste WCAG 2.2 AA.                                         |
| VII. Documentação e Reprodutibilidade        | README, PROMPTS, spec, plano, contrato e quickstart acompanham decisões e comandos.                                       |

## Design Decisions

### Organização

O projeto será greenfield: o repositório possui somente documentação e um `package.json` inicial,
sem código de aplicação ou testes existentes. Serão criados workspaces `frontend` e `backend`,
gerenciados por npm e pelo lockfile da raiz. A verificação da toolchain (instalação, compilação
estrita e testes vazios/iniciais) antecederá o desenvolvimento funcional.

### Backend

- `app.ts` constrói e exporta a aplicação Express sem abrir porta; `server.ts` configura o
  listener somente para execução normal. Isso permite Supertest usar porta efêmera.
- A API seguirá **Layered Architecture** com fronteiras pequenas e explícitas:
  - **Presentation / HTTP**: rotas, controller e middleware traduzem HTTP para chamadas da aplicação.
  - **Application**: `FollowersService` coordena os casos de uso e não depende de Express ou SQLite.
  - **Domain**: contrato mínimo do repositório e regras do domínio; não contém detalhes de HTTP/SQL.
  - **Infrastructure**: implementação SQLite do repositório, conexão e migração.
- Neste contexto, “design system” do backend é entendido como arquitetura de software em camadas,
  não como biblioteca visual.
- `FollowersController` e `FollowersService` serão classes; `SQLiteFollowersRepository` será uma
  classe que implementa o contrato `FollowersRepository`. A composição injeta o repositório no
  serviço e o serviço no controller.
- Rotas validam path/body com schemas Zod e conectam o controller; o controller converte entradas
  e resultados em status/respostas HTTP, sem SQL ou regras de negócio.
- Um middleware central converte erros esperados em respostas estáveis e falhas inesperadas em
  erro genérico sem stack trace na resposta.
- SOLID será aplicado pragmaticamente: responsabilidade única por camada, inversão de dependência
  no serviço/repositório e contratos pequenos. Não serão criadas interfaces, subclasses ou classes
  apenas para seguir um padrão sem benefício verificável.
- `POST /creators/:creatorId/followers` recebe `userId`; retorna `201` ao criar e `200` quando a
  relação já existia, sempre com estado e contagem finais.
- `DELETE /creators/:creatorId/followers/:userId` retorna `200` com estado não seguido e contagem,
  mesmo se a relação já não existia.
- `GET /creators/:creatorId/followers/count` retorna a contagem derivada do SQLite.
- `GET /creators/:creatorId/followers/:userId` restaura o estado do botão.
- A rota estática `/followers/count` será registrada antes da rota `/followers/:userId`.
- Criação e contagem de resposta são agrupadas em transação síncrona quando necessário. Nenhum
  callback de transação fará I/O assíncrono.

### Persistência

SQLite mantém `creator_followers(creator_id, user_id, created_at)` com chave primária composta
`(creator_id, user_id)`. Uma migração versionada inicializa o esquema. Inserções usam conflito
composto como no-op; exclusões são naturalmente idempotentes. A contagem não é duplicada em uma
coluna mutável. O uso de WAL fica fora do escopo sem evidência de necessidade.

### Frontend e acessibilidade

O frontend seguirá **Atomic Design**: atoms (controles acessíveis), molecules (combinações pequenas),
organisms (blocos funcionais da página) e templates (estrutura visual da página). `FollowersPage`
coordena dados e estado; `FollowersTemplate` recebe propriedades e apresenta o layout sem acessar
diretamente a API.

Cada componente público terá uma pasta com implementação em `index.tsx`, exportações nomeadas e
teste de componente em `index.test.tsx`, por exemplo:
`frontend/src/components/templates/FollowersTemplate/index.tsx` e
`frontend/src/components/templates/FollowersTemplate/index.test.tsx`. Os testes exercitam o
contrato observável do componente com Vitest e `user-event`, sem snapshots como
única evidência. Os elementos visuais permanecem testáveis sem inicializar a aplicação completa.

O cliente HTTP será uma classe `FollowersService` em
`frontend/src/services/followers.service.ts`, injetável/testável sem rede real. Um hook React
coordena carregamento e estado da página; componentes React e hooks serão funções, seguindo o
modelo idiomático do React e sua API de hooks. A preferência por classes será aplicada às
responsabilidades de serviço/domínio, não forçada a componentes ou hooks.

Os componentes usam HTML semântico, labels acessíveis, foco perceptível, feedback anunciável e
estados de carregamento/erro. O tema Tailwind 4 é CSS-first e o layout será mobile-first a partir
de 320 px.

### Validação

- Backend em TDD: para cada regra, escrever primeiro teste que falha, implementar o mínimo para
  passar e refatorar sem regressões. Combinar testes unitários do serviço com repositório fake,
  integração do repositório com SQLite em memória e testes HTTP Supertest verificando contrato e
  estado persistido.
- Frontend: manter `index.test.tsx` junto de cada componente atômico exportado; cobrir props,
  acessibilidade e interações relevantes. Cobrir também carga da página, transições, falha da API,
  identificador trocado e navegação por teclado.
- Integração: Agent Browser percorre o fluxo principal, atualiza a página e verifica viewport
  móvel; não substitui testes automatizados.
- O plano de implementação posterior deve definir `design-system.md` antes de construir a UI.

## Project Structure

### Documentation (this feature)

```text
specs/001-seguir-criadora/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── openapi.yaml
```

`tasks.md` será criado pela etapa `/speckit-tasks`, não por este plano.

### Source Code (repository root)

```text
.
├── backend/
│   ├── src/
│   │   ├── presentation/http/
│   │   │   ├── controllers/followers.controller.ts
│   │   │   ├── routes/followers.routes.ts
│   │   │   ├── schemas/followers.schema.ts
│   │   │   └── middleware/error-handler.middleware.ts
│   │   ├── application/services/followers.service.ts
│   │   ├── domain/repositories/followers.repository.ts
│   │   ├── infrastructure/persistence/
│   │   │   ├── sqlite/sqlite-followers.repository.ts
│   │   │   ├── database.connection.ts
│   │   │   └── migrations/001-create-followers.sql
│   │   ├── config/env.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   │   ├── unit/followers.service.test.ts
│   │   ├── integration/sqlite-followers.repository.test.ts
│   │   └── contract/followers.api.test.ts
│   ├── package.json
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/
│   │   │   │   ├── FollowButton/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── index.test.tsx
│   │   │   │   ├── StatusMessage/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── index.test.tsx
│   │   │   │   └── UserIdInput/
│   │   │   │       ├── index.tsx
│   │   │   │       └── index.test.tsx
│   │   │   ├── molecules/
│   │   │   │   ├── FollowerCount/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── index.test.tsx
│   │   │   │   └── FollowControl/
│   │   │   │       ├── index.tsx
│   │   │   │       └── index.test.tsx
│   │   │   ├── organisms/
│   │   │   │   └── FollowersCard/
│   │   │   │       ├── index.tsx
│   │   │   │       └── index.test.tsx
│   │   │   └── templates/
│   │   │       └── FollowersTemplate/
│   │   │           ├── index.tsx
│   │   │           └── index.test.tsx
│   │   ├── pages/FollowersPage/
│   │   │   ├── index.tsx
│   │   │   └── index.test.tsx
│   │   ├── services/followers.service.ts
│   │   ├── hooks/use-followers.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles/globals.css
│   ├── tests/
│   │   └── pages/FollowersPage/index.test.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── .env.example
├── design-system.md
├── PROMPTS.md
├── README.md
├── package.json
└── package-lock.json
```

**Structure Decision**: Dois workspaces isolam responsabilidades de frontend e backend sem
introduzir serviços independentes. O backend separa apresentação, aplicação, domínio e
infraestrutura; o frontend separa componentes em atoms, molecules, organisms e templates. Cada
componente público tem sua pasta `index.tsx` e teste `index.test.tsx`. Os nomes por responsabilidade
(`.service.ts`, `.controller.ts`, `.repository.ts`, `.routes.ts`) tornam a camada explícita.
Componentes e classes adicionais só serão criados quando tiverem responsabilidade concreta.

## Constitution Check — Post-Design

**Gate após a Fase 1**: aprovado, sem exceções.

- Integridade: unicidade no esquema, consultas derivadas do banco e operações repetíveis cobertas
  no contrato e no modelo.
- Responsabilidades: HTTP, regra de negócio, persistência e apresentação têm fronteiras explícitas
  e testáveis.
- Segurança: validação antes da persistência, parâmetros SQL vinculados, CORS restrito e erros
  genéricos; nenhum mecanismo de autenticação fora do escopo.
- UX e acessibilidade: a interface aguarda a confirmação da API e suporta teclado e viewport móvel.
- Evidência: quickstart e testes automatizados definem verificações reproduzíveis; o comando real
  dos scripts deverá ser confirmado quando os workspaces forem implementados.
- Documentação: a especificação e o contrato são consistentes com [`PROMPTS.md`](../../PROMPTS.md).

## Complexity Tracking

Nenhuma violação à Constituição foi identificada. As classes de serviço, controller e repositório
têm fronteiras distintas que permitem testar regras sem HTTP ou SQLite; funções continuam
apropriadas para composição do Express, callbacks e hooks/componentes React. SOLID orienta
responsabilidades e dependências, sem criar interfaces ou abstrações para cada método. Não haverá
ORM, estado global, microsserviços, autenticação ou infraestrutura de contêineres.
