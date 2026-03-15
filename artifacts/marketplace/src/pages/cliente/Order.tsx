import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { ArrowLeft, CheckCircle2, Clock, Truck, ChefHat, CheckSquare, XCircle } from "lucide-react";

const STATUS_MAP: Record<string, { icon: any, text: string, color: string, progress: number }> = {
  pending: { icon: Clock, text: "Aguardando Confirmação", color: "text-yellow-500", progress: 10 },
  confirmed: { icon: CheckSquare, text: "Pedido Confirmado", color: "text-blue-500", progress: 30 },
  preparing: { icon: ChefHat, text: "Preparando", color: "text-orange-500", progress: 50 },
  ready: { icon: CheckCircle2, text: "Pronto para Entrega", color: "text-teal-500", progress: 75 },
  delivered: { icon: Truck, text: "Entregue", color: "text-green-500", progress: 100 },
  cancelled: { icon: XCircle, text: "Cancelado", color: "text-red-500", progress: 0 },
};

export function ClienteOrder() {
  const { id } = useParams();
  const { data: order, isLoading } = useGetOrder(parseInt(id || "0", 10), { 
    query: { refetchInterval: 5000 } // Poll every 5s for status updates
  });

  if (isLoading) return <div className="text-center p-20 animate-pulse">Carregando pedido...</div>;
  if (!order) return <div className="text-center p-20">Pedido não encontrado</div>;

  const currentStatus = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/cliente" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para o Início
      </Link>

      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-border overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-muted">
          <div 
            className={`h-full transition-all duration-1000 ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-primary'}`} 
            style={{ width: `${currentStatus.progress}%` }} 
          />
        </div>

        <div className="text-center space-y-6 mt-4">
          <div className={`w-24 h-24 mx-auto rounded-full bg-muted/30 flex items-center justify-center ${currentStatus.color}`}>
            <StatusIcon className="w-12 h-12" />
          </div>
          
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">Pedido #{order.id}</h1>
            <p className={`text-xl font-bold ${currentStatus.color}`}>{currentStatus.text}</p>
            <p className="text-muted-foreground mt-2">em {order.storeName}</p>
          </div>
        </div>

        <div className="mt-12 bg-muted/20 rounded-2xl p-6 border border-border">
          <h3 className="font-bold text-lg mb-4 border-b border-border pb-2">Detalhes da Entrega</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-muted-foreground font-semibold">Nome</span>
              <span className="font-bold">{order.customerName}</span>
            </div>
            <div>
              <span className="block text-muted-foreground font-semibold">Telefone</span>
              <span className="font-bold">{order.customerPhone}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-muted-foreground font-semibold">Endereço</span>
              <span className="font-bold">{order.customerAddress}</span>
            </div>
            {order.notes && (
              <div className="sm:col-span-2">
                <span className="block text-muted-foreground font-semibold">Observações</span>
                <span className="font-bold">{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-lg mb-4">Resumo</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span><span className="font-bold text-primary">{item.quantity}x</span> {item.productName}</span>
                <span className="font-bold text-muted-foreground">R$ {Number(item.subtotal).toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
            <div className="pt-4 mt-4 border-t border-border flex justify-between items-center text-lg">
              <span className="font-bold">Total</span>
              <span className="font-black text-foreground">R$ {Number(order.total).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
