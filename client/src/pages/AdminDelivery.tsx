import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDelivery() {
  const { data: zones, isLoading, refetch } = trpc.deliveryZones.list.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    minDistanceKm: 0,
    maxDistanceKm: 0,
    baseFee: "",
    perKmFee: "",
  });

  const createZoneMutation = trpc.deliveryZones.create.useMutation({
    onSuccess: () => {
      toast.success("Zona de entrega criada com sucesso!");
      setFormData({
        name: "",
        minDistanceKm: 0,
        maxDistanceKm: 0,
        baseFee: "",
        perKmFee: "",
      });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar zona: " + error.message);
    },
  });

  const deleteZoneMutation = trpc.deliveryZones.delete.useMutation({
    onSuccess: () => {
      toast.success("Zona removida com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover zona: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createZoneMutation.mutate(formData as any);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta zona?")) {
      deleteZoneMutation.mutate({ id });
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
            <h1 className="text-5xl font-black text-white mb-2">Configurar Entrega</h1>
            <p className="text-cyan-400">Gerenciar zonas e taxas de entrega</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Zona
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-cyan-500 border-opacity-20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white">Criar Nova Zona de Entrega</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-cinematic">Nome da Zona</label>
                  <Input
                    className="input-cinematic"
                    placeholder="Ex: Zona Centro"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-cinematic">Distância Mínima (km)</label>
                    <Input
                      className="input-cinematic"
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={formData.minDistanceKm}
                      onChange={(e) => setFormData({ ...formData, minDistanceKm: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-cinematic">Distância Máxima (km)</label>
                    <Input
                      className="input-cinematic"
                      type="number"
                      step="0.1"
                      placeholder="5"
                      value={formData.maxDistanceKm}
                      onChange={(e) => setFormData({ ...formData, maxDistanceKm: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-cinematic">Taxa Base (R$)</label>
                    <Input
                      className="input-cinematic"
                      type="number"
                      step="0.01"
                      placeholder="12.00"
                      value={formData.baseFee}
                      onChange={(e) => setFormData({ ...formData, baseFee: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-cinematic">Taxa por km (R$)</label>
                    <Input
                      className="input-cinematic"
                      type="number"
                      step="0.01"
                      placeholder="2.00"
                      value={formData.perKmFee}
                      onChange={(e) => setFormData({ ...formData, perKmFee: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" className="btn-primary w-full">
                  Criar Zona
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="card-cinematic mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Cálculo de Frete Padrão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-muted-foreground">
              <p>• Até 5 km: R$ 12,00</p>
              <p>• Acima de 5 km: R$ 12,00 + R$ 2,00 por km adicional</p>
              <p>• Distância calculada via Haversine × 0,8 (aproximação da realidade)</p>
            </div>
          </CardContent>
        </Card>

        {/* Zones Table */}
        <Card className="card-cinematic">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Zonas de Entrega Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyan-500 border-opacity-20">
                    <th className="text-left py-3 px-4 font-bold text-cyan-400">Nome</th>
                    <th className="text-left py-3 px-4 font-bold text-cyan-400">Distância (km)</th>
                    <th className="text-left py-3 px-4 font-bold text-cyan-400">Taxa Base</th>
                    <th className="text-left py-3 px-4 font-bold text-cyan-400">Taxa/km</th>
                    <th className="text-left py-3 px-4 font-bold text-cyan-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {zones?.map((zone) => (
                    <tr key={zone.id} className="border-b border-cyan-500 border-opacity-10 hover:bg-cyan-500 hover:bg-opacity-5 transition-colors">
                      <td className="py-3 px-4">{zone.name}</td>
                      <td className="py-3 px-4">
                        {zone.minDistanceKm} - {zone.maxDistanceKm}
                      </td>
                      <td className="py-3 px-4">R$ {Number(zone.baseFee).toFixed(2)}</td>
                      <td className="py-3 px-4">R$ {Number(zone.perKmFee).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(zone.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {zones?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma zona de entrega cadastrada</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
