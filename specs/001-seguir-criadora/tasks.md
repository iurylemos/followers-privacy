# Tasks: Seguir Criadora

**Input**: Documentos de design em `/specs/001-seguir-criadora/`

**Pré-requisitos**: `plan.md` e `spec.md`; também foram considerados `research.md`, `data-model.md`, `contracts/openapi.yaml` e `quickstart.md`.

**Testes**: Incluídos porque `spec.md` exige cobertura automatizada em FR-016 e `plan.md` exige TDD no backend.

**Organização**: Tarefas de implementação agrupadas por história de usuário, em ordem de prioridade.

## Phase 1: Setup

**Objetivo**: Preparar os workspaces, a toolchain e as convenções visuais antes das funcionalidades.

- [X] T001 Criar o workspace npm da raiz e os scripts comuns em `package.json` e `package-lock.json`
- [X] T002 Configurar os workspaces `backend` e `frontend`, TypeScript estrito e runners de teste em `backend/package.json`, `backend/tsconfig.json`, `backend/vitest.config.ts`, `frontend/package.json`, `frontend/tsconfig.json` e `frontend/vite.config.ts`
- [X] T003 [P] Definir tokens, tipografia, componentes e regras mobile-first antes de implementar a interface em `design-system.md`

## Phase 2: Foundational

**Objetivo**: Implementar os pré-requisitos compartilhados que bloqueiam todas as histórias.

- [X] T004 [P] Escrever testes para IDs, criadora configurada e variáveis de ambiente em `backend/tests/unit/followers.schema.test.ts`
- [X] T005 [P] Escrever testes para migração, inicialização repetível e banco SQLite isolado em `backend/tests/integration/sqlite-followers.repository.test.ts`
- [X] T006 Implementar configuração de ambiente e validação compartilhada de identificadores, incluindo `creator-1` e `^[A-Za-z0-9_-]{1,64}$`, em `backend/src/config/env.ts`, `backend/src/presentation/http/schemas/followers.schema.ts` e `.env.example`
- [X] T007 Implementar conexão SQLite e migração versionada da tabela `creator_followers`, com chave primária `(creator_id, user_id)` e `created_at` UTC, em `backend/src/infrastructure/persistence/database.connection.ts` e `backend/src/infrastructure/persistence/migrations/001-create-followers.sql`
- [X] T008 Configurar tratamento central de erros sem stack trace, composição Express e inicialização do servidor em `backend/src/presentation/http/middleware/error-handler.middleware.ts`, `backend/src/app.ts` e `backend/src/server.ts`

**Checkpoint**: Workspaces, validação comum, persistência inicial e composição da aplicação prontos.

## Phase 3: User Story 1 - Seguir ou deixar de seguir a criadora (Priority: P1) 🎯 MVP

**Goal**: Permitir que um visitante com identificador válido crie ou remova a relação, com unicidade e confirmação após persistência.

**Independent Test**: Com banco isolado vazio, seguir cria exatamente uma relação; repetir não duplica nem aumenta novamente a contagem; deixar de seguir remove a relação e repetir a remoção mantém estado e contagem corretos.

### Tests for User Story 1

- [X] T009 [P] [US1] Escrever testes unitários para criação, remoção, repetição e remoção inexistente antes da implementação em `backend/tests/unit/followers.service.test.ts`
- [X] T010 [P] [US1] Escrever testes de integração SQLite para chave composta, persistência e operações idempotentes em `backend/tests/integration/sqlite-followers.repository.test.ts`
- [X] T011 [P] [US1] Escrever testes de contrato HTTP para `POST /creators/{creatorId}/followers` e `DELETE /creators/{creatorId}/followers/{userId}`, incluindo status e formato de resposta, em `backend/tests/contract/followers.api.test.ts`
- [X] T012 [P] [US1] Escrever teste da interação de seguir/deixar de seguir, verificando que a interface só muda após confirmação da API, em `frontend/src/pages/FollowersPage/index.test.tsx`

### Implementation for User Story 1

- [X] T013 [US1] Definir o contrato do repositório e implementar inserção sem duplicidade e remoção idempotente com SQL parametrizado em `backend/src/domain/repositories/followers.repository.ts` e `backend/src/infrastructure/persistence/sqlite/sqlite-followers.repository.ts`
- [X] T014 [US1] Implementar os casos de uso de seguir e deixar de seguir, retornando estado final e contagem persistida em `backend/src/application/services/followers.service.ts`
- [X] T015 [US1] Implementar controller e rotas POST/DELETE conforme os status e schemas de `contracts/openapi.yaml` em `backend/src/presentation/http/controllers/followers.controller.ts` e `backend/src/presentation/http/routes/followers.routes.ts`
- [X] T016 [US1] Implementar chamadas HTTP e fluxo de seguir/deixar de seguir na página, aguardando resposta confirmada antes de atualizar o estado em `frontend/src/services/followers.service.ts`, `frontend/src/hooks/use-followers.ts` e `frontend/src/pages/FollowersPage/index.tsx`

