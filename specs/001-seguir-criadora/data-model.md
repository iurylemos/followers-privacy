# Modelo de Dados: Seguir Criadora

## Entidades

### Creator

Representa a criadora demonstrativa configurada para esta versão.

| Campo | Tipo conceitual | Regras |
| --- | --- | --- |
| `creatorId` | string | ID estável; somente a criadora configurada (`creator-1`) é aceita |
| `name` | string | Nome de exibição fornecido pela configuração |

Não existe cadastro de criadoras nesta funcionalidade; a configuração é a fonte para o nome e o
ID aceito pela API e interface.

### User Identifier

Identificador demonstrativo informado pelo visitante; não representa autenticação.

| Campo | Tipo conceitual | Regras |
| --- | --- | --- |
| `userId` | string | De 1 a 64 caracteres ASCII: letras, números, hífen ou sublinhado |

### Follow Relation

Registra que um identificador segue uma criadora.

| Campo SQLite | Tipo | Regras |
| --- | --- | --- |
| `creator_id` | `TEXT` | Obrigatório; ID da criadora demonstrativa |
| `user_id` | `TEXT` | Obrigatório; ID de usuário validado |
| `created_at` | `TEXT` | Obrigatório; timestamp UTC definido pelo SQLite |

**Chave primária composta**: `(creator_id, user_id)`. Ela impede relações duplicadas mesmo diante
de requisições repetidas. A tabela não mantém contagem materializada: a quantidade é calculada
com `COUNT(*)`, evitando estado derivado divergente.

## Relacionamentos

- Uma criadora tem zero ou mais relações de seguimento.
- Um identificador de usuário pode ter zero ou mais relações, uma para cada criadora suportada.
- Cada relação associa exatamente uma criadora a um identificador de usuário.

## Persistência e regras de integridade

- SQLite local é a fonte persistente de verdade.
- O esquema é inicializado de forma reproduzível a partir de uma migração versionada.
- Os comandos SQL usam parâmetros vinculados; valores recebidos não são interpolados em SQL.
- `INSERT ... ON CONFLICT(creator_id, user_id) DO NOTHING` garante que seguir seja seguro quando
  repetido; o resultado da inserção determina o status HTTP.
- `DELETE` para um par ausente não altera o banco. A resposta continua descrevendo o estado final
  não seguido.
- Escrita e leitura da contagem de resposta são executadas atomicamente quando necessário para
  evitar confirmar uma contagem desatualizada em relação à própria operação.
- A configuração do caminho do arquivo do banco é externa ao código, com valor local padrão
  documentado. Testes usam banco isolado e nunca o arquivo de desenvolvimento.

## Validação

- `creatorId` deve corresponder à criadora configurada.
- `creatorId` e `userId` devem satisfazer `^[A-Za-z0-9_-]{1,64}$`.
- IDs inválidos são rejeitados antes de executar consultas.
- O banco não armazena relações para criadoras desconhecidas.
