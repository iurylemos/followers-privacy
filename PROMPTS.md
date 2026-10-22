# PROMPTS e decisões funcionais

Este arquivo registra decisões necessárias para tornar explícito o comportamento do desafio
Seguir Criadora antes da implementação.

## Decisões

1. **Identidade demonstrativa**: `userId` é uma chave escolhida e informada pelo cliente. Não
   autentica a pessoa, não prova que ela controla essa chave e não concede autorização. Qualquer
   pessoa pode consultar ou alterar a relação associada a um `userId`; a aplicação não deve
   apresentar essa chave como identidade verificada nem usá-la para proteger dados.
2. **Criadora no escopo**: a versão inicial terá somente a criadora estática `creator-1`,
   configurada de forma consistente no frontend e backend. Não haverá cadastro ou administração
   de criadoras.
3. **Formato dos identificadores**: `creatorId` e `userId` aceitam de 1 a 64 caracteres ASCII
   dentre letras, números, hífen e sublinhado. Entradas inválidas são rejeitadas antes de acessar
   a persistência.
4. **Consulta de estado**: além dos endpoints de seguir, deixar de seguir e consultar contagem,
   `GET /creators/:creatorId/followers/:userId` retorna `{ "following": boolean }`. Essa consulta
   permite restaurar o estado do botão após informar ou trocar o identificador demonstrativo.
5. **Resposta ao seguir**: `POST /creators/:creatorId/followers` recebe `{ "userId": string }`.
   Retorna `201` quando cria a relação e `200` quando ela já existia; ambos retornam
   `{ "following": true, "followerCount": number }`. Repetir a operação não duplica a relação.
6. **Resposta ao deixar de seguir**: `DELETE /creators/:creatorId/followers/:userId` retorna
   `200` com `{ "following": false, "followerCount": number }`, esteja ou não a relação presente.
   Assim, a repetição é segura e a resposta sempre representa o estado persistido.
7. **Consultas**: `GET /creators/:creatorId/followers/count` retorna
   `{ "creatorId": string, "count": number }`, incluindo o ID consultado e a quantidade calculada
   a partir das relações armazenadas. Consultas para criadoras diferentes da demonstrativa
   retornam `404`.
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
- Limitei a demonstração a uma criadora fixa (`creator-1`) e tratei `userId` como identificador
  fornecido pelo cliente, não como autenticação ou autorização.
- Tornei seguir e deixar de seguir idempotentes para que repetir uma operação não duplique nem
  remova relações de outros identificadores.

## O que não verifiquei

- Não validei a aplicação em produção, em outros sistemas operacionais ou em outros navegadores.
- Não realizei testes de carga nem uma auditoria de segurança; a aplicação permanece demonstrativa
  e não implementa autenticação ou autorização.
- Boas práticas de SEO, SSR no Frontend
- Não implementei o Cache (Redis) nos endpoints
- Não implementei o Cache no Frontend (React Query)
- Uso de constantes no Frontend (INTL para projetos com idiomas diferentes)
- Uso do Husky para a cada commit fazer as validações de Lint, Test, Build.
- Criação do workflow no github para validações (Lint,Test,Build,Deploy)
- Uso do Swagger para documentação da API
