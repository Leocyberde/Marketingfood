import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { X, Trash2, ShoppingCart, Plus, Minus, Package } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "wouter";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { cart, removeItem, updateQty, clearCart, total, count } = useCart();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-slate-900 border-l border-cyan-500/20 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-black text-white">Carrinho</h2>
            {count > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={() => { clearCart(); toast.success("Carrinho limpo!"); }}
                className="text-slate-500 hover:text-red-400 text-xs transition-colors"
              >
                Limpar tudo
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
              <Package className="w-16 h-16 text-slate-700" />
              <p className="font-bold text-lg">Carrinho vazio</p>
              <p className="text-sm text-center">Adicione produtos do catálogo para começar</p>
              <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold mt-2">
                → Continuar comprando
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-700 shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600"><Package className="w-6 h-6" /></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold leading-tight line-clamp-2">{item.name}</p>
                    <p className="text-orange-400 font-black text-sm mt-0.5">R$ {(item.price * item.qty).toFixed(2)}</p>
                    <p className="text-slate-500 text-xs">R$ {item.price.toFixed(2)} / un.</p>
                  </div>

                  {/* Qty & Remove */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-white text-sm font-bold w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-slate-800 p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal ({count} itens)</span>
                <span className="text-white font-semibold">R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Frete</span>
                <span className="text-green-400 font-semibold">A calcular</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-orange-400 font-black text-xl">R$ {total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full h-12 text-base font-bold btn-primary"
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
            >
              Finalizar Pedido →
            </Button>
            <button onClick={onClose} className="w-full text-slate-400 hover:text-white text-sm transition-colors">
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
