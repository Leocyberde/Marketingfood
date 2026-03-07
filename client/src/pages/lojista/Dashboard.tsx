import { useState } from "react";
import { useStores } from "@/hooks/use-stores";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatCurrency, parseCurrencyToCents } from "@/lib/utils";
import { Store, Package, ClipboardList, Plus, Edit2, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-red-500/10 text-red-600 border-red-200",
  accepted: "bg-blue-500/10 text-blue-600 border-blue-200",
  preparing: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  delivering: "bg-purple-500/10 text-purple-600 border-purple-200",
  completed: "bg-green-500/10 text-green-600 border-green-200",
  cancelled: "bg-slate-500/10 text-slate-600 border-slate-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  preparing: "Preparando",
  delivering: "Em Entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default function LojistaDashboard() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const { data: stores } = useStores();
  const storeId = selectedStoreId ? parseInt(selectedStoreId) : undefined;
  
  const { data: products } = useProducts(storeId);
  const { data: orders } = useOrders(storeId);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary/5 p-6 rounded-2xl border border-primary/10">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Painel do Lojista</h1>
            <p className="text-muted-foreground">Gerencie seus produtos e pedidos.</p>
          </div>
          <div className="w-full md:w-64">
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="bg-background shadow-sm border-primary/20 focus:ring-primary h-12">
                <SelectValue placeholder="Selecione sua loja" />
              </SelectTrigger>
              <SelectContent>
                {stores?.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!storeId ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card rounded-2xl border border-border shadow-sm">
            <Store className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-xl font-medium">Por favor, selecione uma loja no topo para começar.</p>
          </div>
        ) : (
          <Tabs defaultValue="pedidos" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 h-12 rounded-xl p-1 bg-muted/50 border border-border">
              <TabsTrigger value="pedidos" className="rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><ClipboardList className="w-4 h-4 mr-2" /> Pedidos</TabsTrigger>
              <TabsTrigger value="produtos" className="rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"><Package className="w-4 h-4 mr-2" /> Produtos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pedidos" className="space-y-4">
              <div className="grid gap-4">
                {orders?.map(order => (
                  <div key={order.id} className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:border-primary/30 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">Pedido #{order.id}</h3>
                        <Badge variant="outline" className={`${STATUS_COLORS[order.status]} border px-2.5 py-0.5 rounded-full font-medium`}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground"><span className="font-semibold text-foreground">Cliente:</span> {order.customerName}</p>
                      <p className="text-muted-foreground"><span className="font-semibold text-foreground">Endereço:</span> {order.customerAddress}</p>
                      
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="font-medium text-sm text-muted-foreground mb-2">Itens do Pedido:</p>
                        <ul className="space-y-1 text-sm">
                          {order.items.map((item, idx) => {
                            const prod = products?.find(p => p.id === item.productId);
                            return (
                              <li key={idx} className="flex justify-between max-w-md">
                                <span>{item.quantity}x {prod?.name || 'Produto indisponível'}</span>
                                <span className="text-muted-foreground">{formatCurrency(item.price)}</span>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="mt-3 font-bold text-lg flex justify-between max-w-md">
                          <span>Total:</span>
                          <span className="text-primary">{formatCurrency(order.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 min-w-[200px] border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Atualizar Status</Label>
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </div>
                  </div>
                ))}
                
                {orders?.length === 0 && (
                  <div className="py-20 text-center text-muted-foreground bg-card rounded-2xl border border-border">
                    <ClipboardList className="h-12 w-12 mx-auto opacity-20 mb-4" />
                    <p className="text-lg">Nenhum pedido recebido ainda.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="produtos">
              <div className="mb-6 flex justify-end">
                <ProductDialog storeId={storeId} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map(product => (
                  <div key={product.id} className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col group hover-lift">
                    <div className="h-40 bg-muted relative">
                      {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />}
                      {!product.active && <div className="absolute inset-0 bg-background/60 flex items-center justify-center font-bold">Inativo</div>}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                      <p className="text-muted-foreground text-sm flex-1 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
                        <span className="font-bold text-primary text-lg">{formatCurrency(product.price)}</span>
                        <div className="flex gap-2">
                          <ProductDialog storeId={storeId} product={product} />
                          <DeleteProductButton id={product.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {products?.length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted-foreground bg-card rounded-2xl border border-border">
                    <Package className="h-12 w-12 mx-auto opacity-20 mb-4" />
                    <p className="text-lg">Nenhum produto cadastrado.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}

function OrderStatusSelect({ orderId, currentStatus }: { orderId: number, currentStatus: string }) {
  const { mutate } = useUpdateOrderStatus();
  return (
    <Select value={currentStatus} onValueChange={(val) => mutate({ id: orderId, status: val })}>
      <SelectTrigger className="w-full bg-background border-primary/20">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABELS).map(([val, label]) => (
          <SelectItem key={val} value={val}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ProductDialog({ storeId, product }: { storeId: number, product?: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  
  // Need to coerce price string from form to number in cents for backend
  const formSchema = insertProductSchema.extend({
    priceStr: z.string().min(1, "Preço é obrigatório"),
  });
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeId,
      name: product?.name || "",
      description: product?.description || "",
      priceStr: product ? (product.price / 100).toFixed(2).replace('.', ',') : "",
      imageUrl: product?.imageUrl || "",
      active: product ? product.active : true,
      price: product?.price || 0, // hidden field satisfied by transform
    }
  });

  const onSubmit = (values: any) => {
    const cents = parseCurrencyToCents(values.priceStr);
    const payload = { ...values, price: cents };
    delete payload.priceStr;

    if (product) {
      updateProduct.mutate({ id: product.id, ...payload }, {
        onSuccess: () => { setOpen(false); toast({ title: "Produto atualizado" }); }
      });
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => { setOpen(false); form.reset(); toast({ title: "Produto criado" }); }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {product ? (
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-primary/20 text-primary hover:bg-primary/10"><Edit2 className="h-4 w-4" /></Button>
        ) : (
          <Button className="rounded-xl shadow-md gap-2"><Plus className="h-4 w-4" /> Novo Produto</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">{product ? "Editar Produto" : "Criar Produto"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} className="bg-background" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} className="bg-background resize-none" /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="priceStr" render={({ field }) => (
                <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input placeholder="15,90" {...field} className="bg-background" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="active" render={({ field }) => (
                <FormItem className="flex flex-col justify-end h-full pb-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="active" checked={field.value} onChange={field.onChange} className="rounded text-primary focus:ring-primary" />
                    <Label htmlFor="active" className="cursor-pointer">Produto Ativo</Label>
                  </div>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem><FormLabel>URL da Imagem (opcional)</FormLabel><FormControl><Input {...field} className="bg-background" /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="rounded-xl w-full">
                {product ? "Salvar Alterações" : "Criar Produto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteProductButton({ id }: { id: number }) {
  const { mutate, isPending } = useDeleteProduct();
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="h-8 w-8 rounded-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={isPending}
      onClick={() => {
        if(confirm("Tem certeza que deseja excluir este produto?")) mutate(id);
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
