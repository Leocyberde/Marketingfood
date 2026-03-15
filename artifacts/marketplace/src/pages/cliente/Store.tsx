import { useParams, Link } from "wouter";
import { useGetStore, useListStoreProducts } from "@workspace/api-client-react";
import { ArrowLeft, Plus, Star, MapPin, Clock } from "lucide-react";
import { useCart } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export function ClienteStore() {
  const { id } = useParams();
  const storeId = parseInt(id || "0", 10);
  
  const { data: store, isLoading: storeLoading } = useGetStore(storeId);
  const { data: products, isLoading: productsLoading } = useListStoreProducts(storeId);
  
  const { addItem, items } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado.`,
    });
  };

  if (storeLoading) return <div className="text-center p-20 animate-pulse">Carregando loja...</div>;
  if (!store) return <div className="text-center p-20">Loja não encontrada</div>;

  return (
    <div className="space-y-8">
      <Link href="/cliente" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para lojas
      </Link>

      {/* Store Header */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg shadow-black/5 border border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center relative z-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-black text-4xl shadow-inner">
            {store.name.substring(0, 2).toUpperCase()}
          </div>
          
          <div className="space-y-2 flex-1">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground">{store.name}</h1>
            <p className="text-lg text-muted-foreground">{store.description}</p>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-xl text-sm font-bold">
                <Star className="w-4 h-4 fill-current" />
                {store.rating || 'Novo'}
              </div>
              <div className="flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1.5 rounded-xl text-sm font-semibold">
                <MapPin className="w-4 h-4" />
                {store.address}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${store.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <Clock className="w-4 h-4" />
                {store.isOpen ? 'Aberto' : 'Fechado'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Produtos</h2>
        
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-black/5 animate-pulse rounded-3xl" />)}
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
            <p className="text-muted-foreground">Esta loja ainda não tem produtos cadastrados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.map(product => {
              const cartItem = items.find(i => i.id === product.id);
              return (
                <div key={product.id} className="bg-white rounded-3xl p-5 card-hover flex flex-col group">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-2xl mb-4 bg-muted" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-muted to-muted/50 rounded-2xl mb-4 flex items-center justify-center text-muted-foreground font-bold text-4xl">
                      {product.name[0]}
                    </div>
                  )}
                  
                  <h3 className="font-bold text-lg text-foreground mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{product.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-black text-xl text-primary">
                      R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </span>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.isAvailable || product.stock <= 0 || !store.isOpen}
                      className="w-10 h-10 rounded-full bg-foreground text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {cartItem ? (
                        <span className="font-bold">{cartItem.quantity}</span>
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {(!product.isAvailable || product.stock <= 0) && (
                    <p className="text-xs text-red-500 font-bold mt-2 text-right">Esgotado</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
