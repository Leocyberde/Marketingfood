import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Clock, Truck, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  preparing: "bg-blue-500",
  sent: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  preparing: "Em Preparação",
  sent: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  preparing: ShoppingCart,
  sent: Truck,
  delivered: CheckCircle,
  cancelled: Clock,
};

export default function StoreOrders() {
  const { user } = useAuth();
  const { data: orders, isLoading, refetch } = trpc.orders.listByStore.useQuery();

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do pedido atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({
      id: orderId,
      status: newStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="flex-center min-h-screen">
        <div className="text-2xl font-bold text-cyan-500">Carregando...</div>
      </div>
    );
  }

  const statuses = ["pending", "preparing", "sent", "delivered"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-2">Pedidos Recebidos</h1>
          <p className="text-cyan-400">Total: {orders?.length || 0} pedidos</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders?.map((order) => {
            const StatusIcon = statusIcons[order.status] || Clock;
            return (
              <Card key={order.id} className="card-cinematic">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg font-bold text-white">Pedido #{order.id}</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-6 h-6 text-cyan-500" />
                    <Badge className={`${statusColors[order.status]} text-white`}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-muted-foreground text-xs">Subtotal</p>
                      <p className="text-white font-bold">R$ {Number(order.subtotal).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Frete</p>
                      <p className="text-white font-bold">R$ {Number(order.deliveryFee).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Comissão (10%)</p>
                      <p className="text-orange-400 font-bold">-R$ {Number(order.commission).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Total</p>
                      <p className="text-cyan-400 font-bold">R$ {Number(order.total).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-background bg-opacity-50 rounded-lg p-4">
                    <p className="text-muted-foreground text-xs mb-2">Distância de Entrega</p>
                    <p className="text-white font-bold">{order.deliveryDistance?.toFixed(2)} km</p>
                  </div>

                  {/* Status Update */}
                  <div className="flex gap-2 flex-wrap">
                    {statuses.map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={order.status === status ? "default" : "outline"}
                        onClick={() => handleStatusChange(order.id, status)}
                        className={order.status === status ? "btn-primary" : ""}
                      >
                        {statusLabels[status]}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {orders?.length === 0 && (
          <Card className="card-cinematic text-center py-12">
            <p className="text-2xl font-bold text-muted-foreground">Nenhum pedido recebido</p>
            <p className="text-muted-foreground mt-2">Os pedidos dos clientes aparecerão aqui</p>
          </Card>
        )}
      </div>
    </div>
  );
}
