# AutoManager - Gestor Veicular

Front-end para gestão operacional de veículos, construído com Next.js, React, TypeScript e Tailwind CSS. A aplicação oferece uma visão rápida da frota, cadastro e manutenção de veículos, listagem filtrável, páginas de detalhe e fluxos de edição/exclusão integrados a uma API REST.

Para utilizá-la, basta acessar <https://auto-manager-app.vercel.app/>!
Caso queira rodar o projeto, siga os passos na seção <a href="#como-rodar-localmente">como rodar localmente</a>.

## Funcionalidades

- Dashboard operacional com status da API, cards de resumo, atividade recente e distribuição da frota por marca e faixa de ano.
- Listagem de veículos com filtros por marca e ano, tabela responsiva e ações rápidas para visualizar, editar e excluir registros.
- Cadastro de veículos com validação de placa, marca, modelo, ano e cor.
- Edição parcial de veículos usando `PATCH`, enviando apenas os campos alterados.
- Página de detalhes com breadcrumb, informações principais e ações de edição/exclusão.
- Confirmação de exclusão em modal acessível, incluindo fechamento por `Esc`.
- Layout responsivo para desktop, tablet e mobile, com navegação lateral fixa no desktop e menu deslizante no mobile.
- Tratamento de estados de carregamento, erro, lista vazia e datas inválidas.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Componentes no estilo shadcn/ui
- Lucide React para ícones
- ESLint e TypeScript para validação estática

## API utilizada

A aplicação consome uma API REST configurada pela variável de ambiente `NEXT_PUBLIC_API_BASE_URL`.

Exemplo:

```env
NEXT_PUBLIC_API_BASE_URL=https://gestor-veicular-backend.vercel.app
```

Endpoints consumidos pelo front-end:

- `GET /api/health` - verifica a disponibilidade da API.
- `GET /api/vehicles` - lista veículos cadastrados.
- `GET /api/vehicles?brand=Toyota&year=2020` - lista veículos com filtros opcionais.
- `GET /api/vehicles/:id` - busca um veículo por identificador.
- `POST /api/vehicles` - cadastra um novo veículo.
- `PATCH /api/vehicles/:id` - atualiza parcialmente um veículo.
- `DELETE /api/vehicles/:id` - remove um veículo.

Formato principal de veículo esperado pela interface:

```ts
type Vehicle = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  createdAt: string;
  updatedAt: string;
};
```

Regras atuais de cadastro:

- Placa nos formatos `ABC1234` ou `ABC1D23`.
- Ano inteiro entre `1950` e `2026`.
- Marca e modelo com até 120 caracteres.
- Cor com até 60 caracteres.

## Como rodar localmente

Pré-requisitos:

- Node.js 20 ou superior.
- npm.
- Backend do Gestor Veicular disponível localmente ou publicado.

Passos:

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

3. Ajuste o valor de `NEXT_PUBLIC_API_BASE_URL` para `https://gestor-veicular-backend.vercel.app` em `.env`.

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Acesse a aplicação em:

```text
http://localhost:3000
```

## Scripts disponíveis

- `npm run dev` - inicia o servidor de desenvolvimento.
- `npm run build` - gera a build de produção.
- `npm run start` - executa a aplicação em modo produção após o build.
- `npm run lint` - executa a validação com ESLint.
- `npm run typecheck` - valida os tipos TypeScript sem emitir arquivos.

## Estrutura atual do projeto

```text
app/
  favicon.ico
  globals.css
  layout.tsx
  page.tsx
  vehicles/
    page.tsx
    new/page.tsx
    [id]/page.tsx
    [id]/edit/page.tsx

components/
  layout/
  providers/
  ui/
  vehicles/

lib/
  api.ts
  navigation.ts
  types.ts
  utils.ts
  vehicle.ts
  vehicle-dashboard.ts
```

Responsabilidades principais:

- `app/` concentra as rotas públicas da aplicação.
- `components/ui/` contém componentes reutilizáveis e sem regra de domínio.
- `components/vehicles/` contém as telas e componentes específicos do domínio de veículos.
- `lib/api.ts` centraliza o cliente HTTP.
- `lib/vehicle.ts` concentra validações, normalizações e formatadores do domínio.
- `lib/vehicle-dashboard.ts` deriva métricas e distribuições usadas na dashboard.

## Qualidade e acessibilidade

- A interface utiliza títulos semânticos, labels em formulários e botões com rótulos explícitos.
- A listagem mantém tabela em telas maiores e permite navegação adequada em telas menores.
- Estados de erro e vazio são tratados visualmente para evitar telas quebradas.
- Datas inválidas retornadas pela API são exibidas como `Data indisponível`.
- A dashboard evita depender de gráficos externos pesados e usa visualizações simples para dados já disponíveis.

## Melhorias futuras

- Integrar uma API da Tabela FIPE para melhorar o cadastro com seleção guiada de marca, modelo e ano, reduzindo erros de digitação.
- Exibir preço médio FIPE ou valor de referência do veículo quando houver combinação válida de marca, modelo e ano.
- Adicionar busca por placa, caso exista integração segura e compatível com a legislação aplicável.
- Implementar paginação, ordenação e busca server-side para frotas maiores.
- Adicionar autenticação, autorização por perfil e trilha de auditoria para operações críticas.
- Criar testes unitários para validações, formatadores, navegação contextual e cálculos da dashboard.
- Criar testes end-to-end para fluxos de cadastro, edição, exclusão, filtros e navegação.
- Evoluir o domínio para manutenção preventiva, vencimento de documentos, seguro, licenciamento e histórico de ocorrências.
- Permitir anexos ou fotos reais do veículo quando o backend oferecer suporte.
- Reorganizar o código por domínio, por exemplo em `features/vehicles`, para reduzir arquivos extensos conforme a aplicação crescer.
- Melhorar filtros com autocomplete, máscaras de entrada e prevenção de placa duplicada antes do envio.
- Adicionar observabilidade de erros no front-end para facilitar diagnóstico em produção.

## Observações

As métricas da dashboard são calculadas no front-end a partir dos dados retornados por `GET /api/vehicles` e `GET /api/health`.
