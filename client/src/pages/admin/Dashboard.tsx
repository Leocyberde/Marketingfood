import { useState } from "react";
import { useStores, useCreateStore, useUpdateStore } from "@/hooks/use-stores";
import { AppLayout } from "@/components/layout/AppLayout";
import { Store, Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStoreSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { data: stores } = useStores();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary/30 p-6 rounded-2xl border border-border">
          <div>
            <h1 className="text-3xl font-display font-bold">Painel Admin</h1>
            <p className="text-muted-foreground">Gerenciamento global de restaurantes.</p>
          </div>
          <StoreDialog />
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-semibold text-xs border-b border-border">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nome da Loja</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stores?.map((store) => (
                  <tr key={store.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-muted-foreground">#{store.id}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden">
                        {store.imageUrl ? <img src={store.imageUrl} className="w-full h-full object-cover" /> : <Store className="h-5 w-5 m-2.5 opacity-40" />}
                      </div>
                      <span className="font-bold">{store.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${store.active ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-red-500/10 text-red-600 border-red-200'}`}>
                        {store.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StoreDialog store={store} />
                    </td>
                  </tr>
                ))}
                {stores?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhuma loja cadastrada no sistema.
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

function StoreDialog({ store }: { store?: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  
  const form = useForm({
    resolver: zodResolver(insertStoreSchema),
    defaultValues: {
      name: store?.name || "",
      description: store?.description || "",
      imageUrl: store?.imageUrl || "",
      active: store ? store.active : true,
    }
  });

  const onSubmit = (values: any) => {
    if (store) {
      updateStore.mutate({ id: store.id, ...values }, {
        onSuccess: () => { setOpen(false); toast({ title: "Loja atualizada" }); }
      });
    } else {
      createStore.mutate(values, {
        onSuccess: () => { setOpen(false); form.reset(); toast({ title: "Loja criada com sucesso" }); }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {store ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"><Edit2 className="h-4 w-4" /></Button>
        ) : (
          <Button className="rounded-xl shadow-md gap-2 bg-foreground text-background hover:bg-foreground/90"><Plus className="h-4 w-4" /> Nova Loja</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">{store ? "Editar Loja" : "Criar Nova Loja"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nome da Loja</FormLabel><FormControl><Input {...field} className="bg-background" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} className="bg-background resize-none" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem><FormLabel>URL da Imagem Banner</FormLabel><FormControl><Input {...field} className="bg-background" placeholder="https://..." /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="active" render={({ field }) => (
              <FormItem className="pt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="store-active" checked={field.value} onChange={field.onChange} className="rounded text-primary focus:ring-primary h-4 w-4" />
                  <Label htmlFor="store-active" className="cursor-pointer font-medium">Loja visível no aplicativo</Label>
                </div>
              </FormItem>
            )} />
            <div className="pt-4">
              <Button type="submit" disabled={createStore.isPending || updateStore.isPending} className="rounded-xl w-full">
                {store ? "Salvar Alterações" : "Cadastrar Loja"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
