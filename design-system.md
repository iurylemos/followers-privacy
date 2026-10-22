# Design system — Seguir Criadora

## Direção

Uma página de comunidade que parece um cartão de fã impresso em tinta azul: a identidade da
criadora fica em primeiro plano e o controle de seguimento é a ação principal, sem aparência de
painel administrativo.

## Tokens

### Cor

| Token | Hex | Uso |
| --- | --- | --- |
| `paper` | `#F1F4FC` | Fundo frio e luminoso da página |
| `ink` | `#17264B` | Texto e superfícies de maior contraste |
| `iris` | `#4059B8` | Ação principal e identidade visual |
| `lilac` | `#DCE2FA` | Superfícies secundárias |
| `signal` | `#F0785A` | Pequeno destaque para estados confirmados |
| `quiet` | `#66718D` | Texto auxiliar |

### Tipografia

Usar `Aptos`, `Segoe UI` e fontes sans-serif do sistema, sem baixar fontes externas. Títulos
usam peso forte e escala compacta; texto de instrução mantém largura curta e altura de linha
confortável.

### Layout

A página centraliza uma composição assimétrica, com uma placa azul larga para a identidade da
criadora e uma superfície clara estreita para a ação. Em telas pequenas, a placa e o controle
empilham sem reduzir a área de toque.

```text
Desktop
┌────────────────────────┬───────────────────┐
│ retrato/monograma      │ Você acompanha?   │
│ Nome da criadora       │ [identificador]   │
│ Criadora em destaque   │ [Seguir]          │
└────────────────────────┴───────────────────┘

Mobile
┌──────────────────────────────┐
│ retrato/monograma             │
│ Nome da criadora              │
├──────────────────────────────┤
│ [identificador]               │
│ [Seguir]                      │
└──────────────────────────────┘
```

Manter o texto alinhado à esquerda. Evitar grades de cartões repetidos, estatísticas decorativas
e rótulos técnicos que não ajudem a pessoa a seguir ou deixar de seguir.

## Princípios de interface

- A identidade da criadora é a imagem principal; a ação tem um único botão evidente.
- “Seguir” e “Deixar de seguir” nomeiam a mesma ação em todos os estados.
- O estado muda somente após a API confirmar; erro não imita sucesso.
- Inputs e botões usam labels explícitas, foco visível e alvos confortáveis no toque.
- Animação é dispensável para o fluxo; respeitar `prefers-reduced-motion`.
