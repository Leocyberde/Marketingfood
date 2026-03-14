import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Star, Home, Search, Tag, Package } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/hooks/useCart";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";

export default function ClientCatalog() {
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: stores } = trpc.stores.list.useQuery();
  const { data: allProducts, isLoading } = trpc.products.listAll.useQuery();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const { count, total, addItem } = useCart();

  const filtered = (allProducts || []).filter((p) => {
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (selectedStore && p.storeId !== selectedStore) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900">
      {/* Top Bar */}
      <div className="border-b border-cyan-500/20 bg-slate-950/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link href="/"><Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-1"><Home className="w-4 h-4" /></Button></Link>
          <h1 className="text-xl font-black text-white shrink-0">🛒 Catálogo</h1>
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-9 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 h-9 focus:border-cyan-400"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 rounded-lg px-3 py-2 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-orange-400" />
            {count > 0 ? (
              <>
                <span className="text-orange-300 font-bold text-sm hidden sm:inline">R$ {total.toFixed(2)}</span>
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{count}</span>
              </>
            ) : (
              <span className="text-slate-400 text-sm">Carrinho</span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 space-y-5">
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

        {/* Products Grid */}
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
                  <Card
                    key={product.id}
                    className="card-cinematic group overflow-hidden flex flex-col cursor-pointer hover:border-cyan-500/40 transition-all"
                    onClick={() => setSelectedProduct(product)}
                  >
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
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">Sem estoque</span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3 flex flex-col gap-2 flex-1">
                      <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">{product.name}</h3>
                      {product.description && <p className="text-slate-400 text-xs line-clamp-2">{product.description}</p>}

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.round(Number(product.rating || 0)) ? "fill-orange-400 text-orange-400" : "text-slate-700"}`} />
                        ))}
                        <span className="text-slate-500 text-xs ml-1">({product.totalReviews})</span>
                      </div>

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
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem({ productId: product.id, name: product.name, price: displayPrice, image: imgs?.[0] });
                          import("sonner").then(({ toast }) => toast.success(`${product.name} adicionado!`));
                        }}
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

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
