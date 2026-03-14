import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, ShoppingBag, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: Clock },
  preparing: { label: "Em Preparação", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: ShoppingBag },
  sent: { label: "Enviado", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: Truck },
  delivered: { label: "Entregue", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: XCircle },
};

const NEXT_STATUS: Record<string, string> = {
  pending: "preparing",
  preparing: "sent",
  sent: "delivered",
};

export default function StoreOrders() {
  const { data: store } = trpc.stores.getFirst.useQuery();
  const { data: orders, isLoading, refetch } = trpc.orders.getByStore.useQuery(
    { storeId: store?.id || 0 },
    { enabled: !!store?.id }
  );

  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); refetch(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const handleAdvance = (orderId: number, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    updateStatus.mutate({ id: orderId, status: next as any });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/"><Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-1"><Home className="w-4 h-4" /></Button></Link>
          <h1 className="text-4xl font-black text-white">Pedidos Recebidos</h1>
        </div>
        <p className="text-orange-400 mb-10 ml-10">{store?.name} — {orders?.length || 0} pedidos</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="text-xl font-bold text-cyan-500">Carregando...</div></div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              const next = NEXT_STATUS[order.status];
              return (
                <Card key={order.id} className="card-cinematic">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-white">Pedido #{order.id}</CardTitle>
                        <Badge className={`border ${cfg.color} flex items-center gap-1`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </Badge>
                      </div>
                      <span className="text-slate-400 text-sm">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-400">Subtotal: <span className="text-white">R$ {Number(order.subtotal).toFixed(2)}</span></span>
                          <span className="text-slate-400">Frete: <span className="text-white">R$ {Number(order.deliveryFee).toFixed(2)}</span></span>
                        </div>
                        <p className="text-cyan-400 font-black text-xl">Total: R$ {Number(order.total).toFixed(2)}</p>
                      </div>
                      {next && (
                        <Button
                          className="btn-primary text-sm"
                          onClick={() => handleAdvance(order.id, order.status)}
                          disabled={updateStatus.isPending}
                        >
                          Avançar → {STATUS_CONFIG[next]?.label}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="card-cinematic text-center py-16">
            <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-2xl font-bold text-slate-400">Nenhum pedido ainda</p>
            <p className="text-slate-500 mt-2">Os pedidos aparecerão aqui quando forem feitos</p>
          </Card>
        )}
      </div>
    </div>
  );
}
