<!--
Sync Impact Report
Version change: scaffold não ratificado → 1.0.0
Modified principles: placeholders do scaffold → I. Simplicidade com Responsabilidade Técnica;
II. Integridade e Consistência dos Dados; III. Separação de Responsabilidades;
IV. Testabilidade e Qualidade Verificável; V. Segurança por Padrão;
VI. Experiência do Usuário e Acessibilidade; VII. Documentação e Reprodutibilidade.
Added sections: Aplicação e Evidências; Artefatos e Fluxo de Trabalho.
Removed sections: nenhuma.
Follow-up TODOs: nenhum.
-->

# Seguir Criadora Constitution

## Core Principles

### I. Simplicidade com Responsabilidade Técnica

- A solução MUST atender aos requisitos do desafio sem adicionar funcionalidades fora do escopo.
- A complexidade técnica MUST ser proporcional ao problema resolvido.
- Novas abstrações, dependências e padrões arquiteturais MUST possuir justificativa concreta.
- A implementação MUST priorizar legibilidade, manutenibilidade e facilidade de evolução.
- Soluções simples MUST ser preferidas quando oferecerem o mesmo nível de correção, segurança
  e confiabilidade.
- Decisões que aumentem significativamente a complexidade MUST ser justificadas no plano técnico.

Rationale: O objetivo é demonstrar maturidade de engenharia sem transformar um desafio pequeno
em um sistema desnecessariamente complexo.

### II. Integridade e Consistência dos Dados

- As operações de negócio MUST preservar a consistência das relações entre usuários e criadoras.
- O sistema MUST impedir estados duplicados ou inconsistentes, inclusive diante de requisições
  repetidas.
- As regras de integridade MUST ser protegidas pela camada responsável pela persistência sempre
  que aplicável.
- O estado apresentado ao usuário MUST refletir o estado persistido, e não depender exclusivamente
  de informações mantidas em memória.
- Falhas durante operações MUST ser tratadas sem informar sucesso quando a alteração não tiver
  sido concluída.
- Decisões sobre comportamentos não especificados pelo desafio MUST ser documentadas em
  `PROMPTS.md`.

Rationale: A consistência do estado é essencial para que as operações de seguir, deixar de seguir
e consultar seguidores produzam resultados confiáveis.

### III. Separação de Responsabilidades

- A apresentação, as regras de negócio, o tratamento das requisições e o acesso aos dados MUST
  possuir responsabilidades claramente definidas.
- As regras de negócio MUST ser executáveis e verificáveis sem depender diretamente de componentes
  visuais.
- A lógica de apresentação MUST NOT ser responsável por executar operações de persistência.
- Os contratos entre as partes do sistema MUST ser explícitos e consistentes.
- A duplicação de regras de negócio MUST ser evitada.
- Dependências MUST permanecer direcionadas de forma a evitar acoplamento desnecessário e
  dependências circulares.

Rationale: A separação de responsabilidades reduz o custo de manutenção e permite testar as regras
de negócio independentemente da interface.

### IV. Testabilidade e Qualidade Verificável

- Comportamentos relevantes MUST possuir testes automatizados adequados ao risco e à
  responsabilidade de cada parte.
- A API MUST possuir testes automatizados que verifiquem contratos HTTP e efeitos sobre o estado
  persistido.
- Os testes MUST cobrir caminhos de sucesso, entradas inválidas, operações repetidas e situações
  de erro relevantes.
- Os testes MUST ser reproduzíveis e isolados de dados externos ou ambientes de produção.
- Correções de defeitos MUST incluir testes de regressão sempre que tecnicamente viável.
- Uma alteração MUST NOT ser considerada concluída quando os testes relevantes estiverem falhando.
- A qualidade MUST ser verificada por evidências executáveis, e não apenas por revisão visual do
  código.

Rationale: Testes confiáveis reduzem regressões e demonstram que o comportamento entregue
corresponde aos requisitos definidos.

### V. Segurança por Padrão

- Todas as entradas externas MUST ser consideradas não confiáveis e validadas antes de serem
  utilizadas.
