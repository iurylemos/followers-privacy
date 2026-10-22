# Feature Specification: Seguir Criadora

**Feature Branch**: `001-seguir-criadora`

**Created**: 2026-10-21

**Status**: Draft

**Input**: User-provided `Implementation Plan: Seguir Criadora` attachment.

## User Scenarios & Testing

### User Story 1 - Seguir ou deixar de seguir a criadora (Priority: P1)

Um visitante informa um identificador demonstrativo e pode seguir ou deixar de seguir a
criadora apresentada na página. A aplicação confirma a operação somente após a API persistir
o resultado.

**Why this priority**: Este é o fluxo central do desafio e entrega o valor principal da aplicação.

**Independent Test**: Com um banco de teste vazio, seguir a criadora cria uma relação única;
deixar de seguir remove essa relação.

**Acceptance Scenarios**:

1. **Given** um identificador válido que ainda não segue a criadora, **When** a pessoa solicita
   seguir, **Then** a relação é persistida e a interface apresenta o estado seguido após a
   confirmação da API.
2. **Given** uma relação já persistida, **When** a pessoa solicita deixar de seguir, **Then** a
   relação é removida e a interface apresenta o estado não seguido após a confirmação da API.
3. **Given** a mesma solicitação de seguir é repetida, **When** a API a processa novamente,
   **Then** existe apenas uma relação e a contagem não é incrementada novamente.
4. **Given** o identificador não atende às regras de validação, **When** a pessoa tenta executar
   uma operação, **Then** a entrada é rejeitada e nenhuma relação é alterada.

### User Story 2 - Consultar seguidores e estado do seguimento (Priority: P2)

Uma pessoa pode ver a quantidade persistida de seguidores e saber se o identificador atual segue
a criadora, inclusive ao carregar ou atualizar a página.

**Why this priority**: O estado atual é necessário para apresentar feedback confiável e permitir
que o visitante escolha a ação correta.

**Independent Test**: Preparar relações no banco de teste e verificar que as consultas retornam
uma contagem correta e o estado correspondente ao identificador solicitado.

**Acceptance Scenarios**:

1. **Given** nenhuma relação persistida para a criadora, **When** a quantidade é consultada,
   **Then** a API retorna zero.
2. **Given** relações persistidas para uma criadora, **When** a quantidade é consultada,
   **Then** a API retorna o total armazenado.
3. **Given** a página é carregada ou atualizada, **When** a API responde com contagem e estado,
   **Then** a interface apresenta esses valores sem depender apenas de estado em memória.
4. **Given** um identificador é alterado, **When** seu estado é consultado, **Then** o botão
   reflete o estado persistido desse identificador.

### User Story 3 - Receber feedback acessível e previsível (Priority: P3)

Durante as operações, a pessoa recebe estados claros de carregamento, sucesso ou erro e consegue
usar os controles principais por teclado.

**Why this priority**: Feedback correto e acessibilidade tornam o fluxo principal compreensível
e operável sem alterar seu escopo.

**Independent Test**: Testes de interface verificam estados carregados, foco/teclado, confirmação
após resposta da API e mensagens em falhas simuladas.

**Acceptance Scenarios**:

1. **Given** uma requisição está em andamento, **When** a interface aguarda a resposta, **Then**
   apresenta estado de carregamento e não anuncia sucesso antecipadamente.
2. **Given** a API falha, **When** a operação termina, **Then** a interface apresenta erro claro
   e não simula alteração persistida.
3. **Given** uma pessoa navega somente por teclado, **When** alcança os controles, **Then** pode
   informar o identificador e executar a operação com foco perceptível.

### Edge Cases

- Requisições repetidas de seguir não podem criar relações duplicadas.
- Remover uma relação inexistente não pode reduzir a contagem nem produzir estado inconsistente.
- IDs vazios, com espaços externos, acima do limite ou com caracteres não permitidos são rejeitados.
- Falhas de leitura ou escrita do banco não podem ser apresentadas como sucesso.
- Falhas de rede ou respostas inválidas da API devem manter a interface em estado não confirmado.
- A quantidade retornada nunca pode ser negativa e deve refletir os dados persistidos.
- Um identificador sem relação de seguimento deve apresentar estado não seguido.

