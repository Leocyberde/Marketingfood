import { Link } from "wouter";
import { Store, Search, MapPin, Star } from "lucide-react";
import { useListStores } from "@workspace/api-client-react";
import { useState } from "react";
import { motion } from "framer-motion";

export function ClienteHome() {
  const [search, setSearch] = useState("");
  const { data: stores, isLoading } = useListStores(search ? { search } : undefined);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border border-white p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-primary/5">
        <div className="flex-1 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-primary font-bold text-sm border border-primary/20">
            <MapPin className="w-4 h-4" />
            No seu bairro, rapidinho!
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight">
            Compre das lojinhas <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">perto de você.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Apoie o comércio local. Eletrônicos, roupas, livros e muito mais, entregues em minutos.
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text"
              placeholder="Buscar lojas ou produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-sm font-medium"
            />
          </div>
        </div>
        
        <div className="flex-1 relative w-full max-w-md md:max-w-none">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero.png`} 
            alt="Neighborhood Market" 
            className="w-full h-auto object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-700"
          />
        </div>
      </section>

      {/* Stores List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            Lojas Disponíveis
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-black/5 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : stores?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
            <Store className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground">Nenhuma loja encontrada</h3>
            <p className="text-muted-foreground mt-2">Tente buscar por outro termo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((store, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={store.id}
              >
                <Link href={`/cliente/store/${store.id}`} className="block h-full">
                  <div className="bg-white rounded-3xl p-6 card-hover h-full flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-xl">
                        {store.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-sm font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {store.rating || 'Novo'}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-2">{store.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {store.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
                      <span className={`w-2 h-2 rounded-full ${store.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-bold text-muted-foreground">
                        {store.isOpen ? 'Aberto agora' : 'Fechado'}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
