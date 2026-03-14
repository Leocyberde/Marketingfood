import { useState, useMemo } from "react";
import { useNavigate } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft, MapPin, Truck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { calculateDeliveryFee } from "@shared/delivery";

export default function ClientCheckout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const { cart, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customer data
  const { data: customer } = trpc.customers.getMe.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch stores for selected products
  const storeIds = useMemo(() => [...new Set(cart.map((item) => item.storeId || 0))], [cart]);
  const { data: stores } = trpc.stores.list.useQuery();
  
  // Fetch delivery zones
  const { data: deliveryZones } = trpc.deliveryZones.list.useQuery();

  // Form state
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState(customer?.address || "");
  const [deliveryCity, setDeliveryCity] = useState(customer?.city || "");
  const [deliveryState, setDeliveryState] = useState(customer?.state || "");
  const [deliveryZipCode, setDeliveryZipCode] = useState(customer?.zipCode || "");
  const [deliveryLatitude, setDeliveryLatitude] = useState(customer?.latitude || 0);
  const [deliveryLongitude, setDeliveryLongitude] = useState(customer?.longitude || 0);

  // Mutation for creating order
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      clearCart();
      toast.success("Pedido criado com sucesso!");
      navigate(`/order/${order.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar pedido");
    },
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg font-bold">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate("/catalog")}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao catálogo
          </button>
          <Card className="card-cinematic">
            <CardContent className="py-20 text-center">
              <p className="text-slate-400 text-lg">Seu carrinho está vazio</p>
              <Button className="mt-4 btn-primary" onClick={() => navigate("/catalog")}>
                Continuar comprando
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get store for the order (all items should be from same store in real scenario)
  const storeId = selectedStore || storeIds[0];
  const store = stores?.find((s) => s.id === storeId);

  // Calculate delivery fee
  const deliveryDistance = store
    ? Math.sqrt(
        Math.pow(deliveryLatitude - store.latitude, 2) +
        Math.pow(deliveryLongitude - store.longitude, 2)
      ) * 111 // Approximate km conversion
    : 0;

  const deliveryFee = calculateDeliveryFee(deliveryDistance, deliveryZones || []);
  const commission = (total * 0.1); // 10% commission
  const finalTotal = total + deliveryFee;

  const handleSubmitOrder = async () => {
    if (!storeId) {
      toast.error("Selecione uma loja");
      return;
    }

    if (!deliveryAddress || !deliveryCity || !deliveryState || !deliveryZipCode) {
      toast.error("Preencha todos os dados de entrega");
      return;
    }

    setIsSubmitting(true);

    try {
      await createOrderMutation.mutateAsync({
        storeId,
        subtotal: total.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        commission: commission.toFixed(2),
        total: finalTotal.toFixed(2),
        deliveryDistance,
        deliveryLatitude,
        deliveryLongitude,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.qty,
          price: item.price.toFixed(2),
        })),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/catalog")}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao catálogo
        </button>

        <h1 className="text-3xl font-black text-white mb-8">Finalizar Pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Selection */}
            <Card className="card-cinematic">
              <CardHeader>
                <CardTitle className="text-lg text-white">Loja</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={storeId?.toString()} onValueChange={(v) => setSelectedStore(Number(v))}>
                  {stores?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="card-cinematic">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Rua e número"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="bg-slate-800/60 border-slate-700 text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Cidade"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-white"
                  />
                  <Input
                    placeholder="Estado (UF)"
                    value={deliveryState}
                    onChange={(e) => setDeliveryState(e.target.value.toUpperCase())}
                    maxLength={2}
                    className="bg-slate-800/60 border-slate-700 text-white"
                  />
                </div>
                <Input
                  placeholder="CEP"
                  value={deliveryZipCode}
                  onChange={(e) => setDeliveryZipCode(e.target.value)}
                  className="bg-slate-800/60 border-slate-700 text-white"
                />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="card-cinematic">
              <CardHeader>
                <CardTitle className="text-lg text-white">Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg">
                      <div>
                        <p className="text-white font-semibold">{item.name}</p>
                        <p className="text-slate-400 text-sm">{item.qty}x R$ {item.price.toFixed(2)}</p>
                      </div>
                      <p className="text-orange-400 font-bold">R$ {(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="card-cinematic sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg text-white">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white font-semibold">R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Frete
                    </span>
                    <span className="text-green-400 font-semibold">R$ {deliveryFee.toFixed(2)}</span>
                  </div>
                  {deliveryDistance > 0 && (
                    <div className="text-xs text-slate-500">
                      Distância: {deliveryDistance.toFixed(1)} km
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-orange-400 font-black text-xl">R$ {finalTotal.toFixed(2)}</span>
                  </div>

                  {deliveryDistance > store?.coverageRadiusKm! && (
                    <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 mb-4 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-red-300 text-xs">
                        Endereço fora da zona de cobertura desta loja
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full h-12 text-base font-bold btn-primary"
                    onClick={handleSubmitOrder}
                    disabled={
                      isSubmitting ||
                      createOrderMutation.isPending ||
                      deliveryDistance > store?.coverageRadiusKm!
                    }
                  >
                    {isSubmitting ? "Processando..." : "Confirmar Pedido"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
