# ConectaByte
Landing page para empresa de sites e sistemas

## Estrutura

- `public/`: **somente esta pasta vai ao ar.** Na hospedagem (Cloudflare Pages ou Netlify), configure o diretório de publicação como `public` e deixe o comando de build vazio.

Tudo fora de `public/` (este README e o `.gitignore`) fica fora do site publicado.

## Segurança

- `public/_headers` define a CSP e os demais cabeçalhos. A mesma CSP está em `<meta>` no `index.html` e no `privacidade.html`; se mudar uma, mude as outras.
- A CSP não permite scripts nem estilos inline: código novo vai em `public/assets/`, e estilo vai em classe CSS, nunca em `style="..."`.
- Não use `innerHTML` no JavaScript: a política Trusted Types bloqueia. Monte elementos com `createElement`/`textContent`.
- Nunca coloque senhas, tokens ou chaves dentro de `public/`: tudo ali é baixável por qualquer visitante.
