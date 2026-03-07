import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import StoreList from "./pages/cliente/StoreList";
import StoreDetails from "./pages/cliente/StoreDetails";
import AddressManager from "./pages/cliente/AddressManager";
import LojistaDashboard from "./pages/lojista/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => <Redirect to="/cliente" />}
      </Route>
      
      {/* Cliente Routes */}
      <Route path="/cliente" component={StoreList} />
      <Route path="/cliente/loja/:id" component={StoreDetails} />
      <Route path="/cliente/enderecos" component={AddressManager} />
      
      {/* Lojista Routes */}
      <Route path="/lojista" component={LojistaDashboard} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
