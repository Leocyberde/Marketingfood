import { Link, useRoute } from "wouter";
import { Store, ShoppingBag, PieChart, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isCliente] = useRoute("/cliente/*?");
  const [isLojista] = useRoute("/lojista/*?");
  const [isAdmin] = useRoute("/admin/*?");
  
  const cartItems = useCart((state) => state.items);
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Top Navigation */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-8">
        <div className="glass-nav rounded-full px-2 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 pl-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black">
              M
            </div>
            <span className="font-display font-bold text-xl hidden sm:block text-foreground">
              BairroMarket
            </span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link 
              href="/cliente" 
              className={`px-4 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
                isCliente || (!isLojista && !isAdmin) ? "bg-primary text-white shadow-md shadow-primary/30" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:block">Cliente</span>
            </Link>
            
            <Link 
              href="/lojista" 
              className={`px-4 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
                isLojista ? "bg-secondary text-white shadow-md shadow-secondary/30" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:block">Lojista</span>
            </Link>

            <Link 
              href="/admin" 
              className={`px-4 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
                isAdmin ? "bg-foreground text-white shadow-md shadow-foreground/30" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:block">Admin</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {children}
      </main>

      {/* Floating Cart Button (Only for Cliente) */}
      <AnimatePresence>
        {(isCliente || (!isLojista && !isAdmin)) && cartItemCount > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Link 
              href="/cliente/checkout"
              className="flex items-center gap-3 bg-foreground text-white px-6 py-4 rounded-full shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-foreground">
                  {cartItemCount}
                </span>
              </div>
              <span className="font-bold">Ver Carrinho</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
