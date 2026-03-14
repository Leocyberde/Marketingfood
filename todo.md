# Marketplace Regional - TODO

## Fase 1: Banco de Dados e Backend
- [x] Criar schema do banco de dados (users, stores, products, orders, categories, reviews, delivery_zones)
- [x] Implementar migrations SQL
- [x] Criar helpers de query no server/db.ts
- [x] Implementar procedures tRPC para autenticação e roles

## Fase 2: Painel do Administrador
- [x] Dashboard com estatísticas (vendas totais, lojistas, clientes, pedidos ativos)
- [x] Página de gerenciamento de lojistas (criar, editar, remover)
- [x] Página de gerenciamento de categorias
- [x] Página de controle de taxas de entrega
- [ ] Página de relatórios exportáveis (CSV, PDF)
- [ ] Página de configurações gerais do sistema
- [x] Implementar cálculo automático de comissão de 10%

## Fase 3: Painel do Lojista
- [x] Página de cadastro e gerenciamento de produtos
- [x] Página de visualização de pedidos recebidos
- [x] Página de atualização de status do pedido
- [ ] Página de controle de estoque
- [ ] Página de relatórios de vendas (com valor líquido)
- [ ] Página de configuração de endereço da loja
- [ ] Integração com mapa para visualizar zona de cobertura

## Fase 4: Painel do Cliente
- [x] Página de catálogo de produtos por categoria
- [x] Página de catálogo de produtos por lojista
- [ ] Página de carrinho de compras
- [ ] Página de checkout com cálculo de frete (Haversine)
- [ ] Página de histórico de pedidos
- [ ] Página de perfil do cliente
- [ ] Sistema de avaliação de lojistas e produtos
- [ ] Integração com mapa para visualizar lojas próximas

## Fase 5: Funcionalidades Transversais
- [x] Implementar cálculo de distância via Haversine
- [x] Implementar cálculo de taxa de entrega
- [x] Implementar sistema de comissões (10%)
- [ ] Implementar upload de imagens de produtos
- [ ] Implementar sistema de notificações
- [ ] Implementar paginação e filtros

## Fase 6: Design e Estilo Visual
- [x] Aplicar tema cinematográfico (azul-petróleo + laranja queimado)
- [x] Configurar tipografia sans-serif branca e negrita
- [x] Adicionar acentos geométricos em ciano e laranja
- [x] Implementar responsividade em todos os painéis
- [ ] Testar em diferentes resoluções

## Fase 7: Testes e Validação
- [ ] Escrever testes unitários com Vitest
- [ ] Validar fluxos de autenticação
- [ ] Validar cálculos de frete e comissão
- [ ] Testar upload de imagens
- [ ] Testar relatórios (CSV, PDF)
- [ ] Validar responsividade

## Fase 8: Entrega
- [ ] Criar checkpoint final
- [ ] Gerar link público
- [ ] Documentar funcionalidades
