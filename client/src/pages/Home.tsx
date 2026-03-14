import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { ShoppingCart, Store, BarChart3, Zap, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900">
      {/* Navigation */}
      <nav className="border-b border-cyan-500 border-opacity-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-black text-white">🛍️ Marketplace Regional</h1>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <span className="text-cyan-400 font-bold">{user?.name}</span>
                <Button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold"
                >
                  Sair
                </Button>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="btn-primary">Entrar</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-white mb-4">
            Bem-vindo ao Marketplace Regional
          </h2>
          <p className="text-xl text-cyan-400 mb-2">
            Conectando pequenos comércios com clientes em sua região
          </p>
          <p className="text-sm text-slate-400">Escolha um painel para começar</p>
        </div>

        {/* Quick Access Panels - always visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Cliente */}
          <Link href="/catalog">
            <Card className="card-cinematic cursor-pointer group hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 border border-cyan-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <ShoppingCart className="w-7 h-7 text-cyan-400" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                </div>
                <CardTitle className="text-2xl font-black text-white mt-3">
                  Painel do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                  Explore produtos de lojas locais, compare preços e faça suas compras com frete calculado automaticamente.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-full">🛒 Catálogo</span>
                  <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-full">📦 Pedidos</span>
                  <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-full">⭐ Avaliações</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Lojista */}
          <Link href="/store/products">
            <Card className="card-cinematic cursor-pointer group hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 border border-orange-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <Store className="w-7 h-7 text-orange-400" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                </div>
                <CardTitle className="text-2xl font-black text-white mt-3">
                  Painel do Lojista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                  Gerencie seus produtos, acompanhe pedidos recebidos e veja seus ganhos com transparência total.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full">📦 Produtos</span>
                  <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full">📋 Pedidos</span>
                  <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full">📊 Ganhos</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Admin */}
          <Link href="/admin/dashboard">
            <Card className="card-cinematic cursor-pointer group hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 border border-violet-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                    <BarChart3 className="w-7 h-7 text-violet-400" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                </div>
                <CardTitle className="text-2xl font-black text-white mt-3">
                  Painel Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                  Monitore o marketplace, gerencie lojistas e categorias, controle taxas de entrega e comissões.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-violet-500/10 text-violet-400 px-2 py-1 rounded-full">📊 Dashboard</span>
                  <span className="text-xs bg-violet-500/10 text-violet-400 px-2 py-1 rounded-full">🏪 Lojistas</span>
                  <span className="text-xs bg-violet-500/10 text-violet-400 px-2 py-1 rounded-full">🚚 Entrega</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Features row */}
        <div className="border-t border-white/5 pt-12">
          <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-8 font-semibold">Tecnologia</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
              <Zap className="w-5 h-5 text-orange-400 shrink-0" />
              <span className="text-sm text-slate-300">Frete automático</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
              <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-sm text-slate-300">10% de comissão</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
              <Zap className="w-5 h-5 text-orange-400 shrink-0" />
              <span className="text-sm text-slate-300">Multi-lojas</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
              <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-sm text-slate-300">Cálculo Haversine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-cyan-500 border-opacity-20 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-8 text-center text-muted-foreground">
          <p>&copy; 2026 Marketplace Regional. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
