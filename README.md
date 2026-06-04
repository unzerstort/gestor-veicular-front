# Auto Manager

Front-end em Next.js, TypeScript e Tailwind CSS para a interface de gestão de veículos com componentes reutilizáveis.

## Requisitos

- Node.js 20+
- Backend do Auto Manager disponível em <https://gestor-veicular-backend.vercel.app/api/vehicles>
- Variável de ambiente `NEXT_PUBLIC_API_BASE_URL` configurada

## Como rodar

1. Instale as dependências com `npm install`.
2. Copie o arquivo de ambiente:
   - `cp .env.example .env.local`
3. Ajuste `NEXT_PUBLIC_API_BASE_URL` para a URL do backend.
4. Inicie o projeto em modo de desenvolvimento:
   - `npm run dev`

## Scripts úteis

- `npm run dev` — inicia o servidor de desenvolvimento
- `npm run build` — cria a versão otimizada para produção
- `npm run start` — inicia a aplicação em produção
- `npm run lint` — executa o ESLint
- `npm run typecheck` — valida tipos TypeScript sem gerar arquivos

## Funcionalidades

- Dashboard com indicadores de frota e histórico recente
- Listagem de veículos com filtros por marca e ano
- Cadastro de veículo com validação de campos
- Visualização detalhada de veículo
- Edição parcial de veículo via `PATCH`
- Exclusão de veículo com confirmação

## Acessibilidade e interface

- Layout responsivo para desktop, tablet e mobile
- Formulários com labels, estados de erro e validação acessível
- Mensagens de feedback
- Elementos com `aria-label` e suporte a navegação por teclado

## Observações

- A interface consome a API exposta por `NEXT_PUBLIC_API_BASE_URL`.
