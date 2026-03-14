import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export default function StoreProducts() {
  const { user } = useAuth();
  const { data: store } = trpc.stores.getByUserId.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: products, isLoading, refetch } = trpc.products.listByStore.useQuery(
    { storeId: store?.id || 0 },
    { enabled: !!store?.id }
  );

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: 0,
    name: "",
    description: "",
    price: "",
    stock: 0,
  });

  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      setFormData({
        categoryId: 0,
        name: "",
        description: "",
        price: "",
        stock: 0,
      });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar produto: " + error.message);
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto removido com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover produto: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) {
      toast.error("Loja não encontrada");
      return;
    }

    createProductMutation.mutate({
      storeId: store.id,
      ...formData,
    } as any);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este produto?")) {
      deleteProductMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-center min-h-screen">
        <div className="text-2xl font-bold text-cyan-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-black text-white mb-2">Meus Produtos</h1>
            <p className="text-cyan-400">{store?.name || "Loja"} - {products?.length || 0} produtos</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-cyan-500 border-opacity-20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white">Cadastrar Novo Produto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-cinematic">Categoria</label>
                  <select
                    className="input-cinematic"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-cinematic">Nome do Produto</label>
                  <Input
                    className="input-cinematic"
                    placeholder="Ex: Notebook Dell"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label-cinematic">Descrição</label>
                  <Input
                    className="input-cinematic"
                    placeholder="Descrição do produto"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-cinematic">Preço (R$)</label>
                    <Input
                      className="input-cinematic"
                      type="number"
                      step="0.01"
                      placeholder="1000.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-cinematic">Estoque</label>
                    <Input
                      className="input-cinematic"
                      type="number"
                      placeholder="10"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="btn-primary w-full">
                  Cadastrar Produto
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <Card key={product.id} className="card-cinematic">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">{product.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-400 font-bold">R$ {Number(product.price).toFixed(2)}</p>
                    <p className="text-muted-foreground text-sm">Estoque: {product.stock}</p>
                  </div>
                  <Package className="w-8 h-8 text-orange-500" />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button size="sm" className="btn-secondary flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products?.length === 0 && (
          <Card className="card-cinematic text-center py-12">
            <p className="text-2xl font-bold text-muted-foreground">Nenhum produto cadastrado</p>
            <p className="text-muted-foreground mt-2">Clique em "Novo Produto" para começar</p>
          </Card>
        )}
      </div>
    </div>
  );
}
