import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Store, ShoppingCart, TrendingUp, Home } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: statistics, isLoading } = trpc.admin.statistics.useQuery();

  if (isLoading) {
    return (
      <div className="flex-center min-h-screen">
        <div className="text-2xl font-bold text-cyan-500">Carregando...</div>
      </div>
    );
  }

  const statCards: Array<{ title: string; value: string | number; icon: any; color: string }> = [
    {
      title: "Vendas Totais",
      value: `R$ ${Number(statistics?.totalSales || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: "text-cyan-500",
    },
    {
      title: "Lojistas",
      value: Number(statistics?.totalStores || 0),
      icon: Store,
      color: "text-orange-500",
    },
    {
      title: "Clientes",
      value: Number(statistics?.totalCustomers || 0),
      icon: Users,
      color: "text-cyan-500",
    },
    {
      title: "Pedidos Ativos",
      value: Number(statistics?.activeOrders || 0),
      icon: ShoppingCart,
      color: "text-orange-500",
    },
  ];

  const chartData = [
    { name: "Vendas", value: Number(statistics?.totalSales || 0) / 1000 },
    { name: "Lojistas", value: statistics?.totalStores || 0 },
    { name: "Clientes", value: statistics?.totalCustomers || 0 },
    { name: "Pedidos", value: statistics?.activeOrders || 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/"><Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-1"><Home className="w-4 h-4" /></Button></Link>
            <h1 className="text-5xl font-black text-white">Dashboard Administrativo</h1>
          </div>
          <p className="text-cyan-400 text-lg ml-10">Visão geral do marketplace</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="card-cinematic">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chart */}
        <Card className="card-cinematic">
          <CardHeader>
            <CardTitle className="text-2xl font-black">Visão Geral de Métricas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 200, 255, 0.1)" />
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(15, 10, 8, 0.9)", border: "1px solid #00c8ff" }} />
                <Legend />
                <Bar dataKey="value" fill="#00c8ff" name="Quantidade" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <a
            href="/admin/stores"
            className="card-cinematic hover:shadow-glow-cyan cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-white">Gerenciar Lojistas</h3>
            <p className="text-muted-foreground mt-2">Criar, editar e remover lojistas</p>
          </a>

          <a
            href="/admin/categories"
            className="card-cinematic hover:shadow-glow-cyan cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-xl font-bold text-white">Categorias</h3>
            <p className="text-muted-foreground mt-2">Gerenciar categorias de produtos</p>
          </a>

          <a
            href="/admin/delivery"
            className="card-cinematic hover:shadow-glow-cyan cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-bold text-white">Entrega</h3>
            <p className="text-muted-foreground mt-2">Configurar taxas de entrega</p>
          </a>

          <a
            href="/admin/reports"
            className="card-cinematic hover:shadow-glow-cyan cursor-pointer text-center"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white">Relatórios</h3>
            <p className="text-muted-foreground mt-2">Exportar dados em CSV/PDF</p>
          </a>
        </div>
      </div>
    </div>
  );
}
