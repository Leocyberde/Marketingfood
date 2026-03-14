import { useState } from "react";
import { useNavigate, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";

export default function ClientRateOrder() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });

  const [storeRating, setStoreRating] = useState(5);
  const [storeComment, setStoreComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch order data
  const { data: order } = trpc.orders.getById.useQuery(
    { id: Number(orderId) },
    { enabled: !!orderId && isAuthenticated }
  );

  // Fetch order items
  const { data: orderItems } = trpc.orders.getItems.useQuery(
    { orderId: Number(orderId) },
    { enabled: !!orderId }
  );

  // Fetch store
  const { data: store } = trpc.stores.getById.useQuery(
    { id: order?.storeId! },
    { enabled: !!order }
  );

  // Create review mutation
  const createReviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Avaliação enviada com sucesso!");
      navigate("/orders");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar avaliação");
    },
  });

  const handleSubmitReview = async () => {
    if (!order) return;

    setIsSubmitting(true);
    try {
      await createReviewMutation.mutateAsync({
        orderId: order.id,
        storeId: order.storeId,
        rating: storeRating,
        comment: storeComment || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order || !store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg font-bold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos pedidos
        </button>

        <h1 className="text-3xl font-black text-white mb-8">Avaliar Pedido</h1>

        {/* Order Summary */}
        <Card className="card-cinematic mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-white">Pedido #{order.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-800/40 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Loja</p>
              <p className="text-white font-bold text-lg">{store.name}</p>
              <p className="text-slate-400 text-sm">{store.address}</p>
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">Itens do pedido:</p>
              <div className="space-y-2">
                {orderItems?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-300">{item.quantity}x Produto #{item.productId}</span>
                    <span className="text-orange-400">R$ {(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <p className="text-white font-bold">Total: R$ {Number(order.total).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Rating Form */}
        <Card className="card-cinematic">
          <CardHeader>
            <CardTitle className="text-lg text-white">Sua Avaliação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Store Rating */}
            <div>
              <label className="block text-white font-semibold mb-3">Como foi sua experiência com a loja?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setStoreRating(rating)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating <= storeRating
                          ? "fill-orange-400 text-orange-400"
                          : "text-slate-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-slate-400 text-sm mt-2">
                {["Péssimo", "Ruim", "Neutro", "Bom", "Excelente"][storeRating - 1]}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-white font-semibold mb-2">Comentário (opcional)</label>
              <Textarea
                placeholder="Compartilhe sua experiência..."
                value={storeComment}
                onChange={(e) => setStoreComment(e.target.value)}
                className="bg-slate-800/60 border-slate-700 text-white min-h-24"
              />
            </div>

            {/* Submit Button */}
            <Button
              className="w-full h-12 text-base font-bold btn-primary"
              onClick={handleSubmitReview}
              disabled={isSubmitting || createReviewMutation.isPending}
            >
              {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
