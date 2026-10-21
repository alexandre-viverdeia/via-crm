# Design do VIA CRM

O visual segue a identidade da Viver de IA, tirada do site https://viverdeia.ai e da logo. Toda tela nova usa estes tokens: nada de cor ou fonte fixa no componente.

## Paleta

| Papel | Cor | De onde veio |
|---|---|---|
| Principal (botões, links, foco, menu ativo) | navy `#0A1F3B` (`hsl(214 71% 14%)`) | cor da marca no site |
| Principal no tema escuro | azul claro `#89B1E6` (`hsl(214 65% 72%)`) | o mesmo navy, clareado para ter contraste no fundo escuro |
| Sucesso (Ganho, metas batidas) | verde `#1F895B` (`hsl(154 63% 33%)`) | verde que acompanha o navy |
| Destaque dos Estágios | dourado `#B9915B` | Estágio "Proposta enviada" no Pipeline padrão |
| Fundo | quase branco `hsl(0 0% 99%)` / escuro `hsl(240 6% 6%)` | neutro, para o navy aparecer |
| Texto | `hsl(240 6% 10%)` / `hsl(0 0% 96%)` | neutro |

As cores dos Estágios do Pipeline padrão vão do cinza ao verde: Novo lead `#94A3B8`, Primeiro contato `#60A5FA`, Diagnóstico agendado `#0A1F3B`, Proposta enviada `#B9915B` e Negociação `#1F8A5B`.

## Tipografia

- **Geist** para toda a interface, de 300 a 700.
- **Geist Mono** para números e códigos.
- As duas vêm do Google Fonts, carregadas em `src/index.css`, e estão em `fontFamily.sans` e `fontFamily.mono` no `tailwind.config.ts`.

## Forma

- Cantos de 0,5rem (`--radius`), cartões com borda fina e quase sem sombra.
- Espaçamento do shadcn/ui, sem alterações.

## Logo

- `public/brand/logo-via.png`: a logo horizontal, na tela de login (invertida no tema escuro).
- `public/brand/icone-via.png`: o ícone "VIA", no menu lateral, na landing page e como favicon.

## Tom de voz

Direto, em "você", com frases curtas e sem jargão. Exemplos do app: "Nenhum lead esquecido: todo dia você sabe quem chamar." e "Conte sobre a sua empresa. Se fizer sentido para os dois lados, o nosso time te chama para um diagnóstico."

## Tokens

Ficam em `src/index.css` (`:root` e `.dark`), no formato que o Tailwind e o shadcn/ui esperam:

```css
:root {
  --primary: 214 71% 14%;
  --primary-foreground: 0 0% 100%;
  --ring: 214 71% 14%;
  --sidebar-primary: 214 71% 14%;
  --success: 154 63% 33%;
  --radius: 0.5rem;
}
.dark {
  --primary: 214 65% 72%;
  --primary-foreground: 240 6% 6%;
  --ring: 214 65% 72%;
  --sidebar-primary: 214 65% 72%;
}
```

A cor de destaque "Viver de IA" é a padrão em Configurações → Aparência (`src/contexts/ThemeContext.tsx`). As outras cores de destaque trocam só `--primary`, `--ring` e as do menu.
