import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export default function AdminStores() {
  const { data: stores, isLoading, refetch } = trpc.stores.list.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    latitude: 0,
    longitude: 0,
  });

  const createStoreMutation = trpc.stores.create.useMutation({
    onSuccess: () => {
      toast.success("Lojista criado com sucesso!");
      setFormData({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        latitude: 0,
        longitude: 0,
      });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar lojista: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStoreMutation.mutate({
      userId: 1, // Será substituído por seleção de usuário real
      ...formData,
    } as any);
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
            <h1 className="text-5xl font-black text-white mb-2">Gerenciar Lojistas</h1>
            <p className="text-cyan-400">Total: {stores?.length || 0} lojistas cadastrados</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Novo Lojista
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-cyan-500 border-opacity-20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white">Criar Novo Lojista</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-cinematic">Nome da Loja</label>
                  <Input
                    className="input-cinematic"
                    placeholder="Ex: Eletrônicos Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label-cinematic">Descrição</label>
                  <Input
                    className="input-cinematic"
                    placeholder="Descrição da loja"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label-cinematic">Endereço</label>
                  <Input
                    className="input-cinematic"
                    placeholder="Rua, número, cidade"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-cinematic">Latitude</label>
                    <Input
                      className="input-cinematic"
                      type="number"
                      step="0.000001"
                      placeholder="-23.5505"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-cinematic">Longitude</label>
                    <Input
                      className="input-cinematic"
                      type="number"
                      step="0.000001"
                      placeholder="-46.6333"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label-cinematic">Telefone</label>
                  <Input
                    className="input-cinematic"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label-cinematic">Email</label>
                  <Input
                    className="input-cinematic"
                    type="email"
                    placeholder="contato@loja.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <Button type="submit" className="btn-primary w-full">
                  Criar Lojista
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores?.map((store) => (
            <Card key={store.id} className="card-cinematic">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">{store.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">{store.description}</p>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm">{store.address}</span>
                </div>

                {store.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">{store.phone}</span>
                  </div>
                )}

                {store.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm">{store.email}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button size="sm" className="btn-secondary flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stores?.length === 0 && (
          <Card className="card-cinematic text-center py-12">
            <p className="text-2xl font-bold text-muted-foreground">Nenhum lojista cadastrado</p>
            <p className="text-muted-foreground mt-2">Clique em "Novo Lojista" para começar</p>
          </Card>
        )}
      </div>
    </div>
  );
}
