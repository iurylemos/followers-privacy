# Quickstart: Seguir Criadora

Este guia descreve como validar o fluxo integrado depois que a implementação do plano estiver
concluída. Os comandos pressupõem que o repositório disponha dos workspaces e scripts definidos
no plano.

## Pré-requisitos

- Node.js LTS indicado no `README.md` do projeto.
- npm compatível com a versão de Node.js selecionada.
- Portas locais disponíveis para o backend e o frontend.

## Instalação e execução

Na raiz do repositório:

```powershell
npm install
```

Inicie o backend em um terminal:

```powershell
npm run dev --workspace backend
```

Inicie a interface em outro terminal:

```powershell
npm run dev --workspace frontend
```

Abra a URL local exibida pelo Vite. A URL da API, a porta do backend, a origem permitida pelo CORS
e o caminho do banco SQLite devem seguir os valores documentados no `README.md` e no `.env.example`.

## Verificação da API

Os exemplos usam o padrão de desenvolvimento `http://localhost:3000`. Se a configuração local
usar outra porta, substitua a base URL.

Consulte a contagem inicial:

```powershell
curl.exe -i http://localhost:3000/creators/creator-1/followers/count
```

Resultado esperado: `200` e JSON com `followerCount` igual a zero quando o banco estiver vazio.

Siga como usuário demonstrativo:

```powershell
curl.exe -i -X POST http://localhost:3000/creators/creator-1/followers `
  -H "Content-Type: application/json" `
  -d "{\"userId\":\"user-123\"}"
```

Resultado esperado: `201`, `following: true` e contagem aumentada em um.

Repita a operação. Resultado esperado: `200`, `following: true`, sem duplicidade ou novo aumento.

Consulte o estado:

```powershell
curl.exe -i http://localhost:3000/creators/creator-1/followers/user-123
```

Resultado esperado: `200` e `{"following":true}`.

Deixe de seguir:

```powershell
curl.exe -i -X DELETE http://localhost:3000/creators/creator-1/followers/user-123
```

Resultado esperado: `200`, `following: false` e contagem reduzida em um. Repita o DELETE e
confirme que a contagem não fica negativa nem muda novamente.

## Testes automatizados

Execute os testes de integração do backend e os testes de interface:

```powershell
npm test --workspace backend
npm test --workspace frontend
```

Resultado esperado: todos os testes passam usando dados isolados; os testes de API verificam
respostas HTTP e estado persistido, e os testes da interface cobrem carregamento, sucesso, erro,
teclado e atualização do estado.

## Validação integrada no navegador

1. Abra a aplicação e informe `user-123`.
2. Siga a criadora; aguarde confirmação e confira botão e contagem.
3. Atualize a página e confirme que o estado foi recuperado da API.
4. Troque o identificador para `user-456` e confirme o estado independente desse usuário.
5. Deixe de seguir com `user-123`; confira o estado e a contagem.
6. Repita o fluxo em viewport móvel e opere os controles usando apenas teclado.

Resultado esperado: interface e API apresentam o mesmo estado persistido, sem mensagem de sucesso
antes da confirmação.
