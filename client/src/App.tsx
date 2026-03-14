import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStores from "./pages/AdminStores";
import AdminCategories from "./pages/AdminCategories";
import AdminDelivery from "./pages/AdminDelivery";
import StoreProducts from "./pages/StoreProducts";
import StoreOrders from "./pages/StoreOrders";
import ClientCatalog from "./pages/ClientCatalog";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      
      {/* Admin Routes */}
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/stores"} component={AdminStores} />
      <Route path={"/admin/categories"} component={AdminCategories} />
      <Route path={"/admin/delivery"} component={AdminDelivery} />
      
      {/* Store Routes */}
      <Route path={"/store/products"} component={StoreProducts} />
      <Route path={"/store/orders"} component={StoreOrders} />
      
      {/* Client Routes */}
      <Route path={"/catalog"} component={ClientCatalog} />
      
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
