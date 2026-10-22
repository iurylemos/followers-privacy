# Pesquisa Técnica: Seguir Criadora

**Data de referência**: 2026-10-21

Esta pesquisa fecha as escolhas técnicas do plano e registra compatibilidades relevantes. A
solução permanece local e pequena; versões exatas serão fixadas pelo `package-lock.json` quando
as dependências forem instaladas.

## Decisões

### Runtime e linguagem

- **Decisão**: Node.js 24.x Active LTS (mínimo 24.15) e TypeScript em modo estrito.
- **Rationale**: Node 24 é a linha LTS ativa e satisfaz os requisitos atuais de Vite, Vitest,
  `better-sqlite3` e `jsdom`. O limite 24.15 também satisfaz o requisito de engine reportado para
  `jsdom`.
- **Alternativas consideradas**: Node 22, ainda em Maintenance LTS, mas com menor horizonte de
  suporte e versões mínimas específicas exigidas por ferramentas; Node 26, não LTS na data de
  referência, foi descartado.

### TypeScript

- **Decisão**: usar TypeScript 7.0.x com `strict: true`, verificando no bootstrap a compatibilidade
  de `tsc --noEmit`, ESLint e integração com os tipos das dependências antes de fixar a toolchain.
- **Rationale**: a versão 7 é a linha estável atual na data da pesquisa. Ela é uma reimplementação
  nativa; um teste de compatibilidade é proporcional ao risco de adoção e ocorre antes do código
  funcional.
- **Alternativas consideradas**: fixar uma linha 5.x já conhecida por amplo suporte de ferramentas.
  Ela será o fallback se o smoke test identificar incompatibilidade bloqueante.

### Frontend

- **Decisão**: React 19, Vite 8, Tailwind CSS 4 e `@tailwindcss/vite`.
- **Rationale**: as versões atuais são compatíveis; Vite 8 requer Node 20.19+ ou 22.12+ e a linha
  atual do plugin React requer Vite 8. O Node 24 selecionado satisfaz esses requisitos.
- **Configuração importante**: Tailwind 4 usa o plugin oficial do Vite e configuração CSS-first
  (`@import "tailwindcss"` e `@theme`); não se deve reproduzir a configuração PostCSS/`@tailwind`
  de exemplos da versão 3.
- **Alternativas consideradas**: Tailwind 3 e Vite 7 foram descartados para um projeto greenfield
  que pode usar a combinação estável atual sem migração legada.

### API e persistência

- **Decisão**: Express 5, Zod 4 e `better-sqlite3` 13.
- **Rationale**: Express 5 é a linha atual para projeto greenfield; os caminhos de API previstos
  são explícitos e não dependem de sintaxe antiga de curingas. Zod 4 oferece validação e inferência
  de tipos; `better-sqlite3` 13 exige Node >=22 e usa N-API.
- **Integridade**: usar chave única composta e comandos preparados parametrizados. `INSERT ... ON
CONFLICT DO NOTHING` torna seguir repetido seguro no banco; `DELETE` de uma relação ausente é
  naturalmente idempotente. A escrita e a contagem retornada podem ser agrupadas em transação
  síncrona, que reverte em exceção. Callbacks de transação não podem ser `async`.
- **Alternativas consideradas**: Express 4 foi descartado para novo projeto sem compatibilidade
  legada; ORM foi descartado pelo tamanho do modelo e pela preferência constitucional por soluções
  simples e SQL parametrizado explícito.

### Testes

- **Decisão**: Vitest 5, Supertest 7.x e `user-event` 14.
- **Rationale**: Vitest 5 exige Node 22.12+, compatível com Node 24. Supertest pode receber a
  aplicação Express exportada sem iniciar listener de produção; ele usa porta efêmera nos testes.
  RTL e `user-event` validam controles por semântica e interação de usuário.
- **Isolamento**: cada conjunto de testes de integração cria banco `:memory:` próprio e executa a
  inicialização do esquema. A interface usa `jsdom` e setup explícito de matchers quando necessário.
- **Alternativas consideradas**: testes dependentes de um SQLite de desenvolvimento foram
  descartados por não serem isolados nem reproduzíveis.

## Compatibilidade e riscos tratados

- O formato de rotas do Express 5 difere do Express 4; os endpoints definidos são segmentos
  nomeados e explícitos. A rota `/followers/count` deve ser registrada antes da rota
  `/followers/:userId` em configurações Express que resolvam por ordem.
- A linha TypeScript 7 pode ter lacunas em parsers ou integrações de ferramentas. Validar a
  compilação estrita e as integrações no bootstrap; adotar TypeScript 6.x/5.x caso bloqueie lint
  ou build.
- `better-sqlite3` é síncrono; operações devem ser curtas e nenhum callback de transação deve
  aguardar I/O. Não será habilitado WAL sem necessidade demonstrada para o perfil de uso local.
