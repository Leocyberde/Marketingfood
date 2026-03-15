import { useState } from "react";
import { useLojista } from "@/lib/store";
import {
  useListStores,
  useListStoreProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListStoreOrders,
  useUpdateOrderStatus,
} from "@workspace/api-client-react";
import {
  Store,
  Package,
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  LayoutDashboard,
  TrendingUp,
  BadgePercent,
  ChevronRight,
  X,
  ImageIcon,
  CheckCircle2,
  Clock,
  ChefHat,
  Truck,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COMMISSION_RATE = 0.10;

const productSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().min(5, "Descrição obrigatória"),
  price: z.coerce.number().min(0.01, "Preço inválido"),
  stock: z.coerce.number().int().min(0, "Estoque inválido"),
  imageUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
  isAvailable: z.boolean().default(true),
});
type ProductForm = z.infer<typeof productSchema>;

type Tab = "dashboard" | "orders" | "products";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Pendente",      color: "bg-yellow-100 text-yellow-800 border-yellow-200",  icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed: { label: "Confirmado",    color: "bg-blue-100 text-blue-800 border-blue-200",        icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  preparing: { label: "Em Preparação", color: "bg-orange-100 text-orange-800 border-orange-200",  icon: <ChefHat className="w-3.5 h-3.5" /> },
  ready:     { label: "Pronto",        color: "bg-green-100 text-green-800 border-green-200",     icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  delivered: { label: "Entregue",      color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <Truck className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelado",     color: "bg-red-100 text-red-800 border-red-200",           icon: <XCircle className="w-3.5 h-3.5" /> },
};

function fmt(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function StoreSelector() {
  const { data: stores, isLoading } = useListStores();
  const setStoreId = useLojista((s) => s.setStoreId);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">
        Carregando lojas...
      </div>
    );

  return (
    <div className="max-w-lg mx-auto text-center space-y-8 mt-16 px-4">
      <div className="w-20 h-20 mx-auto bg-secondary/15 rounded-2xl flex items-center justify-center">
        <Store className="w-10 h-10 text-secondary" />
      </div>
      <div>
        <h1 className="text-3xl font-black">Selecione sua Loja</h1>
        <p className="text-muted-foreground mt-2">
          Escolha qual loja você gerencia para acessar o painel.
        </p>
      </div>
      <div className="grid gap-3 text-left">
        {stores?.map((store) => (
          <button
            key={store.id}
            onClick={() => setStoreId(store.id)}
            className="p-5 bg-white rounded-2xl border border-border hover:border-secondary hover:shadow-md transition-all text-left flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-lg">{store.name}</h3>
              <p className="text-muted-foreground text-sm">{store.address}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function LojistaDashboard() {
  const { selectedStoreId, setStoreId } = useLojista();
  const [tab, setTab] = useState<Tab>("dashboard");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const { data: stores } = useListStores();
  const currentStore = stores?.find((s) => s.id === selectedStoreId);

  const { data: products } = useListStoreProducts(selectedStoreId || 0, {
    query: { enabled: !!selectedStoreId },
  });
  const { data: orders } = useListStoreOrders(selectedStoreId || 0, {
    query: { enabled: !!selectedStoreId, refetchInterval: 15000 },
  });

  const createProduct = useCreateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/stores", selectedStoreId, "products"] });
        setIsProductModalOpen(false);
        toast({ title: "Produto salvo com sucesso!" });
      },
    },
  });
  const updateProduct = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/stores", selectedStoreId, "products"] });
        setIsProductModalOpen(false);
        toast({ title: "Produto atualizado!" });
      },
    },
  });
  const deleteProduct = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/stores", selectedStoreId, "products"] });
        toast({ title: "Produto excluído." });
      },
    },
  });
  const updateStatus = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/stores", selectedStoreId, "orders"] });
        toast({ title: "Status atualizado!" });
      },
    },
  });

  const form = useForm<ProductForm>({ resolver: zodResolver(productSchema) });

  const openNewProduct = () => {
    setEditingProduct(null);
    form.reset({ name: "", description: "", price: 0, stock: 0, imageUrl: "", isAvailable: true });
    setIsProductModalOpen(true);
  };

  const openEditProduct = (p: any) => {
    setEditingProduct(p);
    form.reset({
      name: p.name,
      description: p.description,
      price: Number(p.price),
      stock: p.stock,
      imageUrl: p.imageUrl || "",
      isAvailable: p.isAvailable,
    });
    setIsProductModalOpen(true);
  };

  const onProductSubmit = (data: ProductForm) => {
    const payload = { ...data, imageUrl: data.imageUrl || undefined };
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: payload });
    } else {
      createProduct.mutate({ storeId: selectedStoreId!, data: payload });
    }
  };

  if (!selectedStoreId) return <StoreSelector />;

  // Commission calculations
  const deliveredOrders = orders?.filter((o) => o.status === "delivered") ?? [];
  const pendingOrders   = orders?.filter((o) => o.status === "pending") ?? [];
  const activeOrders    = orders?.filter((o) => !["delivered", "cancelled"].includes(o.status)) ?? [];

  const grossRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const commission   = grossRevenue * COMMISSION_RATE;
  const netRevenue   = grossRevenue - commission;

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard",  icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "orders",    label: "Pedidos",    icon: <ClipboardList className="w-5 h-5" /> },
    { id: "products",  label: "Produtos",   icon: <Package className="w-5 h-5" /> },
  ];

  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)]">
      {/* LEFT SIDEBAR */}
      <aside className="w-60 shrink-0 flex flex-col gap-2">
        {/* Store info */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary font-black text-lg shrink-0">
              {currentStore?.name?.[0] ?? "L"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{currentStore?.name ?? "Minha Loja"}</p>
              <button
                onClick={() => setStoreId(null)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Trocar de loja
              </button>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="bg-white rounded-2xl border border-border p-2 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left ${
                tab === item.id
                  ? "bg-secondary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
              {item.id === "orders" && pendingOrders.length > 0 && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-black ${tab === "orders" ? "bg-white/20 text-white" : "bg-yellow-100 text-yellow-800"}`}>
                  {pendingOrders.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Commission info card */}
        <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <BadgePercent className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Comissão</span>
          </div>
          <p className="text-2xl font-black text-secondary">10%</p>
          <p className="text-xs text-muted-foreground mt-1">por venda realizada</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 space-y-6">

        {/* ── DASHBOARD TAB ── */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black">Dashboard</h1>
              <p className="text-muted-foreground text-sm">Resumo financeiro e de desempenho</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">Receita Bruta</span>
                </div>
                <p className="text-2xl font-black">R$ {fmt(grossRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">{deliveredOrders.length} pedidos entregues</p>
              </div>

              <div className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                    <BadgePercent className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">Comissão (10%)</span>
                </div>
                <p className="text-2xl font-black text-red-500">- R$ {fmt(commission)}</p>
                <p className="text-xs text-muted-foreground mt-1">Retido pela plataforma</p>
              </div>

              <div className="bg-secondary/10 border border-secondary/25 rounded-2xl p-5 sm:col-span-2 xl:col-span-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-secondary/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-sm font-bold text-secondary">Receita Líquida</span>
                </div>
                <p className="text-2xl font-black text-secondary">R$ {fmt(netRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">Após dedução de comissão</p>
              </div>
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Pedidos Ativos",   value: activeOrders.length,   color: "text-orange-500" },
                { label: "Pendentes",         value: pendingOrders.length,  color: "text-yellow-600" },
                { label: "Produtos",          value: products?.length ?? 0, color: "text-blue-500" },
                { label: "Disponíveis",       value: products?.filter(p => p.isAvailable).length ?? 0, color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-border p-4 text-center">
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-bold">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Commission explanation */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-secondary" /> Como funciona a comissão
              </h3>
              <div className="flex items-center gap-3 flex-wrap text-sm">
                <span className="px-3 py-2 bg-blue-50 rounded-xl font-bold text-blue-700">Valor da Venda</span>
                <span className="text-muted-foreground font-bold">×</span>
                <span className="px-3 py-2 bg-red-50 rounded-xl font-bold text-red-600">10% comissão</span>
                <span className="text-muted-foreground font-bold">=</span>
                <span className="px-3 py-2 bg-secondary/10 rounded-xl font-bold text-secondary">90% para você</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                A comissão é cobrada apenas sobre pedidos com status <strong>Entregue</strong>. Pedidos cancelados não geram comissão.
              </p>
            </div>

            {/* Recent orders preview */}
            {activeOrders.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Pedidos Recentes</h3>
                  <button onClick={() => setTab("orders")} className="text-sm text-secondary hover:underline font-bold">
                    Ver todos →
                  </button>
                </div>
                <div className="space-y-3">
                  {activeOrders.slice(0, 3).map((order) => {
                    const cfg = statusConfig[order.status] ?? statusConfig.pending;
                    return (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm text-muted-foreground">#{order.id}</span>
                          <div>
                            <p className="font-bold text-sm">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.items.length} item(s)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm">R$ {fmt(Number(order.total))}</span>
                          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Pedidos</h2>
                <p className="text-sm text-muted-foreground">Gerencie e atualize o status dos pedidos</p>
              </div>
              {activeOrders.length > 0 && (
                <span className="bg-yellow-100 text-yellow-800 font-black text-sm px-3 py-1.5 rounded-xl border border-yellow-200">
                  {pendingOrders.length} pendente(s)
                </span>
              )}
            </div>

            {orders?.length === 0 && (
              <div className="bg-white rounded-2xl border border-border p-16 text-center text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-bold">Nenhum pedido recebido ainda.</p>
              </div>
            )}

            <div className="space-y-4">
              {orders?.map((order) => {
                const cfg = statusConfig[order.status] ?? statusConfig.pending;
                const gross = Number(order.total);
                const net   = gross * (1 - COMMISSION_RATE);
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-border p-6">
                    {/* Header row */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-muted-foreground">#{order.id}</span>
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </span>
                      </div>

                      {/* Status selector */}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus.mutate({ id: order.id, data: { status: e.target.value as any } })
                        }
                        className="px-4 py-2 rounded-xl bg-muted/40 border border-border focus:ring-2 focus:ring-secondary/30 outline-none text-sm font-bold"
                      >
                        <option value="pending">Pendente</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="preparing">Em Preparação</option>
                        <option value="ready">Pronto</option>
                        <option value="delivered">Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>

                    {/* Customer info */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Cliente</p>
                        <p className="font-bold">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                        <p className="text-sm text-muted-foreground">{order.customerAddress}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Itens</p>
                        <ul className="space-y-0.5">
                          {order.items.map((item, i) => (
                            <li key={i} className="text-sm">
                              <span className="font-bold text-secondary">{item.quantity}×</span>{" "}
                              {item.productName}
                              <span className="text-muted-foreground ml-1">
                                (R$ {fmt(Number(item.unitPrice))})
                              </span>
                            </li>
                          ))}
                        </ul>
                        {order.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">Obs: {order.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Financial breakdown */}
                    <div className="border-t border-border pt-4 flex flex-wrap gap-6">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Valor Bruto</p>
                        <p className="text-lg font-black">R$ {fmt(gross)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Comissão (10%)</p>
                        <p className="text-lg font-black text-red-500">- R$ {fmt(gross * COMMISSION_RATE)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-secondary uppercase tracking-wider">Valor Líquido</p>
                        <p className="text-lg font-black text-secondary">R$ {fmt(net)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {tab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Produtos</h2>
                <p className="text-sm text-muted-foreground">Gerencie o catálogo da sua loja</p>
              </div>
              <button
                onClick={openNewProduct}
                className="btn-secondary-gradient px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm"
              >
                <Plus className="w-4 h-4" /> Novo Produto
              </button>
            </div>

            {products?.length === 0 && (
              <div className="bg-white rounded-2xl border border-border p-16 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-bold mb-2">Nenhum produto cadastrado.</p>
                <button onClick={openNewProduct} className="text-secondary hover:underline text-sm font-bold">
                  Adicionar primeiro produto →
                </button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products?.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col">
                  {/* Image */}
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-40 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted/40 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold leading-tight">{p.name}</h3>
                      <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-bold ${p.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.isAvailable ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{p.description}</p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-black text-primary">R$ {Number(p.price).toFixed(2).replace(".", ",")}</p>
                        <p className="text-xs text-muted-foreground">Estoque: {p.stock}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditProduct(p)}
                          className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Excluir "${p.name}"?`)) deleteProduct.mutate({ id: p.id }); }}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── PRODUCT MODAL ── */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(onProductSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">
                  Nome do Produto *
                </label>
                <input
                  {...form.register("name")}
                  placeholder="Ex: Fone Bluetooth Premium"
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">
                  Descrição *
                </label>
                <textarea
                  {...form.register("description")}
                  rows={3}
                  placeholder="Descreva o produto brevemente..."
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("price")}
                    placeholder="0,00"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition"
                  />
                  {form.formState.errors.price && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {form.formState.errors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">
                    Estoque *
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...form.register("stock")}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition"
                  />
                  {form.formState.errors.stock && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {form.formState.errors.stock.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1">
                  URL da Imagem (opcional)
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    {...form.register("imageUrl")}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition"
                  />
                </div>
                {form.formState.errors.imageUrl && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>

              {/* Availability */}
              <label className="flex items-center gap-3 cursor-pointer select-none mt-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  {...form.register("isAvailable")}
                  className="w-4 h-4 rounded accent-secondary"
                />
                <div>
                  <p className="font-bold text-sm">Disponível para venda</p>
                  <p className="text-xs text-muted-foreground">O produto aparecerá para os clientes</p>
                </div>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="flex-1 btn-secondary-gradient px-4 py-3 rounded-xl font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createProduct.isPending || updateProduct.isPending ? "Salvando..." : "Salvar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
