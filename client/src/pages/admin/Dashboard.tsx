import { useState } from "react";
import { useStores, useCreateStore, useUpdateStore } from "@/hooks/use-stores";
import { AppLayout } from "@/components/layout/AppLayout";
import { MapPin, Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMerchantSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { data: merchants } = useStores();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary/30 p-6 rounded-2xl border border-border">
          <div>
            <h1 className="text-3xl font-display font-bold">Painel Admin</h1>
            <p className="text-muted-foreground">Gerenciamento global de lojistas.</p>
          </div>
          <MerchantDialog />
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-semibold text-xs border-b border-border">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Endereço</th>
                  <th className="px-6 py-4">Localização</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {merchants?.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-muted-foreground">#{merchant.id}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-bold">{merchant.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">{merchant.address}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{merchant.lat.toFixed(2)}, {merchant.lng.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <MerchantDialog merchant={merchant} />
                    </td>
                  </tr>
                ))}
                {merchants?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum lojista cadastrado no sistema.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function MerchantDialog({ merchant }: { merchant?: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createMerchant = useCreateStore();
  const updateMerchant = useUpdateStore();
  
  const form = useForm({
    resolver: zodResolver(insertMerchantSchema),
    defaultValues: {
      name: merchant?.name || "",
      address: merchant?.address || "",
      lat: merchant?.lat || 0,
      lng: merchant?.lng || 0,
    }
  });

  const onSubmit = (values: any) => {
    if (merchant) {
      updateMerchant.mutate({ id: merchant.id, ...values }, {
        onSuccess: () => { setOpen(false); toast({ title: "Lojista atualizado" }); }
      });
    } else {
      createMerchant.mutate(values, {
        onSuccess: () => { setOpen(false); form.reset(); toast({ title: "Lojista criado com sucesso" }); }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {merchant ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
        ) : (
          <Button className="rounded-xl shadow-md gap-2 bg-foreground text-background hover:bg-foreground/90"><Plus className="h-4 w-4" /> Novo Lojista</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">{merchant ? "Editar Lojista" : "Criar Novo Lojista"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} className="bg-background" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} className="bg-background" /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="lat" render={({ field }) => (
                <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input {...field} type="number" step="0.0001" className="bg-background" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lng" render={({ field }) => (
                <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input {...field} type="number" step="0.0001" className="bg-background" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="pt-4">
              <Button type="submit" disabled={createMerchant.isPending || updateMerchant.isPending} className="rounded-xl w-full">
                {merchant ? "Salvar Alterações" : "Cadastrar Lojista"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
