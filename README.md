# Terminal Portfolio

Portfólio pessoal de Gustavo Monnerat, desenvolvido em Angular com uma interface inspirada em terminal. O projeto apresenta experiência profissional, serviços, tecnologias, projetos selecionados, informações pessoais e currículo em português e inglês.

Aplicação publicada em [gusmonnerat.dev](https://gusmonnerat.dev).

## Tecnologias

- Angular 22 com componentes standalone e carregamento lazy por rota
- TypeScript 6 em modo estrito
- SCSS com estilos globais, variáveis e animações compartilhadas
- Angular Router
- Angular SSR/SSG para pré-renderização de rotas estáticas
- ngx-translate 18 para internacionalização baseada em signals
- RxJS para estado reativo e eventos de navegação
- Vitest e jsdom para testes unitários
- Express como infraestrutura do engine Angular durante renderização/build
- Vercel para build e hospedagem estática

## Pré-requisitos

- Node.js `>= 24.15.0 < 25`
- npm 11 ou superior
- Angular CLI 22, opcionalmente instalado de forma global

O projeto sempre pode usar o Angular CLI local por meio dos scripts npm; a instalação global não é obrigatória.

## Instalação

Clone o repositório, entre no diretório do projeto e instale exatamente as versões registradas no lockfile:

```bash
git clone https://github.com/gustavommcv/terminal-portfolio.git
cd terminal-portfolio
npm ci
```

Para iniciar o servidor de desenvolvimento:

```bash
npm start
```

A aplicação estará disponível, por padrão, em `http://localhost:4200`.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor local em modo de desenvolvimento. |
| `npm run dev` | Inicia o servidor local aceitando conexões em `0.0.0.0`. |
| `npm run preview` | Inicia o Angular com a configuração de produção. |
| `npm run build` | Gera o build padrão, configurado como produção. |
| `npm run build:production` | Gera explicitamente o build de produção. |
| `npm run watch` | Recompila em modo de desenvolvimento a cada alteração. |
| `npm test` | Executa o Vitest em modo interativo/watch. |
| `npm run test:ci` | Executa toda a suíte uma vez e encerra. |
| `npm run ng -- <comando>` | Executa um comando do Angular CLI local. |

## Estrutura do projeto

```text
terminal-portfolio/
├── public/
│   ├── cv/                     # Currículos em português e inglês
│   ├── i18n/                   # Catálogos de tradução en.json e pt.json
│   ├── images/                 # Imagens pessoais e thumbnails de projetos
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── layout/         # Header, footer e composição visual de terminal
│   │   │   └── shared/         # Botões, títulos, seletor de idioma e cards
│   │   ├── data/               # Catálogo tipado de projetos
│   │   ├── features/
│   │   │   ├── home/           # Página inicial e suas seções
│   │   │   ├── about/          # Página sobre e suas seções
│   │   │   ├── portfolio/      # Listagem de projetos
│   │   │   ├── projectDetail/  # Detalhe de projeto
│   │   │   └── error/          # Fallback para rotas desconhecidas
│   │   ├── services/           # Idioma/navegação e acesso aos projetos
│   │   ├── app.config*.ts      # Providers do browser e da renderização
│   │   └── app.routes*.ts      # Rotas do cliente e modos de renderização
│   ├── environments/           # Configuração por ambiente
│   ├── styles/                 # SCSS global, variáveis e animações
│   ├── main.ts                 # Bootstrap no browser
│   ├── main.server.ts          # Bootstrap usado na renderização
│   ├── server.ts               # Engine Angular/Express para o processo de build
│   └── test-setup.ts           # Providers globais dos testes Vitest
├── angular.json                # Builders, assets, budgets e configurações
├── tsconfig*.json              # TypeScript da aplicação e dos testes
├── vercel.json                 # Build e saída estática na Vercel
├── ARCHITECTURE.md             # Arquitetura e fluxos internos
├── CHANGELOG.md                # Histórico desta atualização
└── package.json
```

## Arquitetura

A aplicação usa exclusivamente componentes standalone. O componente raiz renderiza o cabeçalho e um `RouterOutlet`; cada página é carregada sob demanda por `loadComponent`. As páginas compõem seções menores e componentes reutilizáveis.

Os dados dos projetos ficam em um catálogo local tipado e são expostos por `ProjectsDataService`. O estado de idioma é coordenado por `LanguageService`, pela query string `locale` e pelo `TranslateService`. Os catálogos JSON são carregados de `public/i18n`.

As rotas `/`, `/about` e `/portfolio` são pré-renderizadas no build. A rota dinâmica `/portfolio/:id` e o fallback usam renderização no cliente. Consulte [ARCHITECTURE.md](ARCHITECTURE.md) para o diagrama e os fluxos detalhados.

## Build de produção

```bash
npm run build:production
```

A saída publicável é criada em:

```text
dist/portfolio/browser
```

Os budgets configurados são:

- Bundle inicial: aviso em 500 kB e erro em 1 MB.
- Estilo de componente: aviso em 4 kB e erro em 8 kB.

## Testes

Para executar a suíte completa uma vez:

```bash
npm run test:ci
```

Os testes usam o builder oficial `@angular/build:unit-test`, Vitest e jsdom. Providers compartilhados de Router e internacionalização são configurados em `src/test-setup.ts`.

## Deploy na Vercel

O arquivo `vercel.json` define:

- Framework preset: `angular`
- Instalação: `npm ci`
- Build: `npm run build`
- Diretório de saída: `dist/portfolio/browser`

Para publicar via integração Git:

1. Importe o repositório na Vercel.
2. Confirme Node.js 24 nas configurações do projeto.
3. Mantenha o diretório raiz apontando para a raiz deste repositório.
4. Faça push para a branch de produção.

Também é possível publicar com a CLI:

```bash
npx vercel
npx vercel --prod
```

Atualmente não há variáveis de ambiente obrigatórias. Os arquivos de `src/environments` exportam objetos vazios. Caso novas integrações sejam adicionadas, cadastre as variáveis separadamente para Development, Preview e Production na Vercel e nunca versione segredos.

## Como contribuir

1. Crie um fork ou uma branch a partir de `main`.
2. Faça alterações pequenas e focadas.
3. Execute `npm run test:ci` e `npm run build:production`.
4. Abra um pull request descrevendo motivação, solução e impacto visual.

## Créditos das imagens

- **Go Gopher (colorido):** arte original de [Renee French](https://reneefrench.blogspot.com/), obtida no [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Gogophercolor.png), sob licença [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
- **Side Gopher:** arte de [Takuya Ueda (@tenntenn)](https://twitter.com/tenntenn), sob licença [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).

## Licença e contato

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).

Desenvolvido por [Gustavo Monnerat da Costa Veronese](https://www.linkedin.com/in/gustavommcv/).

Contato: [monnerat.gustavo@outlook.com](mailto:monnerat.gustavo@outlook.com)
