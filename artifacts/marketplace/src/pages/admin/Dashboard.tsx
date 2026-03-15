import { useState } from "react";
import { useGetAdminStats, useListStores, useCreateStore, useListCategories } from "@workspace/api-client-react";
import { Store, TrendingUp, Package, ClipboardList, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const storeSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().min(5, "Descrição obrigatória"),
  address: z.string().min(5, "Endereço obrigatório"),
  phone: z.string().min(8, "Telefone obrigatório"),
  categoryId: z.coerce.number().min(1, "Categoria obrigatória"),
});
type StoreForm = z.infer<typeof storeSchema>;

export function AdminDashboard() {
  const { data: stats } = useGetAdminStats();
  const { data: stores } = useListStores();
  const { data: categories } = useListCategories();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const createStore = useCreateStore({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        setIsStoreModalOpen(false);
        toast({ title: "Loja criada com sucesso!" });
      }
    }
  });

  const form = useForm<StoreForm>({ resolver: zodResolver(storeSchema) });

  const onStoreSubmit = (data: StoreForm) => {
    createStore.mutate({ data });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-foreground" />
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground">Visão global do marketplace</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Receita Total", value: `R$ ${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Lojas Ativas", value: stats?.activeStores || 0, icon: Store, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total de Produtos", value: stats?.totalProducts || 0, icon: Package, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Pedidos Pendentes", value: stats?.pendingOrders || 0, icon: ClipboardList, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-black text-foreground">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stores Management */}
      <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
          <h2 className="text-xl font-bold">Lojas da Plataforma</h2>
          <button 
            onClick={() => { form.reset(); setIsStoreModalOpen(true); }}
            className="bg-foreground text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Loja
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Loja</th>
                <th className="p-4 font-bold">Categoria</th>
                <th className="p-4 font-bold">Cadastro</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stores?.map(s => (
                <tr key={s.id} className="hover:bg-muted/10">
                  <td className="p-4 text-muted-foreground">#{s.id}</td>
                  <td className="p-4 font-bold">
                    {s.name}
                    <div className="text-xs font-normal text-muted-foreground">{s.phone}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold">{s.categoryName || `Cat ${s.categoryId}`}</span>
                  </td>
                  <td className="p-4 text-sm">{format(new Date(s.createdAt), "dd/MM/yyyy")}</td>
                  <td className="p-4">
                    <span className={`w-3 h-3 inline-block rounded-full mr-2 ${s.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-bold text-muted-foreground">{s.isOpen ? 'Aberto' : 'Fechado'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Store Modal */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black mb-6">Cadastrar Nova Loja</h2>
            <form onSubmit={form.handleSubmit(onStoreSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Nome da Loja</label>
                <input {...form.register("name")} className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:border-foreground outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Categoria</label>
                <select {...form.register("categoryId")} className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:border-foreground outline-none">
                  <option value="">Selecione...</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Telefone</label>
                <input {...form.register("phone")} className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:border-foreground outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Endereço</label>
                <input {...form.register("address")} className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:border-foreground outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">Descrição</label>
                <textarea {...form.register("description")} rows={2} className="w-full px-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:border-foreground outline-none" />
              </div>
              
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsStoreModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold bg-muted text-muted-foreground hover:bg-muted/80">Cancelar</button>
                <button type="submit" disabled={createStore.isPending} className="flex-1 bg-foreground text-white px-4 py-3 rounded-xl font-bold">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