## Requirements

### Functional Requirements

- **FR-001**: A aplicação MUST exibir uma única criadora demonstrativa, configurada de modo
  consistente entre a interface e a API.
- **FR-002**: A pessoa MUST poder informar um identificador demonstrativo para consultar e
  executar operações de seguimento.
- **FR-003**: A API MUST permitir criar uma relação entre o identificador de usuário e a criadora.
- **FR-004**: A API MUST permitir remover a relação entre o identificador de usuário e a criadora.
- **FR-005**: A API MUST retornar a quantidade de relações de seguimento persistidas para a criadora.
- **FR-006**: A API MUST retornar se o identificador informado segue a criadora.
- **FR-007**: A persistência MUST impedir mais de uma relação para o mesmo par criadora/usuário.
- **FR-008**: Repetir a operação de seguir MUST manter uma única relação e uma contagem correta.
- **FR-009**: Remover uma relação inexistente MUST deixar o estado e a contagem corretos.
- **FR-010**: A aplicação MUST validar IDs como strings ASCII de 1 a 64 caracteres compostas
  somente por letras, números, hífen ou sublinhado.
- **FR-011**: A API MUST comunicar erros com status e mensagens consistentes, sem expor stack
  traces, credenciais ou detalhes internos.
- **FR-012**: A interface MUST obter contagem e estado de seguimento da API ao iniciar e refletir
  alterações confirmadas pela API.
- **FR-013**: A interface MUST apresentar carregamento, sucesso e erro quando aplicáveis e MUST
  NOT comunicar sucesso antes da confirmação da API.
- **FR-014**: Os controles principais MUST ter semântica acessível, identificação programática,
  foco perceptível e operação por teclado.
- **FR-015**: A API MUST usar validação de entrada, consultas SQL parametrizadas e restrições de
  integridade na persistência.
- **FR-016**: Os testes MUST verificar contratos HTTP, efeitos persistidos, cenários inválidos,
  operações repetidas, erros relevantes e interações da interface usando dados isolados.
- **FR-017**: `GET /creators/{creatorId}/followers/count` MUST retornar o ID consultado e a contagem
  no formato `{ "creatorId": string, "count": number }`.

### Key Entities

- **Creator**: A criadora demonstrativa identificada por um ID estável; não há cadastro ou
  administração de criadoras neste escopo.
- **User Identifier**: Uma chave demonstrativa informada na interface para associar operações;
  não representa autenticação nem prova de identidade.
- **Follow Relation**: Relação persistida entre uma criadora e um identificador de usuário, única
  por par e usada para derivar o estado e a contagem de seguidores.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Uma operação de seguir confirmada resulta em exatamente uma relação persistida para
  o par criadora/usuário.
- **SC-002**: Repetir a operação de seguir não altera a relação única nem aumenta novamente a
  contagem.
- **SC-003**: Após seguir ou deixar de seguir, consulta de contagem e estado retorna os valores
  persistidos correspondentes, inclusive após reiniciar ou atualizar a interface.
- **SC-004**: Os testes automatizados cobrem todos os requisitos funcionais e cenários de borda
  relevantes com banco isolado, sem depender de serviços externos.
- **SC-005**: As operações principais podem ser concluídas por teclado e todos os estados de
  carregamento, erro e confirmação são identificáveis na interface.

## Assumptions

- O escopo contém uma página, uma criadora demonstrativa e um identificador de usuário informado
  para fins de demonstração.
- A identidade indicada pelo cliente não será tratada como identidade autenticada ou autorização.
- Não serão incluídos cadastro de usuários, cadastro de criadoras, autenticação real ou
  funcionalidades administrativas.
- SQLite local será a fonte persistente de verdade; testes usarão bancos isolados.
- A interface exige uma consulta adicional de estado de seguimento para recuperar o estado após
  carregamento e troca do identificador.
- Os IDs usarão o formato ASCII `[A-Za-z0-9_-]{1,64}` para validação consistente na API e interface.
- Não há meta de throughput ou latência definida para este desafio; a solução será dimensionada
  para execução local e uso demonstrativo.
