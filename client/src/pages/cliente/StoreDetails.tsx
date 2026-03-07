import { useRoute, Link } from "wouter";
import { useStore } from "@/hooks/use-stores";
import { useProducts } from "@/hooks/use-products";
import { AppLayout } from "@/components/layout/AppLayout";
import { CartSheet } from "@/components/CartSheet";
import { ArrowLeft, Plus, Image as ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/store/use-cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function StoreDetails() {
  const [, params] = useRoute("/cliente/loja/:id");
  const storeId = params?.id ? parseInt(params.id) : 0;
  
  const { data: store, isLoading: isStoreLoading } = useStore(storeId);
  const { data: products, isLoading: isProductsLoading } = useProducts(storeId);
  const addItem = useCart((state) => state.addItem);

  if (isStoreLoading) return (
    <AppLayout>
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-muted rounded-2xl w-full"></div>
        <div className="h-8 bg-muted rounded w-1/3"></div>
      </div>
    </AppLayout>
  );

  if (!store) return (
    <AppLayout>
      <div className="text-center py-20">Loja não encontrada</div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-8 pb-24"> {/* pb-24 for floating cart button space */}
        <Link href="/cliente" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" /> Voltar para lojas
        </Link>

        {/* Store Header */}
        <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm">
          <div className="h-48 md:h-64 w-full bg-muted relative">
            {store.imageUrl ? (
              <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary flex items-center justify-center">
                <span className="text-6xl text-white opacity-20 font-display font-bold">{store.name.substring(0,2).toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">{store.name}</h1>
            <p className="text-muted-foreground text-lg max-w-3xl">{store.description}</p>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            Produtos
          </h2>
          
          {isProductsLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {products?.filter(p => p.active).map((product) => (
                <div key={product.id} className="bg-card border border-border p-4 rounded-2xl flex gap-4 hover:shadow-md transition-shadow group">
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-lg leading-tight mb-1">{product.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-primary text-lg">{formatCurrency(product.price)}</span>
                      <Button 
                        onClick={() => addItem(product, storeId)}
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
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 opacity-20" />
                        </div>
                      )}
                      <button 
                        onClick={() => addItem(product, storeId)}
                        className="absolute bottom-1 right-1 md:hidden h-8 w-8 bg-background rounded-full shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors border border-border"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {products?.filter(p => p.active).length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed">
                  <p className="text-lg">Esta loja ainda não adicionou produtos.</p>
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
