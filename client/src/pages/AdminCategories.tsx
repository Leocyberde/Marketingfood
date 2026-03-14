import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminCategories() {
  const { data: categories, isLoading, refetch } = trpc.categories.list.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      setFormData({ name: "", description: "" });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar categoria: " + error.message);
    },
  });

  const deleteCategoryMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Categoria removida com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover categoria: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta categoria?")) {
      deleteCategoryMutation.mutate({ id });
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
            <h1 className="text-5xl font-black text-white mb-2">Gerenciar Categorias</h1>
            <p className="text-cyan-400">Total: {categories?.length || 0} categorias cadastradas</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-cyan-500 border-opacity-20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white">Criar Nova Categoria</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-cinematic">Nome da Categoria</label>
                  <Input
                    className="input-cinematic"
                    placeholder="Ex: Eletrônicos"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label-cinematic">Descrição</label>
                  <Input
                    className="input-cinematic"
                    placeholder="Descrição da categoria"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <Button type="submit" className="btn-primary w-full">
                  Criar Categoria
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <Card
              key={category.id}
              className="card-cinematic cursor-pointer hover:border-cyan-500 hover:border-opacity-50 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-bold text-white">{category.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-cyan-500 border-opacity-20">
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{category.description || "Sem descrição"}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories?.length === 0 && (
          <Card className="card-cinematic text-center py-12">
            <p className="text-2xl font-bold text-muted-foreground">Nenhuma categoria cadastrada</p>
            <p className="text-muted-foreground mt-2">Clique em "Nova Categoria" para começar</p>
          </Card>
        )}
      </div>
    </div>
  );
}
