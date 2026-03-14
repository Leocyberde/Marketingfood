import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { ShoppingCart, Store, BarChart3, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900">
      {/* Navigation */}
      <nav className="border-b border-cyan-500 border-opacity-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-black text-white">🛍️ Marketplace Regional</h1>
          <div className="flex gap-4">
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
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-black text-white mb-4">
            Bem-vindo ao Marketplace Regional
          </h2>
          <p className="text-xl text-cyan-400 mb-8">
            Conectando pequenos comércios com clientes em sua região
          </p>

          {isAuthenticated && (
            <div className="flex gap-4 justify-center">
              {user?.role === "admin" && (
                <Link href="/admin/dashboard">
                  <Button className="btn-primary">Ir para Dashboard Admin</Button>
                </Link>
              )}
              {user?.role === "store" && (
                <Link href="/store/products">
                  <Button className="btn-primary">Meus Produtos</Button>
                </Link>
              )}
              {user?.role === "user" && (
                <Link href="/catalog">
                  <Button className="btn-primary">Explorar Catálogo</Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="card-cinematic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold text-white">Para Clientes</CardTitle>
              <ShoppingCart className="w-6 h-6 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Explore produtos de lojas locais, compare preços e faça suas compras com frete calculado automaticamente.
              </p>
            </CardContent>
          </Card>

          <Card className="card-cinematic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold text-white">Para Lojistas</CardTitle>
              <Store className="w-6 h-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gerencie seus produtos, acompanhe pedidos e veja seus ganhos com transparência total.
              </p>
            </CardContent>
          </Card>

          <Card className="card-cinematic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold text-white">Para Administradores</CardTitle>
              <BarChart3 className="w-6 h-6 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitore o marketplace, gerencie lojistas e categorias, e gere relatórios detalhados.
              </p>
            </CardContent>
          </Card>

          <Card className="card-cinematic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold text-white">Tecnologia</CardTitle>
              <Zap className="w-6 h-6 text-orange-500" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cálculo de frete inteligente, comissões automáticas e integração com múltiplas lojas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        {isAuthenticated && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {user?.role === "admin" && (
              <>
                <Link href="/admin/dashboard">
                  <Card className="card-cinematic cursor-pointer hover:shadow-glow-cyan">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <h3 className="font-bold text-white">Dashboard</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/admin/stores">
                  <Card className="card-cinematic cursor-pointer hover:shadow-glow-cyan">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-2">🏪</div>
                      <h3 className="font-bold text-white">Lojistas</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/admin/categories">
                  <Card className="card-cinematic cursor-pointer hover:shadow-glow-cyan">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-2">📁</div>
                      <h3 className="font-bold text-white">Categorias</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/admin/delivery">
                  <Card className="card-cinematic cursor-pointer hover:shadow-glow-cyan">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-2">🚚</div>
                      <h3 className="font-bold text-white">Entrega</h3>
                    </CardContent>
                  </Card>
                </Link>
              </>
            )}

            {user?.role === "store" && (
              <>
                <Link href="/store/products">
                  <Card className="card-cinematic cursor-pointer hover:shadow-glow-cyan">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-2">📦</div>
                      <h3 className="font-bold text-white">Produtos</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/store/orders">
                  <Card className="card-cinematic cursor-pointer hover:shadow-glow-cyan">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-2">📋</div>
                      <h3 className="font-bold text-white">Pedidos</h3>
                    </CardContent>
                  </Card>
                </Link>
              </>
            )}

            {user?.role === "user" && (
              <>
                <Link href="/catalog">
                  <Card className="card-cinematic cursor-pointer hover:shadow-glow-cyan">
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-2">🛒</div>
                      <h3 className="font-bold text-white">Catálogo</h3>
                    </CardContent>
                  </Card>
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-cyan-500 border-opacity-20 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-8 text-center text-muted-foreground">
          <p>&copy; 2026 Marketplace Regional. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
