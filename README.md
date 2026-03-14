# MarketingFood - Marketplace Regional

Um marketplace regional de alimentos com suporte para múltiplas lojas, clientes e administradores. O projeto utiliza **tRPC**, **Drizzle ORM**, **React** e **PostgreSQL**.

## 📋 Visão Geral

O MarketingFood é uma plataforma de e-commerce que permite:

- **Clientes** a navegar por produtos, adicionar ao carrinho, fazer pedidos e avaliar lojas
- **Lojistas** a gerenciar produtos, visualizar pedidos e acompanhar vendas
- **Administradores** a gerenciar lojas, categorias, taxas de entrega e visualizar estatísticas

## 🏗️ Arquitetura

```
marketplace_regional/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # Context API
│   │   └── lib/           # Utilitários e configurações
│   └── public/            # Arquivos estáticos
├── server/                # Backend Express + tRPC
│   ├── _core/            # Configurações e utilitários
│   ├── routers.ts        # Definição das rotas tRPC
│   ├── db.ts             # Funções de banco de dados
│   └── storage.ts        # Integração com storage
├── shared/                # Código compartilhado
│   ├── types.ts          # Tipos TypeScript
│   ├── const.ts          # Constantes
│   └── delivery.ts       # Lógica de entrega
├── drizzle/              # Migrations e schema do banco
└── package.json          # Dependências do projeto
```

## 🚀 Funcionalidades Implementadas

### ✅ Backend (tRPC)

- **Autenticação**: Login/logout com OAuth
- **Categorias**: CRUD completo
- **Lojas**: Criação, edição, listagem
- **Produtos**: Gerenciamento com imagens e preços
- **Pedidos**: Criação, atualização de status, listagem
- **Avaliações**: Criação e listagem de reviews
- **Zonas de Entrega**: Configuração de taxas por distância
- **Relatórios**: Estatísticas de vendas para lojistas e admin
- **Configurações**: Gerenciamento de comissões e multiplicadores

### ✅ Frontend (React)

**Páginas do Cliente:**
- `ClientCatalog` - Catálogo de produtos com filtros
- `ClientCheckout` - Finalização de compra
- `ClientOrders` - Histórico de pedidos
- `ClientRateOrder` - Avaliação de pedidos entregues
- `ClientProfile` - Perfil e endereço do cliente

**Páginas do Lojista:**
- `StoreProducts` - Gerenciamento de produtos
- `StoreOrders` - Visualização de pedidos recebidos
- `StoreProfile` - Perfil da loja
- `StoreReports` - Relatórios de vendas com exportação CSV

**Páginas do Administrador:**
- `AdminDashboard` - Estatísticas gerais
- `AdminStores` - Gerenciamento de lojistas
- `AdminCategories` - Gerenciamento de categorias
- `AdminDelivery` - Configuração de zonas de entrega

## 🔧 Tecnologias Utilizadas

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Radix UI** - Componentes acessíveis
- **tRPC Client** - RPC type-safe
- **React Query** - Data fetching
- **Wouter** - Roteamento leve
- **Sonner** - Notificações toast

### Backend
- **Express** - Web framework
- **tRPC** - RPC type-safe
- **Drizzle ORM** - Query builder
- **PostgreSQL** - Banco de dados
- **Node.js** - Runtime

### Utilitários
- **Zod** - Validação de schemas
- **date-fns** - Manipulação de datas
- **Recharts** - Gráficos
- **Lucide React** - Ícones

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "@trpc/client": "^11.6.0",
    "@trpc/server": "^11.6.0",
    "@trpc/react-query": "^11.6.0",
    "drizzle-orm": "^0.44.6",
    "express": "^4.21.2",
    "react": "^19.2.1",
    "tailwindcss": "^4.1.14",
    "zod": "^4.1.12"
  }
}
```

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

- **users** - Usuários (admin, store, user)
- **stores** - Lojas/Lojistas
- **products** - Produtos
- **categories** - Categorias de produtos
- **customers** - Dados de clientes
- **orders** - Pedidos
- **orderItems** - Itens dos pedidos
- **reviews** - Avaliações
- **deliveryZones** - Zonas de entrega
- **systemSettings** - Configurações do sistema

## 🔐 Autenticação e Autorização

- **OAuth** via Manus
- **Roles**: admin, store, user
- **Protected Procedures**: Endpoints protegidos por role
- **Session Cookies**: Persistência de sessão

## 📍 Cálculos de Entrega

### Distância (Haversine)
Utiliza a fórmula de Haversine para calcular a distância entre dois pontos geográficos com multiplicador de 0.8 para aproximar da realidade.

### Taxa de Entrega
- Até 5 km: R$ 12,00 (base)
- Acima de 5 km: R$ 12,00 + R$ 2,00 por km adicional
- Configurável por zonas de entrega

### Comissão
- Padrão: 10% do valor total do pedido
- Configurável no painel admin

## 🎨 Design

- **Tema**: Cinematográfico (azul-petróleo + laranja queimado)
- **Tipografia**: Sans-serif branca e negrita
- **Acentos**: Ciano e laranja
- **Responsividade**: Mobile-first

## 🚀 Como Executar

### Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Build

```bash
# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start
```

### Testes

```bash
# Executar testes
pnpm test
```

## 📝 Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/marketplace

# OAuth
VITE_OAUTH_PORTAL_URL=https://oauth.example.com
VITE_APP_ID=your-app-id

# Storage
BUILT_IN_FORGE_API_URL=https://storage.example.com
BUILT_IN_FORGE_API_KEY=your-api-key

# Admin
OWNER_OPEN_ID=admin-open-id
```

## 📊 Endpoints tRPC Principais

### Público
- `categories.list` - Listar categorias
- `stores.list` - Listar lojas
- `products.listAll` - Listar todos os produtos
- `products.listByStore` - Produtos por loja
- `products.listByCategory` - Produtos por categoria

### Autenticado (Cliente)
- `customers.getMe` - Dados do cliente
- `customers.create` - Criar perfil de cliente
- `customers.update` - Atualizar perfil
- `orders.create` - Criar pedido
- `orders.getByCustomer` - Pedidos do cliente
- `reviews.create` - Criar avaliação

### Autenticado (Lojista)
- `store.getSalesReport` - Relatório de vendas

### Autenticado (Admin)
- `admin.statistics` - Estatísticas gerais
- `admin.getSettings` - Configurações do sistema
- `admin.updateSettings` - Atualizar configurações
- `admin.getSalesReport` - Relatório geral de vendas

## 🧹 Limpeza e Refatoração

O projeto foi otimizado com:
- Remoção de código duplicado
- Consolidação de tipos em `shared/types.ts`
- Implementação de transações no banco de dados
- Validação com Zod em todos os endpoints
- Tratamento de erros consistente

## 📄 Licença

MIT

## 👥 Contribuindo

Para contribuir, faça um fork do projeto e envie um pull request.

## 📞 Suporte

Para suporte, abra uma issue no repositório.
