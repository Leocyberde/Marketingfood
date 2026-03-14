import { useState } from "react";
import { useNavigate } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, Star } from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-300", icon: Clock },
  preparing: { label: "Preparando", color: "bg-blue-500/20 text-blue-300", icon: Truck },
  sent: { label: "Enviado", color: "bg-cyan-500/20 text-cyan-300", icon: Truck },
  delivered: { label: "Entregue", color: "bg-green-500/20 text-green-300", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-500/20 text-red-300", icon: XCircle },
};

export default function ClientOrders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  // Fetch customer orders
  const { data: orders, isLoading } = trpc.orders.getByCustomer.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch order items for selected order
  const { data: orderItems } = trpc.orders.getItems.useQuery(
    { orderId: selectedOrder! },
    { enabled: !!selectedOrder }
  );

  // Fetch store info for selected order
  const selectedOrderData = orders?.find((o) => o.id === selectedOrder);
  const { data: store } = trpc.stores.getById.useQuery(
    { id: selectedOrderData?.storeId! },
    { enabled: !!selectedOrderData }
  );

  const handleRateOrder = (orderId: number) => {
    navigate(`/rate-order/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/catalog")}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao catálogo
        </button>

        <h1 className="text-3xl font-black text-white mb-8">Meus Pedidos</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-xl font-bold text-cyan-500">Carregando pedidos...</div>
          </div>
        ) : !orders || orders.length === 0 ? (
          <Card className="card-cinematic">
            <CardContent className="py-20 text-center">
              <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-bold">Nenhum pedido realizado</p>
              <p className="text-slate-500 text-sm mb-6">Comece a comprar agora!</p>
              <Button className="btn-primary" onClick={() => navigate("/catalog")}>
                Ir ao catálogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-2 space-y-4">
              {orders.map((order) => {
                const config = statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = config.icon;
                const createdDate = new Date(order.createdAt).toLocaleDateString("pt-BR");

                return (
                  <Card
                    key={order.id}
                    className={`card-cinematic cursor-pointer transition-all ${
                      selectedOrder === order.id ? "border-cyan-500/60" : ""
                    }`}
                    onClick={() => setSelectedOrder(order.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-white font-bold text-lg">Pedido #{order.id}</span>
                            <Badge className={config.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm mb-2">{createdDate}</p>
                          <p className="text-orange-400 font-bold">R$ {Number(order.total).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-sm">Distância</p>
                          <p className="text-cyan-400 font-semibold">
                            {order.deliveryDistance?.toFixed(1) || "N/A"} km
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Details */}
            {selectedOrder && selectedOrderData && (
              <div className="lg:col-span-1">
                <Card className="card-cinematic sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Detalhes do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Store Info */}
                    {store && (
                      <div className="bg-slate-800/40 rounded-lg p-3 mb-4">
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">Loja</p>
                        <p className="text-white font-semibold">{store.name}</p>
                        <p className="text-slate-400 text-sm">{store.address}</p>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-bold mb-2">Itens</p>
                      <div className="space-y-2">
                        {orderItems?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-slate-300">
                              {item.quantity}x {item.productId}
                            </span>
                            <span className="text-orange-400 font-semibold">
                              R$ {(Number(item.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t border-slate-700 pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="text-white">R$ {Number(selectedOrderData.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Frete</span>
                        <span className="text-green-400">R$ {Number(selectedOrderData.deliveryFee).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-700 pt-2 font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-orange-400 text-lg">R$ {Number(selectedOrderData.total).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {selectedOrderData.status === "delivered" && (
                      <Button
                        className="w-full h-10 text-sm font-bold btn-primary"
                        onClick={() => handleRateOrder(selectedOrderData.id)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Avaliar Pedido
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
