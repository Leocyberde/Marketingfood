import { useStores } from "@/hooks/use-stores";
import { Link } from "wouter";
import { Store as StoreIcon, Star, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function StoreList() {
  const { data: stores, isLoading } = useStores();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-display font-bold">Lojas perto de você</h1>
          <p className="text-muted-foreground text-lg">Descubra os melhores produtos com entrega rápida.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((store) => (
              <Link key={store.id} href={`/cliente/loja/${store.id}`}>
                <div className="group cursor-pointer bg-card rounded-2xl border border-border overflow-hidden hover-lift flex flex-col h-full">
                  <div className="h-48 w-full bg-muted relative overflow-hidden">
                    {store.imageUrl ? (
                      <img 
                        src={store.imageUrl} 
                        alt={store.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                        <StoreIcon className="h-12 w-12 opacity-50" />
                      </div>
                    )}
                    {!store.active && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <span className="font-bold text-lg px-4 py-2 bg-background rounded-full border shadow-sm">Fechado</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-bold text-xl group-hover:text-primary transition-colors line-clamp-1">{store.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md text-sm font-medium">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        4.8
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                      {store.description || "A melhor loja da região com produtos de qualidade e entrega rápida."}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground gap-4 font-medium">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 30-40 min</span>
                      <span className="text-primary/70 bg-primary/10 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Frete Grátis</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {stores?.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <StoreIcon className="h-12 w-12 mx-auto opacity-20 mb-4" />
                <p className="text-xl font-medium">Nenhuma loja encontrada.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
