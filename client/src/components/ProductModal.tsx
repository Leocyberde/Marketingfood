import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, ShoppingCart, Zap, Store, MapPin, Star, Package, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";

interface ProductModalProps {
  product: any;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [imgIdx, setImgIdx] = useState(0);

  const { data: store } = trpc.stores.getById.useQuery({ id: product.storeId });
  const { data: related } = trpc.products.listByCategory.useQuery({ categoryId: product.categoryId });

  const imgs = (product.images as string[]) || [];
  const hasSale = !!product.salePrice;
  const displayPrice = hasSale ? Number(product.salePrice) : Number(product.price);
  const discount = hasSale ? Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100) : 0;
  const relatedFiltered = (related || []).filter((p: any) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addItem({ productId: product.id, name: product.name, price: displayPrice, image: imgs[0] });
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-cyan-500/20 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-slate-800 hover:bg-slate-700 text-white rounded-full p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="relative">
            <div className="relative h-72 md:h-full min-h-64 bg-slate-800 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden">
              {imgs.length > 0 ? (
                <img src={imgs[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700"><Package className="w-20 h-20" /></div>
              )}
              {hasSale && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white font-black px-3 py-1 rounded-full flex items-center gap-1">
                  <Tag className="w-4 h-4" /> -{discount}%
                </div>
              )}
              {imgs.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((i) => (i - 1 + imgs.length) % imgs.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setImgIdx((i) => (i + 1) % imgs.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1"><ChevronRight className="w-5 h-5" /></button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {imgs.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-cyan-400" : "border-slate-700"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-black text-white leading-tight">{product.name}</h2>
              {product.description && <p className="text-slate-400 mt-2 text-sm leading-relaxed">{product.description}</p>}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(product.rating || 0)) ? "fill-orange-400 text-orange-400" : "text-slate-700"}`} />
                ))}
              </div>
              <span className="text-slate-400 text-sm">({product.totalReviews} avaliações)</span>
            </div>

            {/* Price */}
            <div className="bg-slate-800/60 rounded-xl p-4">
              {hasSale ? (
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-orange-400 font-black text-3xl">R$ {displayPrice.toFixed(2)}</span>
                    <span className="text-slate-500 text-base line-through">R$ {Number(product.price).toFixed(2)}</span>
                  </div>
                  <p className="text-green-400 text-sm mt-1 font-semibold">
                    Você economiza R$ {(Number(product.price) - displayPrice).toFixed(2)} ({discount}% off)
                  </p>
                </div>
              ) : (
                <span className="text-cyan-400 font-black text-3xl">R$ {displayPrice.toFixed(2)}</span>
              )}
              <p className="text-slate-500 text-xs mt-2">
                {product.stock > 0 ? `${product.stock} unidades disponíveis` : "Produto indisponível"}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                className={`h-12 text-base font-bold ${hasSale ? "bg-orange-500 hover:bg-orange-600 text-white" : "btn-primary"}`}
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button
                className="h-12 text-base font-bold bg-cyan-500 hover:bg-cyan-600 text-white"
                disabled={product.stock === 0}
                onClick={() => { handleAddToCart(); toast.info("Finalize seu pedido no carrinho!"); }}
              >
                <Zap className="w-5 h-5 mr-2" />
                Comprar Agora
              </Button>
            </div>

            {/* Store Info */}
            {store && (
              <div className="border border-slate-700 rounded-xl p-4 bg-slate-800/40">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Vendido por</p>
                <div className="flex items-center gap-3">
                  {store.logo ? (
                    <img src={store.logo} alt={store.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-600" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
                      <Store className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-base">{store.name}</p>
                    {store.address && (
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{store.address}{store.city ? `, ${store.city}` : ""}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                      <span className="text-orange-400 text-xs font-semibold">{Number(store.rating || 0).toFixed(1)}</span>
                      <span className="text-slate-500 text-xs">({store.totalReviews})</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedFiltered.length > 0 && (
          <div className="border-t border-slate-800 p-6">
            <h3 className="text-lg font-black text-white mb-4">Produtos Relacionados</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedFiltered.map((p: any) => {
                const pImgs = p.images as string[];
                const pSale = !!p.salePrice;
                const pPrice = pSale ? Number(p.salePrice) : Number(p.price);
                return (
                  <Card key={p.id} className="card-cinematic overflow-hidden cursor-pointer hover:border-cyan-500/40 transition-colors" onClick={() => onClose()}>
                    <div className="h-24 bg-slate-800 overflow-hidden">
                      {pImgs?.length > 0 ? (
                        <img src={pImgs[0]} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700"><Package className="w-8 h-8" /></div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{p.name}</p>
                      <p className={`text-xs font-black mt-1 ${pSale ? "text-orange-400" : "text-cyan-400"}`}>R$ {pPrice.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