**Checkpoint**: Validar isoladamente a criação, repetição e remoção de relações no backend e no fluxo principal da interface.

## Phase 4: User Story 2 - Consultar seguidores e estado do seguimento (Priority: P2)

**Goal**: Apresentar a contagem persistida e recuperar o estado de seguimento ao carregar a página ou trocar o identificador.

**Independent Test**: Preparar relações em banco isolado; confirmar contagem zero e positiva, estado seguido/não seguido e recuperação após recarregar ou alterar o identificador.

### Tests for User Story 2

- [X] T017 [US2] Escrever testes de contrato para `GET /creators/{creatorId}/followers/count` e `GET /creators/{creatorId}/followers/{userId}`, incluindo contagem zero e identificadores inválidos, em `backend/tests/contract/followers.api.test.ts`
- [X] T018 [US2] Escrever testes da interface para carregamento inicial, atualização da contagem e troca de identificador com estado recuperado da API em `frontend/src/pages/FollowersPage/index.test.tsx`

### Implementation for User Story 2

- [X] T019 [US2] Implementar consultas SQLite parametrizadas de existência e `COUNT(*)`, derivando os valores dos registros persistidos em `backend/src/infrastructure/persistence/sqlite/sqlite-followers.repository.ts`
- [X] T020 [US2] Expor os casos de consulta de contagem e estado nos serviços, controller e rotas; registrar `/followers/count` antes de `/:userId` em `backend/src/application/services/followers.service.ts`, `backend/src/presentation/http/controllers/followers.controller.ts` e `backend/src/presentation/http/routes/followers.routes.ts`
- [X] T021 [US2] Integrar consultas de contagem e estado ao carregamento inicial e à troca de identificador na interface em `frontend/src/services/followers.service.ts`, `frontend/src/hooks/use-followers.ts` e `frontend/src/pages/FollowersPage/index.tsx`

**Checkpoint**: Confirmar que a interface exibe somente valores retornados pela API e que esses valores correspondem ao banco após recarga.

## Phase 5: User Story 3 - Receber feedback acessível e previsível (Priority: P3)

**Goal**: Comunicar carregamento, sucesso e erro sem simular persistência, e permitir operar os controles principais por teclado.

**Independent Test**: Simular espera e falha da API; verificar estados anunciáveis, ausência de sucesso antecipado, foco perceptível e operação completa por teclado.

### Tests for User Story 3

- [X] T022 [P] [US3] Escrever testes de componente para labels, semântica, foco, teclado e estados inválido/carregando em `frontend/src/components/atoms/UserIdInput/index.test.tsx` e `frontend/src/components/atoms/FollowButton/index.test.tsx`
- [X] T023 [P] [US3] Escrever testes para mensagens acessíveis de sucesso/erro e apresentação da contagem em `frontend/src/components/atoms/StatusMessage/index.test.tsx` e `frontend/src/components/molecules/FollowerCount/index.test.tsx`
- [X] T024 [US3] Escrever testes de integração da página para falha de rede, resposta inválida, mensagens anunciáveis e ausência de alteração não confirmada em `frontend/src/components/templates/Followers/index.test.tsx`

### Implementation for User Story 3

- [X] T025 [US3] Implementar controles com labels, identificação programática, foco visível e validação acessível do identificador em `frontend/src/components/atoms/UserIdInput/index.tsx` e `frontend/src/components/atoms/FollowButton/index.tsx`
- [X] T026 [US3] Implementar mensagens de carregamento, sucesso e erro anunciáveis sem comunicar sucesso antes da resposta confirmada em `frontend/src/components/atoms/StatusMessage/index.tsx` e `frontend/src/hooks/use-followers.hook.tsx`
- [X] T027 [US3] Integrar controles acessíveis e layout mobile-first a partir de 320 px no template e estilos globais em `frontend/src/components/templates/Followers/index.tsx` e `frontend/src/styles/globals.css`

**Checkpoint**: Validar falhas simuladas e concluir os fluxos principais usando apenas teclado, incluindo viewport móvel.

## Phase 6: Polish & Cross-Cutting Concerns

**Objetivo**: Documentar e validar o uso integrado sem expandir o escopo de uma página e uma criadora demonstrativa.

