import { useState } from "react";
import { useLojista } from "@/lib/store";
import { useListStores, useListStoreProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useListStoreOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Store, Package, ClipboardList, Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const productSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().min(5, "Descrição obrigatória"),
  price: z.coerce.number().min(0.01, "Preço inválido"),
  stock: z.coerce.number().int().min(0, "Estoque inválido"),
  isAvailable: z.boolean().default(true),
});
type ProductForm = z.infer<typeof productSchema>;

function StoreSelector() {
  const { data: stores, isLoading } = useListStores();
  const setStoreId = useLojista(s => s.setStoreId);

  if (isLoading) return <div className="text-center p-20 animate-pulse">Carregando lojas...</div>;

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 mt-12">
      <Store className="w-20 h-20 mx-auto text-secondary/50" />
      <h1 className="text-3xl font-black">Selecione sua Loja</h1>
      <p className="text-muted-foreground">Para acessar o painel do lojista, escolha qual loja você gerencia.</p>
      
      <div className="grid gap-4">
        {stores?.map(store => (
          <button
            key={store.id}
            onClick={() => setStoreId(store.id)}
            className="p-6 bg-white rounded-2xl border border-border card-hover text-left flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xl">{store.name}</h3>
              <p className="text-muted-foreground text-sm">{store.address}</p>
            </div>
            <span className="btn-secondary-gradient px-6 py-2 rounded-xl text-sm">Entrar</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LojistaDashboard() {
  const { selectedStoreId, setStoreId } = useLojista();
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { data: products } = useListStoreProducts(selectedStoreId || 0, { query: { enabled: !!selectedStoreId } });
  const { data: orders } = useListStoreOrders(selectedStoreId || 0, { query: { enabled: !!selectedStoreId, refetchInterval: 10000 } });

  const createProduct = useCreateProduct({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/stores", selectedStoreId, "products"] }); setIsProductModalOpen(false); toast({title:"Produto salvo"}); } }});
  const updateProduct = useUpdateProduct({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/stores", selectedStoreId, "products"] }); setIsProductModalOpen(false); toast({title:"Produto atualizado"}); } }});
  const deleteProduct = useDeleteProduct({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/stores", selectedStoreId, "products"] }); toast({title:"Produto excluído"}); } }});
  const updateStatus = useUpdateOrderStatus({ mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/stores", selectedStoreId, "orders"] }); } }});

  const form = useForm<ProductForm>({ resolver: zodResolver(productSchema) });

  const openNewProduct = () => {
    setEditingProduct(null);
    form.reset({ name: "", description: "", price: 0, stock: 0, isAvailable: true });
    setIsProductModalOpen(true);
  };

  const openEditProduct = (p: any) => {
    setEditingProduct(p);
    form.reset(p);
    setIsProductModalOpen(true);
  };

  const onProductSubmit = (data: ProductForm) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data });
    } else {
      createProduct.mutate({ storeId: selectedStoreId!, data });
    }
  };

  if (!selectedStoreId) return <StoreSelector />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/20 text-secondary rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Painel do Lojista</h1>
            <button onClick={() => setStoreId(null)} className="text-sm text-muted-foreground hover:underline">
              Sair / Trocar de loja
            </button>
          </div>
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-2xl w-full sm:w-auto">
          <button 
            onClick={() => setTab('orders')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'orders' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <ClipboardList className="w-4 h-4 inline mr-2 mb-0.5" /> Pedidos
          </button>
          <button 
            onClick={() => setTab('products')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'products' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Package className="w-4 h-4 inline mr-2 mb-0.5" /> Produtos
          </button>
        </div>
      </div>

      {tab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Gerenciar Pedidos</h2>
          <div className="grid gap-4">
            {orders?.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-2xl border border-border flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-lg">#{order.id}</span>
                    <span className="text-muted-foreground text-sm">{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</span>
                  </div>
                  <p className="font-bold">{order.customerName} <span className="text-muted-foreground font-normal">({order.customerPhone})</span></p>
                  <p className="text-sm text-muted-foreground">{order.customerAddress}</p>
                  <div className="text-sm mt-2">
                    <strong className="text-foreground">Itens:</strong> {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                  </div>
                  <p className="font-black text-primary mt-2">R$ {Number(order.total).toFixed(2).replace('.', ',')}</p>
                </div>
                
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Status</span>
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus.mutate({ id: order.id, data: { status: e.target.value as any } })}
                    className="px-4 py-3 rounded-xl bg-muted/30 border border-border focus:ring-2 outline-none font-bold min-w-[200px]"
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="preparing">Preparando</option>
                    <option value="ready">Pronto</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            ))}
            {orders?.length === 0 && <div className="text-center py-10 text-muted-foreground">Nenhum pedido recebido ainda.</div>}
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Catálogo de Produtos</h2>
            <button onClick={openNewProduct} className="btn-secondary-gradient px-6 py-2.5 rounded-xl flex items-center gap-2">
              <Plus className="w-4 h-4" /> Novo Produto
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-bold">Produto</th>
                  <th className="p-4 font-bold">Preço</th>
                  <th className="p-4 font-bold">Estoque</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products?.map(p => (
                  <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-bold">{p.name}</td>
                    <td className="p-4 text-primary font-black">R$ {Number(p.price).toFixed(2).replace('.', ',')}</td>
                    <td className="p-4">{p.stock}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {p.isAvailable ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button onClick={() => openEditProduct(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => { if(confirm('Excluir?')) deleteProduct.mutate({id: p.id})}} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products?.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhum produto cadastrado.</div>}
          </div>
        </div>
      )}

      {/* Product Modal overlay */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black mb-6">{editingProduct ? 'Editar' : 'Novo'} Produto</h2>
            <form onSubmit={form.handleSubmit(onProductSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Nome</label>
                <input {...form.register("name")} className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:border-secondary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Descrição</label>
                <textarea {...form.register("description")} className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:border-secondary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Preço (R$)</label>
                  <input type="number" step="0.01" {...form.register("price")} className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:border-secondary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Estoque</label>
                  <input type="number" {...form.register("stock")} className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:border-secondary outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-4 font-bold text-sm cursor-pointer">
                <input type="checkbox" {...form.register("isAvailable")} className="w-5 h-5 rounded text-secondary" />
                Disponível para venda
              </label>
              
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold bg-muted text-muted-foreground hover:bg-muted/80">Cancelar</button>
                <button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="flex-1 btn-secondary-gradient px-4 py-3 rounded-xl">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
