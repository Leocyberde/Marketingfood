import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package, ImagePlus, X, Home, Tag } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const EMPTY_FORM = {
  categoryId: 0,
  name: "",
  description: "",
  price: "",
  salePrice: "",
  stock: 0,
  images: [] as string[],
};

export default function StoreProducts() {
  const { data: store, isLoading: storeLoading } = trpc.stores.getFirst.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: products, isLoading, refetch } = trpc.products.listByStore.useQuery(
    { storeId: store?.id || 0 },
    { enabled: !!store?.id }
  );

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const fileRef = useRef<HTMLInputElement>(null);

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => { toast.success("Produto criado!"); setFormData({ ...EMPTY_FORM }); setIsOpen(false); refetch(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => { toast.success("Produto atualizado!"); setFormData({ ...EMPTY_FORM }); setEditId(null); setIsOpen(false); refetch(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => { toast.success("Produto removido!"); refetch(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ev.target?.result as string] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const openCreate = () => { setEditId(null); setFormData({ ...EMPTY_FORM }); setIsOpen(true); };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setFormData({ categoryId: p.categoryId, name: p.name, description: p.description || "", price: String(p.price), salePrice: p.salePrice ? String(p.salePrice) : "", stock: p.stock, images: p.images || [] });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) { toast.error("Loja não encontrada"); return; }
    const payload = { ...formData, storeId: store.id, salePrice: formData.salePrice || null };
    if (editId) updateMutation.mutate({ id: editId, ...payload });
    else createMutation.mutate(payload as any);
  };

  if (storeLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-2xl font-bold text-cyan-500">Carregando...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/"><Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-1"><Home className="w-4 h-4" /></Button></Link>
              <h1 className="text-4xl font-black text-white">Painel do Lojista</h1>
            </div>
            <p className="text-orange-400 ml-10">{store?.name || "Loja"} — {products?.length || 0} produtos</p>
          </div>

          <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) { setEditId(null); setFormData({ ...EMPTY_FORM }); } }}>
            <DialogTrigger asChild>
              <Button className="btn-primary flex items-center gap-2" onClick={openCreate}>
                <Plus className="w-5 h-5" /> Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-orange-500/30 max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-white">{editId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {/* Fotos */}
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Fotos do Produto</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-orange-500/30">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setFormData((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-orange-500/40 flex flex-col items-center justify-center text-orange-400 hover:border-orange-400 hover:bg-orange-500/10 transition-colors">
                      <ImagePlus className="w-6 h-6" /><span className="text-xs mt-1">Adicionar</span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1 block">Categoria *</label>
                  <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-orange-400 outline-none" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })} required>
                    <option value={0}>Selecione...</option>
                    {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Nome */}
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1 block">Nome *</label>
                  <Input className="bg-slate-800 border-slate-700 text-white focus:border-orange-400" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do produto" required />
                </div>

                {/* Descrição */}
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1 block">Descrição</label>
                  <textarea className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-orange-400 outline-none resize-none" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Descreva o produto..." />
                </div>

                {/* Preços */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-1 block">Preço Normal (R$) *</label>
                    <Input type="number" step="0.01" min="0" className="bg-slate-800 border-slate-700 text-white focus:border-orange-400" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" required />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-1"><Tag className="w-3 h-3 text-orange-400" /> Preço Promo (R$)</label>
                    <Input type="number" step="0.01" min="0" className="bg-slate-800 border-slate-700 text-white focus:border-orange-400" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} placeholder="Opcional" />
                  </div>
                </div>

                {/* Estoque */}
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1 block">Estoque</label>
                  <Input type="number" min="0" className="bg-slate-800 border-slate-700 text-white focus:border-orange-400" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} />
                </div>

                <Button type="submit" className="w-full btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editId ? "Salvar Alterações" : "Cadastrar Produto"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <Card key={product.id} className="card-cinematic group overflow-hidden">
                <div className="relative h-44 bg-slate-800 overflow-hidden">
                  {product.images && (product.images as string[]).length > 0 ? (
                    <img src={(product.images as string[])[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600"><Package className="w-12 h-12" /></div>
                  )}
                  {product.salePrice && <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold">PROMO</Badge>}
                  <Badge className={`absolute top-2 right-2 text-xs ${product.stock > 0 ? "bg-green-700" : "bg-red-700"}`}>{product.stock > 0 ? `${product.stock} un.` : "Sem estoque"}</Badge>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-sm leading-tight">{product.name}</h3>
                    {product.description && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{product.description}</p>}
                  </div>
                  <div>
                    {product.salePrice ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-orange-400 font-black text-base">R$ {Number(product.salePrice).toFixed(2)}</span>
                        <span className="text-slate-500 text-xs line-through">R$ {Number(product.price).toFixed(2)}</span>
                        <Badge className="bg-orange-500/20 text-orange-300 text-xs">
                          -{Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100)}%
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-cyan-400 font-bold text-base">R$ {Number(product.price).toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs h-8" onClick={() => openEdit(product)}><Edit className="w-3 h-3 mr-1" />Editar</Button>
                    <Button size="sm" variant="destructive" className="flex-1 text-xs h-8" onClick={() => { if (confirm("Remover produto?")) deleteMutation.mutate({ id: product.id }); }}><Trash2 className="w-3 h-3 mr-1" />Remover</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-cinematic text-center py-16">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-2xl font-bold text-slate-400">Nenhum produto cadastrado</p>
            <p className="text-slate-500 mt-2">Clique em "Novo Produto" para começar</p>
          </Card>
        )}
      </div>
    </div>
  );
}
