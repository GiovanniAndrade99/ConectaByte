# ConectaByte
// Tony lindo 
Landing page institucional da ConectaByte, desenvolvida para apresentar serviços digitais a empresas de Agudos e região. O site reúne informações sobre soluções, pacotes, processo de atendimento e canais de contato em uma experiência responsiva e sem dependências de runtime.

## Visão geral

- **Tipo:** site estático (HTML, CSS e JavaScript nativos)
- **Idioma:** português do Brasil
- **Build:** não necessário
- **Diretório publicado:** `public/`
- **Páginas:** página inicial e aviso de privacidade e cookies

A página inicial apresenta serviços, diferenciais, suporte, pacotes, processo de trabalho, equipe, região atendida, perguntas frequentes e formulário de contato. O formulário prepara uma mensagem e encaminha o visitante ao WhatsApp; não há envio para um backend próprio.

## Começar localmente

Não é necessário instalar dependências. Na raiz do repositório, inicie um servidor HTTP local:

```powershell
python -m http.server 8000 --directory public
```

Depois, acesse <http://localhost:8000>. Se o comando `python` não estiver disponível, use `py -m http.server 8000 --directory public` no Windows.

Sirva o conteúdo por HTTP em vez de abrir os arquivos diretamente no navegador. Isso permite validar os caminhos dos recursos e o comportamento da página como em uma hospedagem real.

## Estrutura do projeto

```
.
├── public/                    # Raiz do site publicado
│   ├── index.html             # Landing page
│   ├── privacidade.html       # Informações sobre privacidade e cookies
│   ├── _headers               # Cabeçalhos para hosts compatíveis
│   ├── .well-known/
│   │   └── security.txt       # Canal de contato de segurança
│   └── assets/
│       ├── boot.js            # Inicialização e estado de carregamento
│       ├── site.js            # Interações da página inicial
│       ├── privacidade.js     # Preferências de cookies
│       ├── site.css           # Estilos da página inicial
│       ├── privacidade.css    # Estilos da página de privacidade
│       ├── fonts.css          # Fontes locais
│       ├── fonts/             # Arquivos WOFF2
│       └── favicon.svg        # Ícone do site
├── assets/                    # Materiais de apoio do projeto
├── .gitignore
└── README.md
```

## Publicação

A publicação deve enviar **somente o conteúdo da pasta `public/`**. O repositório não exige comando de build.

### Cloudflare Pages ou Netlify

Configure o projeto com estes valores:

| Configuração | Valor |
| --- | --- |
| Diretório de publicação | `public` |
| Comando de build | deixar vazio |
| Diretório raiz do projeto | raiz do repositório |

O arquivo `public/_headers` define cabeçalhos em provedores que reconhecem esse formato. Confirme na documentação e nas configurações do provedor que as regras estão sendo aplicadas após o deploy.

## Segurança e manutenção

- O arquivo `public/_headers` concentra a Content Security Policy (CSP) e outros cabeçalhos de segurança. Uma cópia da CSP também está nos metadados das páginas HTML para hosts que ignoram `_headers`. Ao alterar a política, mantenha as cópias sincronizadas; `frame-ancestors` só funciona como cabeçalho HTTP.
- A CSP restringe scripts e estilos a arquivos locais. Mantenha JavaScript e CSS em `public/assets/`; evite scripts, estilos e atributos inline.
- A política Trusted Types está ativa. No JavaScript, construa conteúdo com APIs do DOM, como `document.createElement`, `textContent` e `replaceChildren`; não use `innerHTML`.
- Todo arquivo em `public/` é acessível aos visitantes. Não coloque credenciais, tokens, chaves privadas ou dados confidenciais nessa pasta.
- O formulário de contato usa o WhatsApp e não armazena os dados em um servidor da ConectaByte.
- O aviso de privacidade informa o funcionamento dos cookies e permite salvar a recusa de cookies opcionais no armazenamento local do navegador.

## Alterações no site

1. Edite o HTML da página correspondente em `public/`.
2. Mantenha os estilos em `public/assets/site.css` ou `public/assets/privacidade.css`.
3. Mantenha os comportamentos em arquivos JavaScript externos dentro de `public/assets/`.
4. Ao adicionar um recurso externo, revise a CSP em `public/_headers` e nas duas páginas HTML. Permita somente as origens realmente necessárias.
5. Confira as páginas inicial e de privacidade em uma janela de navegador, incluindo navegação, layout responsivo e links de contato, antes de publicar.

## Relato de vulnerabilidade

Consulte `public/.well-known/security.txt` para encontrar o canal indicado para comunicações relacionadas à segurança do site.
