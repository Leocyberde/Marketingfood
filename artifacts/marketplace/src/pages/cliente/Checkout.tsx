import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/store";
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateOrder, useGetStore } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const checkoutSchema = z.object({
  customerName: z.string().min(3, "Nome muito curto"),
  customerPhone: z.string().min(8, "Telefone inválido"),
  customerAddress: z.string().min(5, "Endereço completo necessário"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export function ClienteCheckout() {
  const [, setLocation] = useLocation();
  const { items, storeId, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const { data: store } = useGetStore(storeId || 0, { query: { enabled: !!storeId } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { customerName: "", customerPhone: "", customerAddress: "", notes: "" }
  });

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        clearCart();
        toast({ title: "Pedido realizado com sucesso!", description: "Acompanhe o status do seu pedido." });
        setLocation(`/cliente/order/${data.id}`);
      },
      onError: (error: any) => {
        toast({ title: "Erro ao criar pedido", description: error.message, variant: "destructive" });
      }
    }
  });

  const onSubmit = (data: CheckoutForm) => {
    if (!storeId || items.length === 0) return;
    
    createOrder.mutate({
      data: {
        ...data,
        storeId,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <img src={`${import.meta.env.BASE_URL}images/empty-cart.png`} alt="Carrinho vazio" className="w-64 h-64 object-contain" />
        <h2 className="text-3xl font-black text-foreground">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground text-lg">Que tal explorar algumas lojas do bairro?</p>
        <Link href="/cliente" className="btn-primary-gradient px-8 py-4 rounded-full mt-4 inline-block">
          Explorar Lojas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link href={`/cliente/store/${storeId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Continuar comprando
        </Link>
        <h1 className="text-3xl font-black flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-primary" />
          Finalizar Pedido
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-black/5 border border-border">
            <h2 className="text-xl font-bold mb-6 pb-4 border-b border-border">Itens de {store?.name}</h2>
            
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-center sm:items-start p-4 bg-muted/30 rounded-2xl">
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-primary font-black">R$ {Number(item.price).toFixed(2).replace('.', ',')}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white rounded-xl border border-border shadow-sm">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-muted-foreground hover:text-foreground">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-muted-foreground hover:text-foreground">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
              <span className="text-xl text-muted-foreground font-bold">Total</span>
              <span className="text-3xl font-black text-foreground">R$ {getTotal().toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        {/* Delivery Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-primary/5 border border-primary/20 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Dados de Entrega</h2>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1.5">Seu Nome</label>
                <input 
                  {...form.register("customerName")}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Ex: João Silva"
                />
                {form.formState.errors.customerName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.customerName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1.5">Telefone / WhatsApp</label>
                <input 
                  {...form.register("customerPhone")}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="(00) 00000-0000"
                />
                {form.formState.errors.customerPhone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.customerPhone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1.5">Endereço Completo</label>
                <textarea 
                  {...form.register("customerAddress")}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                  placeholder="Rua, Número, Bairro, Referência..."
                />
                {form.formState.errors.customerAddress && <p className="text-red-500 text-xs mt-1">{form.formState.errors.customerAddress.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1.5">Observações (Opcional)</label>
                <input 
                  {...form.register("notes")}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Ex: Troco para 50, sem cebola..."
                />
              </div>

              <button 
                type="submit" 
                disabled={createOrder.isPending}
                className="w-full btn-primary-gradient mt-6 py-4 rounded-xl flex items-center justify-center gap-2"
              >
                {createOrder.isPending ? "Processando..." : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirmar Pedido
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
