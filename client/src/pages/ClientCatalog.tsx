import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MapPin, Star } from "lucide-react";
import { toast } from "sonner";

export default function ClientCatalog() {
  const { user } = useAuth();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: stores } = trpc.stores.list.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [cart, setCart] = useState<Array<{ productId: number; quantity: number }>>([]);

  const { data: products } = trpc.products.listByCategory.useQuery(
    { categoryId: selectedCategory || 0 },
    { enabled: !!selectedCategory }
  );

  const { data: storeProducts } = trpc.products.listByStore.useQuery(
    { storeId: selectedStore || 0 },
    { enabled: !!selectedStore }
  );

  const displayProducts = selectedStore ? storeProducts : products;

  const handleAddToCart = (productId: number) => {
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
    toast.success("Produto adicionado ao carrinho!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-2">Catálogo de Produtos</h1>
          <p className="text-cyan-400">Explore produtos de nossas lojas parceiras</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Categories */}
          <Card className="card-cinematic">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                className={selectedCategory === null ? "btn-primary w-full" : "w-full"}
                onClick={() => setSelectedCategory(null)}
              >
                Todas as Categorias
              </Button>
              {categories?.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  className={selectedCategory === cat.id ? "btn-primary w-full" : "w-full"}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Stores */}
          <Card className="card-cinematic">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Lojas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedStore === null ? "default" : "outline"}
                className={selectedStore === null ? "btn-primary w-full" : "w-full"}
                onClick={() => setSelectedStore(null)}
              >
                Todas as Lojas
              </Button>
              {stores?.map((store) => (
                <Button
                  key={store.id}
                  variant={selectedStore === store.id ? "default" : "outline"}
                  className={selectedStore === store.id ? "btn-primary w-full" : "w-full"}
                  onClick={() => setSelectedStore(store.id)}
                >
                  {store.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts?.map((product) => (
            <Card key={product.id} className="card-cinematic">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">{product.description}</p>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(Number(product.rating || 0))
                            ? "fill-orange-500 text-orange-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {product.totalReviews} avaliações
                  </span>
                </div>

                {/* Price and Stock */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-400 font-bold text-lg">R$ {Number(product.price).toFixed(2)}</p>
                    <Badge className={product.stock > 0 ? "badge-cyan" : "bg-red-500"}>
                      {product.stock > 0 ? `${product.stock} em estoque` : "Fora de estoque"}
                    </Badge>
                  </div>
                </div>

                {/* Add to Cart */}
                <Button
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Adicionar ao Carrinho
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayProducts?.length === 0 && (
          <Card className="card-cinematic text-center py-12">
            <p className="text-2xl font-bold text-muted-foreground">Nenhum produto encontrado</p>
            <p className="text-muted-foreground mt-2">Tente selecionar outra categoria ou loja</p>
          </Card>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="card-cinematic fixed bottom-8 right-8 w-80">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Carrinho ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="btn-secondary w-full">
                Ir para Checkout
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
