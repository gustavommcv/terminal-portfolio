# Changelog

Todas as alterações relevantes do projeto são documentadas neste arquivo.

## [Não publicado] — 2026-07-30

### Resumo

- Atualização da aplicação de Angular 21.1.1 para Angular 22.1.0 por meio dos schematics oficiais.
- Atualização do TypeScript para a única linha compatível com Angular 22, 6.0.x.
- Migração do ngx-translate 16 para 18 e adaptação completa à API standalone baseada em signals.
- Migração do runner de testes legado Karma/Jasmine para Vitest.
- Atualização da configuração de deploy estático na Vercel.
- Criação de documentação técnica, operacional e arquitetural.

### Dependências de produção

As versões abaixo são as versões efetivamente registradas no `package-lock.json`, não apenas os ranges declarados.

| Pacote | Antes | Depois | Observação |
| --- | ---: | ---: | --- |
| `@angular/common` | 21.1.1 | 22.1.0 | Atualizado pelo `ng update`. |
| `@angular/compiler` | 21.1.1 | 22.1.0 | Atualizado pelo `ng update`. |
| `@angular/core` | 21.1.1 | 22.1.0 | Atualizado pelo `ng update`. |
| `@angular/forms` | 21.1.1 | 22.1.0 | Atualizado pelo `ng update`. |
| `@angular/platform-browser` | 21.1.1 | 22.1.0 | Atualizado pelo `ng update`. |
| `@angular/platform-server` | 21.1.1 | 22.1.0 | Atualizado pelo `ng update`. |
| `@angular/router` | 21.1.1 | 22.1.0 | Atualizado pelo `ng update`. |
| `@angular/ssr` | 21.1.1 | 22.1.0 | Atualizado pelo `ng update`. |
| `@ngx-translate/core` | 16.0.4 | 18.0.0 | Migrado para providers standalone e signals. |
| `@ngx-translate/http-loader` | 16.0.1 | 18.0.0 | Migrado para `provideTranslateHttpLoader`. |
| `express` | 5.2.1 | 5.2.1 | Já estava na versão atual compatível. |
| `rxjs` | 7.8.2 | 7.8.2 | Mantido na linha suportada pelo Angular 22. |
| `tslib` | 2.8.1 | 2.8.1 | Já estava atualizado. |
| `zone.js` | 0.15.1 | 0.16.2 | Atualizado dentro do peer range do Angular 22. |

### Dependências de desenvolvimento

| Pacote | Antes | Depois | Observação |
| --- | ---: | ---: | --- |
| `@angular/build` | 21.1.1 | 22.1.0 | Builder oficial atualizado. |
| `@angular/cli` | 21.1.1 | 22.1.0 | CLI e schematics atualizados. |
| `@angular/compiler-cli` | 21.1.1 | 22.1.0 | Compilador AOT atualizado. |
| `@types/express` | 5.0.6 | 5.0.6 | Já estava atualizado. |
| `@types/node` | 20.19.30 | 24.13.3 | Alinhado ao runtime Node 24 do projeto. |
| `typescript` | 5.9.3 | 6.0.3 | Atualizado conforme peer dependency do Angular 22. |
| `vitest` | — | 4.1.10 | Novo runner de testes. |
| `jsdom` | — | 30.0.1 | Ambiente DOM dos testes não executados em browser. |
| `@types/jasmine` | 5.1.15 | removido | Substituído pelos tipos globais do Vitest. |
| `jasmine-core` | 5.8.0 | removido | Runner legado removido. |
| `karma` | 6.4.4 | removido | Builder migrado para `@angular/build:unit-test`. |
| `karma-chrome-launcher` | 3.2.0 | removido | Browser launcher não é mais necessário. |
| `karma-coverage` | 2.2.1 | removido | Cadeia Karma removida. |
| `karma-jasmine` | 5.1.0 | removido | Adaptador legado removido. |
| `karma-jasmine-html-reporter` | 2.1.0 | removido | Reporter legado removido. |

### Adaptações de código

- Inclusão explícita de `ChangeDetectionStrategy.Eager` em todos os componentes, realizada pelo schematic do Angular 22 para preservar o comportamento anterior.
- Inclusão de `withNoIncrementalHydration()` para manter a semântica de hidratação anterior à versão 22.
- Supressão temporária dos diagnósticos estendidos `nullishCoalescingNotNullable` e `optionalChainNotNullable`, adicionada automaticamente pela migração oficial.
- Substituição de `TranslateModule` por `TranslatePipe` nos componentes standalone.
- Substituição da factory manual de `TranslateHttpLoader` por `provideTranslateHttpLoader`.
- Renomeação da configuração `defaultLanguage` para `fallbackLang`.
- Definição explícita do idioma inicial com `lang: 'en'`.
- Substituição de `translate.currentLang` por `translate.currentLang()` e tratamento do retorno nulo.
- Remoção de `setDefaultLang`, API removida no ngx-translate 18.
- Preservação do comportamento fail-fast do loader com `failOnError: true`.

### Testes

- Builder alterado de `@angular/build:karma` para `@angular/build:unit-test`.
- Runner definido como Vitest.
- Adição de `src/test-setup.ts` com providers compartilhados de Router e tradução.
- Correção do teste do shell da aplicação, que ainda esperava o título do template inicial do Angular.
- Inclusão de um projeto mínimo no teste de `ProjectCard`, satisfazendo o input obrigatório.
- Resultado final: 24 arquivos e 25 testes aprovados.

### Build e deploy

- `vercel.json` passou a usar o schema oficial.
- Preset `angular` definido explicitamente.
- `installCommand` alterado de `npm install` para `npm ci`.
- Campo legado `version: 2` removido.
- Diretório de saída confirmado como `dist/portfolio/browser`.
- Runtime declarado em `package.json`: Node `>=24.15.0 <25` e npm 11+.
- Scripts `build:production` e `test:ci` adicionados.
- Script de SSR executável removido, pois `outputMode: "static"` não gera servidor para execução em produção.

### Segurança

- A auditoria inicial encontrou 47 vulnerabilidades: 1 baixa, 12 moderadas, 32 altas e 2 críticas.
- Após atualização, correções transitivas seguras e remoção de Karma/Jasmine, restaram 3 vulnerabilidades moderadas na cadeia de desenvolvimento do `@angular/cli`.
- A auditoria restrita às dependências de produção terminou com 0 vulnerabilidades.
- O `npm audit` sugere como “correção” o downgrade do Angular CLI para 21.0.4. Essa ação não foi aplicada porque quebraria o alinhamento com Angular 22 e reverteria a atualização solicitada.
- Não foi utilizado `npm audit fix --force`.
- `@types/node` foi mantido na linha 24 para corresponder ao runtime do projeto; a linha 26 não foi adotada.
- TypeScript 7 não foi adotado porque Angular 22.1 exige TypeScript `>=6.0 <6.1`.

### Validação

- `npm run test:ci`: 25/25 testes aprovados.
- `npm run build:production`: aprovado, com 3 rotas pré-renderizadas.
- Bundle inicial: 350,30 kB brutos e 98,10 kB estimados na transferência, abaixo do budget de aviso de 500 kB.
