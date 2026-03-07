import { useRoute, Link } from "wouter";
import { useStore } from "@/hooks/use-stores";
import { useProducts } from "@/hooks/use-products";
import { AppLayout } from "@/components/layout/AppLayout";
import { CartSheet } from "@/components/CartSheet";
import { ArrowLeft, Plus, Image as ImageIcon, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/store/use-cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function StoreDetails() {
  const [, params] = useRoute("/cliente/loja/:id");
  const merchantId = params?.id ? parseInt(params.id) : 0;
  
  const { data: merchant, isLoading: isMerchantLoading } = useStore(merchantId);
  const { data: products, isLoading: isProductsLoading } = useProducts(merchantId);
  const addItem = useCart((state) => state.addItem);

  if (isMerchantLoading) return (
    <AppLayout>
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-2xl w-full"></div>
        <div className="h-8 bg-muted rounded w-1/3"></div>
      </div>
    </AppLayout>
  );

  if (!merchant) return (
    <AppLayout>
      <div className="text-center py-20">Lojista não encontrado</div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-8 pb-24">
        <Link href="/cliente" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" /> Voltar para lojistas
        </Link>

        {/* Merchant Header */}
        <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm p-8">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">{merchant.name}</h1>
              <p className="text-muted-foreground text-lg mb-3">{merchant.address}</p>
              <p className="text-sm text-muted-foreground">
                📍 {merchant.lat.toFixed(2)}, {merchant.lng.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-6">Produtos</h2>
          
          {isProductsLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {products?.map((product) => (
                <div key={product.id} className="bg-card border border-border p-4 rounded-2xl flex gap-4 hover:shadow-md transition-shadow group">
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-lg leading-tight mb-1">{product.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-primary text-lg">{formatCurrency(product.price)}</span>
                      <Button 
                        onClick={() => addItem(product, merchantId)}
                        size="sm"
                        className="rounded-full gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:flex hidden"
                      >
                        <Plus className="h-4 w-4" /> Adicionar
                      </Button>
                    </div>
                  </div>
                  
                  {/* Product Image & Mobile Add Button */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="h-24 w-24 rounded-xl bg-secondary overflow-hidden flex-shrink-0 relative">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 opacity-20" />
                        </div>
                      )}
                      <button 
                        onClick={() => addItem(product, merchantId)}
                        className="absolute bottom-1 right-1 md:hidden h-8 w-8 bg-background rounded-full shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors border border-border"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {products?.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed">
                  <p className="text-lg">Este lojista ainda não adicionou produtos.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <CartSheet />
    </AppLayout>
  );
}