- [X] T028 [P] Documentar pré-requisitos, workspaces, configuração local e comandos de execução/teste em `README.md`
- [X] T029 [P] Atualizar decisões e limites do desafio, incluindo que `userId` não autentica nem autoriza, em `PROMPTS.md`
- [X] T030 [P] Ajustar os passos e resultados esperados do fluxo completo para refletir API, frontend e comandos reais em `specs/001-seguir-criadora/quickstart.md`
- [X] T031 Executar os testes automatizados de backend e frontend e percorrer os cenários do quickstart, incluindo recarga e viewport móvel, conforme `specs/001-seguir-criadora/quickstart.md`
- [X] T032 Alinhar a resposta de contagem ao enunciado (`creatorId` e `count`) no backend, frontend, testes, contrato e documentação.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências; prepara workspaces e design visual.
- **Foundational (Phase 2)**: Depende de Setup e bloqueia todas as histórias.
- **User Stories (Phases 3–5)**: Começam após Foundational e seguem a prioridade P1 → P2 → P3.
- **Polish (Phase 6)**: Depende das histórias que serão entregues e da implementação integrada.

### User Story Dependencies

- **US1 (P1)**: Depende de Foundational; independente das demais histórias e entrega o MVP.
- **US2 (P2)**: Depende de Foundational. As consultas do backend podem ser desenvolvidas em paralelo com US1; a integração na página usa o serviço e a estrutura de página criados em US1.
- **US3 (P3)**: Depende de Foundational. Os testes e componentes acessíveis podem ser preparados separadamente; integrar feedback ao fluxo de página pressupõe os fluxos de US1 e US2.

### Parallel Opportunities

- **Setup**: T003 pode ocorrer em paralelo com T001–T002, pois altera `design-system.md`.
- **Foundational**: T004 e T005 são testes em arquivos distintos e podem ser escritos em paralelo; T006–T008 dependem dos contratos e testes aplicáveis.
- **US1**: T009–T012 podem ser escritos em paralelo, pois cobrem arquivos de teste diferentes. Após a etapa de testes, implementação de repositório, serviço, API e interface segue as dependências entre camadas.
- **US2**: T017 e T018 podem ser escritos em paralelo. O desenvolvimento das consultas e da interface depende dos contratos e do repositório já estabelecidos.
- **US3**: T022 e T023 podem ser escritos em paralelo; T024 verifica o comportamento integrado antes dos ajustes de implementação.
- **Polish**: T028–T030 podem ser atualizados em paralelo por tratarem arquivos diferentes; T031 requer a implementação integrada.

### Parallel Example: User Story 1

```text
Em paralelo, antes da implementação:
T009: testes unitários em backend/tests/unit/followers.service.test.ts
T010: testes SQLite em backend/tests/integration/sqlite-followers.repository.test.ts
T011: testes HTTP em backend/tests/contract/followers.api.test.ts
T012: teste da página em frontend/src/pages/FollowersPage/index.test.tsx

Depois, implementar na ordem de dependência: repositório → serviço → controller/rotas → interface.
```

### Parallel Example: User Story 2

```text
Em paralelo, antes da implementação:
T017: testes de contrato das consultas em backend/tests/contract/followers.api.test.ts
T018: testes de carregamento e troca de identificador em frontend/src/pages/FollowersPage/index.test.tsx

Depois, implementar consultas persistidas, endpoints e integração na interface.
```

### Parallel Example: User Story 3

```text
Em paralelo, antes da implementação:
T022: testes dos controles em frontend/src/components/atoms/
T023: testes de mensagens e contagem em frontend/src/components/atoms/ e frontend/src/components/molecules/
T024: teste integrado de falhas na página em frontend/tests/pages/FollowersPage/index.test.tsx
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Setup e Foundational.
2. Concluir US1, incluindo testes unitários, SQLite, HTTP e interface.
3. Validar independentemente repetição idempotente, remoção e estado confirmado.
4. Parar no checkpoint de US1 para uma demonstração inicial.

### Incremental Delivery

1. Setup + Foundational: estrutura e persistência compartilhada prontas.
2. US1: seguir/deixar de seguir — incremento MVP.
3. US2: consulta persistida de contagem e estado na carga e troca de identificador.
4. US3: estados de feedback, acessibilidade e operação por teclado.
5. Polish: documentação e validação integrada do quickstart.

## Notes

- IDs de tarefa são sequenciais; toda tarefa usa checkbox, ID e caminho explícito.
- `[P]` aparece somente nas tarefas que podem ser executadas em paralelo sem conflito de arquivo ou dependência pendente.
- Os rótulos `[US1]`, `[US2]` e `[US3]` identificam tarefas das respectivas histórias; Setup, Foundational e Polish não recebem rótulo.
- As tarefas de teste devem ser escritas e observadas falhando antes da implementação correspondente, seguindo o TDD definido no plano.
- O escopo e as decisões foram derivados exclusivamente de `specs/001-seguir-criadora/` e das convenções globais do projeto; nenhuma outra feature foi usada.
