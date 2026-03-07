import { useState } from "react";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/store/use-cart";
import { formatCurrency } from "@/lib/utils";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CartSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const { items, storeId, updateQuantity, removeItem, clearCart, getTotal } = useCart();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { toast } = useToast();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = getTotal();

  const handleCheckout = () => {
    if (!storeId || items.length === 0) return;
    if (!customerName || !customerAddress) {
      toast({ title: "Preencha seus dados", description: "Nome e endereço são obrigatórios.", variant: "destructive" });
      return;
    }

    createOrder(
      {
        storeId,
        customerName,
        customerAddress,
        totalPrice: totalAmount,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          price: i.product.price
        }))
      },
      {
        onSuccess: () => {
          toast({ title: "Pedido realizado!", description: "Seu pedido foi enviado ao restaurante." });
          clearCart();
          setIsOpen(false);
          setCustomerName("");
          setCustomerAddress("");
        },
        onError: (err) => {
          toast({ title: "Erro ao fazer pedido", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-lg hover-lift gap-2 z-40 bg-primary text-primary-foreground"
          size="lg"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="font-semibold">Ver Sacola</span>
          {totalItems > 0 && (
            <div className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {totalItems} item{totalItems > 1 ? 's' : ''} • {formatCurrency(totalAmount)}
            </div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background border-l-border">
        <SheetHeader>
          <SheetTitle className="font-display flex items-center gap-2 text-2xl">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Sua Sacola
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 pr-2 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60 space-y-4">
              <ShoppingBag className="h-16 w-16" />
              <p>Sua sacola está vazia</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 bg-card p-3 rounded-xl border border-border shadow-sm">
                    {item.product.imageUrl && (
                      <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-1">{item.product.name}</h4>
                        <p className="text-primary font-medium text-sm">{formatCurrency(item.product.price)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 hover:bg-background rounded-md text-foreground transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 hover:bg-background rounded-md text-foreground transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-border mt-auto">
                <h3 className="font-semibold text-lg">Detalhes da Entrega</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="name">Seu Nome</Label>
                    <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ex: João Silva" className="bg-background" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="address">Endereço de Entrega</Label>
                    <Input id="address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Ex: Rua das Flores, 123 - Apto 4" className="bg-background" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-border pt-4 mt-auto">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalAmount)}</span>
              </div>
              <Button 
                onClick={handleCheckout} 
                disabled={isPending} 
                className="w-full h-12 rounded-xl text-lg font-semibold shadow-lg shadow-primary/20"
              >
                {isPending ? "Processando..." : "Fazer Pedido"}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