- Tailwind CSS 4 não reutiliza integralmente configurações da versão 3; o tema será CSS-first e
  a ferramenta de migração não é necessária em um repositório greenfield.
- A compatibilidade atual de pares de dependências será preservada pelo lockfile. Mudanças de
  versão maior exigem repetir instalação, testes, build e verificação de tipos.

## Decisões de arquitetura e qualidade

### TDD e camadas no backend

- **Decisão**: aplicar Red-Green-Refactor a cada regra da API. Começar por um teste específico que
  falha, implementar o mínimo para passar e refatorar mantendo a suíte verde.
- **Rationale**: os testes precisam ser rápidos, determinísticos, isolados e específicos. A
  pirâmide de testes favorece testes unitários numerosos, integração em quantidade menor e poucos
  fluxos amplos de ponta a ponta.
- **Arquitetura**: manter as fronteiras de apresentação HTTP, aplicação/serviço, domínio e
  infraestrutura/persistência. As camadas são limites lógicos e não justificam criar um módulo
  para cada endpoint.
- **Classes**: usar uma classe para o serviço de domínio, uma para o controller e uma implementação
  SQLite do repositório; injetar colaboradores pelo construtor, sem contêiner de DI. Um contrato
  pequeno de repositório é mantido porque permite testar o serviço com um fake isolado e testar a
  implementação SQLite separadamente.
- **SOLID**: SRP e DIP orientam essas fronteiras. OCP, LSP e ISP não justificam hierarquias ou
  abstrações adicionais neste escopo; aplicá-los quando existir necessidade concreta, não por
  formalismo.
- **Testes**: Red-Green-Refactor do serviço com repositório fake; integração do repositório contra
  SQLite em memória; testes HTTP Supertest contra o app exportado sem `listen()`; poucos testes
  ponta a ponta no navegador. Reproduzir primeiro em teste unitário qualquer defeito detectado em
  nível mais alto.
- **Alternativa considerada**: usar uma implementação SQLite real em memória para todos os testes
  do serviço e evitar interface. Foi mantido o contrato mínimo por tornar a unidade de serviço
  isolável sem confundir teste unitário com integração de persistência.

### Atomic Design, componentes e classes no React

- **Decisão**: aplicar Atomic Design com os níveis atoms, molecules, organisms, templates e page
  apenas aos componentes que existirem no fluxo. A divisão é estrutural e semântica; não criar
  diretórios vazios ou componentes artificiais para preencher todos os níveis.
- **React**: componentes e hooks serão funções. A documentação atual do React recomenda funções
  para componentes novos e mantém classes por compatibilidade; a preferência por classes será
  aplicada aos serviços e às regras do backend, não forçada à API de componentes/hooks.
- **Módulo por componente**: por decisão explícita do projeto, cada componente fica em uma pasta
  cujo `index.tsx` contém a implementação e cuja `index.test.tsx` testa seu comportamento público.
  A convenção é suportada pela resolução de módulos do TypeScript/Vite, mas não é uma prescrição
  do React.
- **Testes de UI**: consultar elementos por papel, label e texto acessíveis; testar resultados e
  interações que uma pessoa observa, não estado interno, funções privadas ou classes CSS. Cada
  componente público recebe testes proporcionais às suas props, estados e interações.
- **Alternativa considerada**: diretório plano de componentes, usando Atomic Design somente como
  vocabulário. Embora reduza diretórios em uma tela pequena, foi descartado por não atender à
  organização Atomic Design explicitamente escolhida; para manter simplicidade, os níveis terão
  somente componentes com responsabilidade real.

## Fontes consultadas

- Node.js releases: https://nodejs.org/en/about/previous-releases
- Vite guide: https://vite.dev/guide/
- Tailwind CSS com Vite: https://tailwindcss.com/docs/installation/using-vite
- React 19: https://react.dev/blog/2024/12/05/react-19
- Express 5 migration guide: https://expressjs.com/en/guide/migrating-5.html
- better-sqlite3 API: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
- Zod 4 changelog: https://zod.dev/v4/changelog
- Vitest guide: https://vitest.dev/guide/
- React component guidance: https://react.dev/reference/react/Component
- Thinking in React: https://react.dev/learn/thinking-in-react
- Vitest
- Atomic Design, Brad Frost: https://atomicdesign.bradfrost.com/chapter-2/
- Martin Fowler, Presentation-Domain-Data Layering: https://martinfowler.com/bliki/PresentationDomainDataLayering.html
- Martin Fowler, Test Pyramid: https://martinfowler.com/bliki/TestPyramid.html
- Test Desiderata: https://testdesiderata.com/
- Node.js best practices, layering: https://raw.githubusercontent.com/goldbergyoni/nodebestpractices/master/sections/projectstructre/createlayers.md
- Pure DI: https://blog.ploeh.dk/2014/06/10/pure-di/
