import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Star, Home, Search, Tag, Package } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function ClientCatalog() {
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: stores } = trpc.stores.list.useQuery();
  const { data: allProducts, isLoading } = trpc.products.listAll.useQuery();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Array<{ productId: number; name: string; price: number; qty: number }>>([]);

  const filtered = (allProducts || []).filter((p) => {
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (selectedStore && p.storeId !== selectedStore) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addToCart = (p: any) => {
    const price = p.salePrice ? Number(p.salePrice) : Number(p.price);
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) return prev.map((i) => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { productId: p.id, name: p.name, price, qty: 1 }];
    });
    toast.success(`${p.name} adicionado ao carrinho!`);
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900">
      {/* Top Bar */}
      <div className="border-b border-cyan-500/20 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link href="/"><Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-1"><Home className="w-4 h-4" /></Button></Link>
          <h1 className="text-xl font-black text-white">🛒 Catálogo</h1>
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 h-9 focus:border-cyan-400" placeholder="Buscar produtos..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {cart.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 rounded-lg px-3 py-1.5">
              <ShoppingCart className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 font-bold text-sm">{cartCount} itens — R$ {cartTotal.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 space-y-4">
          {/* Categorias */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categorias</p>
            <div className="space-y-1">
              <button onClick={() => setSelectedCategory(null)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCategory === null ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
                Todas
              </button>
              {categories?.map((c) => (
                <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCategory === c.id ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Lojas */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lojas</p>
            <div className="space-y-1">
              <button onClick={() => setSelectedStore(null)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedStore === null ? "bg-orange-500/20 text-orange-300 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
                Todas
              </button>
              {stores?.map((s) => (
                <button key={s.id} onClick={() => setSelectedStore(s.id)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedStore === s.id ? "bg-orange-500/20 text-orange-300 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-sm">{filtered.length} produtos encontrados</p>
            {(selectedCategory || selectedStore || search) && (
              <button onClick={() => { setSelectedCategory(null); setSelectedStore(null); setSearch(""); }} className="text-xs text-cyan-400 hover:text-cyan-300">Limpar filtros</button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20"><div className="text-xl font-bold text-cyan-500">Carregando produtos...</div></div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => {
                const imgs = product.images as string[];
                const hasSale = !!product.salePrice;
                const displayPrice = hasSale ? Number(product.salePrice) : Number(product.price);
                const discount = hasSale ? Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100) : 0;

                return (
                  <Card key={product.id} className="card-cinematic group overflow-hidden flex flex-col">
                    {/* Image */}
                    <div className="relative h-40 bg-slate-800 overflow-hidden">
                      {imgs && imgs.length > 0 ? (
                        <img src={imgs[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700"><Package className="w-10 h-10" /></div>
                      )}
                      {hasSale && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Tag className="w-3 h-3" /> -{discount}%
                        </div>
                      )}
                      {product.stock === 0 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white font-bold text-sm">Sem estoque</span></div>}
                    </div>

                    <CardContent className="p-3 flex flex-col gap-2 flex-1">
                      <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">{product.name}</h3>
                      {product.description && <p className="text-slate-400 text-xs line-clamp-2">{product.description}</p>}

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.round(Number(product.rating || 0)) ? "fill-orange-400 text-orange-400" : "text-slate-700"}`} />
                        ))}
                        <span className="text-slate-500 text-xs ml-1">({product.totalReviews})</span>
                      </div>

                      {/* Price */}
                      <div className="mt-auto">
                        {hasSale ? (
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-orange-400 font-black text-lg">R$ {displayPrice.toFixed(2)}</span>
                              <span className="text-slate-500 text-xs line-through">R$ {Number(product.price).toFixed(2)}</span>
                            </div>
                            <p className="text-green-400 text-xs">Economia de R$ {(Number(product.price) - displayPrice).toFixed(2)}</p>
                          </div>
                        ) : (
                          <span className="text-cyan-400 font-black text-lg">R$ {displayPrice.toFixed(2)}</span>
                        )}
                      </div>

                      <Button
                        className={`w-full h-8 text-xs font-bold ${hasSale ? "bg-orange-500 hover:bg-orange-600 text-white" : "btn-primary"}`}
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        {product.stock === 0 ? "Indisponível" : "Adicionar ao Carrinho"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Package className="w-14 h-14 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">Nenhum produto encontrado</p>
              <p className="text-slate-500 text-sm">Tente outro filtro ou busca</p>
            </div>
          )}
        </main>
      </div>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-20">
          <Card className="bg-slate-900 border-orange-500/40 shadow-lg shadow-orange-500/10 w-72">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-orange-400" /> Carrinho ({cartCount})</h3>
                <button onClick={() => setCart([])} className="text-slate-500 hover:text-red-400 text-xs">Limpar</button>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto mb-3">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate flex-1">{item.name}</span>
                    <span className="text-slate-400 ml-2 shrink-0">{item.qty}x R$ {item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
                <span className="text-slate-400 text-sm">Total:</span>
                <span className="text-orange-400 font-black">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <Button className="w-full mt-3 btn-primary text-sm h-9" onClick={() => toast.info("Checkout em breve!")}>Finalizar Pedido</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
