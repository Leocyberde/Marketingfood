import { Link, useLocation } from "wouter";
import { Store, User, Settings, ShoppingBag, UtensilsCrossed, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/use-cart";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const items = useCart((state) => state.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { href: "/cliente", label: "Cliente", icon: User },
    { href: "/lojista", label: "Lojista", icon: Store },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/cliente" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
              <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-sm">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-xl hidden sm:inline-block text-foreground">
                Market<span className="text-primary">Shop</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{link.label}</span>
                </Link>
              );
            })}
            
            {location.startsWith("/cliente") && (
              <>
                <Link
                  href="/cliente/enderecos"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    location === "/cliente/enderecos"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Enderecos</span>
                </Link>
                <Button variant="outline" size="icon" className="relative ml-2 rounded-full border-primary/20 text-primary hover:bg-primary/5">
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
