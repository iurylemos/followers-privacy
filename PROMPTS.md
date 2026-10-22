# PROMPTS e decisões funcionais

Este arquivo registra decisões necessárias para tornar explícito o comportamento do desafio
Seguir Criadora antes da implementação.

## Decisões

1. **Identidade demonstrativa**: `userId` é uma chave de demonstração informada pelo cliente.
   Não autentica a pessoa nem concede autorização; a aplicação não apresentará essa chave como
   prova de identidade.
2. **Criadora no escopo**: a versão inicial terá somente a criadora estática `creator-1`,
   configurada de forma consistente no frontend e backend. Não haverá cadastro ou administração
   de criadoras.
3. **Formato dos identificadores**: `creatorId` e `userId` aceitam de 1 a 64 caracteres ASCII
   dentre letras, números, hífen e sublinhado. Entradas inválidas são rejeitadas antes de acessar
   a persistência.
4. **Consulta de estado**: além dos endpoints de seguir, deixar de seguir e consultar contagem,
   `GET /creators/:creatorId/followers/:userId` retorna `{ "following": boolean }`. Essa consulta
   permite restaurar o estado do botão ao carregar a página ou trocar o usuário demonstrativo.
5. **Resposta ao seguir**: `POST /creators/:creatorId/followers` recebe `{ "userId": string }`.
   Retorna `201` quando cria a relação e `200` quando ela já existia; ambos retornam
   `{ "following": true, "followerCount": number }`. Repetir a operação não duplica a relação.
6. **Resposta ao deixar de seguir**: `DELETE /creators/:creatorId/followers/:userId` retorna
   `200` com `{ "following": false, "followerCount": number }`, esteja ou não a relação presente.
   Assim, a repetição é segura e a resposta sempre representa o estado persistido.
7. **Consultas**: `GET /creators/:creatorId/followers/count` retorna
   `{ "followerCount": number }`, calculado a partir das relações armazenadas. Consultas para
   criadoras diferentes da demonstrativa retornam `404`.
8. **Persistência**: a chave primária composta `(creator_id, user_id)` é a garantia final de
   unicidade. A contagem e o estado não são mantidos como cópias mutáveis.
9. **Interface**: após uma alteração confirmada, a interface utiliza a resposta da API e pode
   reconciliar o estado com as consultas persistidas. Uma falha não exibe sucesso nem altera a
   interface como se a operação tivesse sido concluída.
10. **Ambiente**: o arquivo SQLite e a origem permitida pelo CORS são configuráveis por ambiente;
    os testes usam bancos temporários/isolados e nenhuma configuração contém segredos reais.

Estas decisões resolvem ambiguidades do desafio para fins de planejamento. Mudanças futuras
deverão atualizar este arquivo e os contratos afetados.

## Decisões que tomei

- Uso do SQLLite em vez do Docker
- Adicioneis skills: Speckit, GrillMe, AgentBrowser, TDD
- Adicionei um design system para o Backend (Layered Architecture)
- Adicionei um design system para o Frontend (Atomic Design System)
- Criação do arquivo de tasks separado pro histórias (Para cada janela de contexto)
- Uso de classes em vez de funções
- Nomeclatura por arquivo: `backend/src/domain/repositories/followers.repository.ts`

## O que não verifiquei
