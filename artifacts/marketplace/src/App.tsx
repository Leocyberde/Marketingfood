import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "./components/Layout";
import { ClienteHome } from "./pages/cliente/Home";
import { ClienteStore } from "./pages/cliente/Store";
import { ClienteCheckout } from "./pages/cliente/Checkout";
import { ClienteOrder } from "./pages/cliente/Order";
import { LojistaDashboard } from "./pages/lojista/Dashboard";
import { AdminDashboard } from "./pages/admin/Dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Base redirect to cliente */}
        <Route path="/">
          <Redirect to="/cliente" />
        </Route>

        {/* Cliente Routes */}
        <Route path="/cliente" component={ClienteHome} />
        <Route path="/cliente/store/:id" component={ClienteStore} />
        <Route path="/cliente/checkout" component={ClienteCheckout} />
        <Route path="/cliente/order/:id" component={ClienteOrder} />

        {/* Lojista Route */}
        <Route path="/lojista" component={LojistaDashboard} />

        {/* Admin Route */}
        <Route path="/admin" component={AdminDashboard} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