- O acesso a dados MUST utilizar mecanismos seguros que impeçam a interpretação de entradas do
  usuário como comandos de banco de dados.
- A aplicação MUST NOT expor credenciais, informações sensíveis ou detalhes internos
  desnecessários nas respostas de erro.
- Os dados recebidos do cliente MUST NOT ser considerados prova de identidade ou autorização.
- Recursos adicionais de segurança MUST ser implementados conforme os riscos e requisitos
  documentados, sem adicionar mecanismos de autenticação fora do escopo sem justificativa.

Rationale: Mesmo um desafio pequeno deve demonstrar hábitos seguros de desenvolvimento.

### VI. Experiência do Usuário e Acessibilidade

- As operações principais MUST apresentar resultados claros e previsíveis.
- A interface MUST distinguir estados de carregamento, sucesso e erro quando forem relevantes.
- A interface MUST NOT indicar que uma operação foi concluída antes de receber confirmação adequada
  da aplicação.
- Os controles MUST possuir semântica e identificação acessíveis.
- As informações apresentadas MUST permanecer consistentes com as respostas da aplicação.
- A interface MUST permitir a execução das operações principais sem depender exclusivamente de
  interações inacessíveis por teclado.

Rationale: A simplicidade visual não elimina a necessidade de acessibilidade e feedback confiável.

### VII. Documentação e Reprodutibilidade

- O projeto MUST possuir documentação suficiente para que outro desenvolvedor consiga instalar,
  executar e testar a aplicação.
- O `README.md` MUST documentar os requisitos, a configuração, a execução e os testes.
- As decisões tomadas para resolver ambiguidades MUST ser registradas em `PROMPTS.md`.
- Os requisitos, as decisões técnicas e os critérios de aceitação MUST permanecer consistentes
  entre os artefatos do SpecKit.
- Os comandos de validação documentados MUST corresponder aos comandos reais do projeto.
- A documentação MUST ser atualizada quando mudanças relevantes alterarem o comportamento ou a
  forma de executar o sistema.

Rationale: A reprodutibilidade permite revisar, avaliar e manter o projeto sem depender de
explicações externas ao repositório.

## Aplicação e Evidências

- Os princípios desta constituição MUST ser aplicados às funcionalidades de seguir, deixar de
  seguir e consultar a quantidade de seguidores, bem como aos contratos entre interface, API e
  persistência.
- Especificações, planos, tarefas, implementação e revisões MUST apresentar evidências compatíveis
  com os princípios aplicáveis.
- A conformidade MUST ser avaliada pelo comportamento e pelas evidências disponíveis, não apenas
  pela existência de arquivos ou documentos.

## Artefatos e Fluxo de Trabalho

- O Plan MUST incluir uma verificação explícita de conformidade com esta constituição antes da
  implementação.
- Ambiguidades relevantes do desafio MUST ser resolvidas e documentadas antes de implementar o
  comportamento correspondente.
- O `README.md`, `PROMPTS.md` e os artefatos do SpecKit MUST permanecer consistentes com o
  comportamento e as decisões do projeto.

## Governance

- Esta constituição MUST orientar as especificações, os planos, as tarefas, a implementação e as
  revisões do projeto.
- Os artefatos produzidos pelo SpecKit MUST respeitar os princípios definidos neste documento.
- Exceções a qualquer princípio MUST apresentar justificativa técnica explícita e registrar o
  impacto na qualidade, segurança ou manutenção.
- Alterações nesta constituição MUST incluir justificativa e seguir versionamento semântico:
  - MAJOR: remoção ou alteração incompatível de princípios existentes.
  - MINOR: inclusão de princípios ou expansão significativa das regras.
  - PATCH: esclarecimentos e correções que não alteram o significado das regras.
- Nenhuma alteração MUST enfraquecer um princípio apenas para acomodar uma implementação que não
  o atende.

**Version**: 1.0.0 | **Ratified**: 2026-10-21 | **Last Amended**: 2026-10-21
