# Quickstart: Seguir Criadora

Este guia descreve como instalar, executar e validar o fluxo implementado nos workspaces npm
`backend` e `frontend`.

## Pré-requisitos

- Node.js 24.15 ou superior.
- npm 11 ou compatível com a versão de Node.js selecionada.
- Portas locais disponíveis para o backend e o frontend.

## Instalação e execução

Na raiz do repositório, instale as dependências uma vez:

```powershell
npm install
```

Opcionalmente, copie `.env.example` para `.env` para ajustar a configuração local. Os valores
padrão são `PORT=3000`, `DATABASE_PATH=./data/followers.sqlite`,
`ALLOWED_ORIGIN=http://localhost:5173`, `CREATOR_ID=creator-1`,
`CREATOR_NAME=Criadora em destaque`, `VITE_API_URL=http://localhost:3000`,
`VITE_CREATOR_ID=creator-1` e `VITE_CREATOR_NAME=Criadora em destaque`.

Inicie cada workspace em um terminal, a partir da raiz:

```powershell
npm run dev --workspace backend
```

Abra `http://localhost:5173`. Se alterar a porta/origem do Vite, ajuste também `ALLOWED_ORIGIN`;
se alterar a porta da API, ajuste `VITE_API_URL`.

## Verificação da API

Os exemplos usam o padrão de desenvolvimento `http://localhost:3000`. Se a configuração local
usar outra porta, substitua a base URL.

Consulte a contagem inicial:

```powershell
curl.exe -i http://localhost:3000/creators/creator-1/followers/count
```

Resultado esperado: `200` e `{"creatorId":"creator-1","count":0}` quando o banco estiver vazio.

Siga como usuário demonstrativo:

```powershell
curl.exe -i -X POST http://localhost:3000/creators/creator-1/followers `
  -H "Content-Type: application/json" `
  -d "{\"userId\":\"user-123\"}"
```

Resultado esperado: `201` e JSON com `following: true` e `followerCount` igual a um quando o
banco estava inicialmente vazio.

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

Resultado esperado: todos os testes passam usando dados isolados. Os testes de API verificam
respostas HTTP e estado persistido; os testes da interface cobrem carregamento, sucesso, erro,
teclado e atualização do estado.

Para executar cada suíte separadamente, use `npm test --workspace backend` e
`npm test --workspace frontend`.

## Validação integrada no navegador

1. Abra a aplicação e informe `user-123`.
2. Siga a criadora; aguarde confirmação e confira botão e contagem.
3. Atualize a página, informe novamente `user-123` e confirme que o estado foi recuperado da API.
4. Troque o identificador para `user-456` e confirme o estado independente desse usuário.
5. Deixe de seguir com `user-123`; confira o estado e a contagem.
6. Repita o fluxo em viewport de 320 px de largura e opere os controles usando apenas teclado,
   observando o foco visível.

Resultado esperado: interface e API apresentam o mesmo estado persistido após recarga e troca de
identificador, sem mensagem de sucesso antes da confirmação. O layout permanece utilizável a
partir de 320 px e os controles podem ser operados por teclado.
