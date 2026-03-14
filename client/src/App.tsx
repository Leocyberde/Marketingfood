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
import StoreProfile from "./pages/StoreProfile";
import ClientCatalog from "./pages/ClientCatalog";
import ClientCheckout from "./pages/ClientCheckout";
import ClientOrders from "./pages/ClientOrders";
import ClientRateOrder from "./pages/ClientRateOrder";
import ClientProfile from "./pages/ClientProfile";
import StoreReports from "./pages/StoreReports";

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
      <Route path={"/store/profile"} component={StoreProfile} />
      
      {/* Client Routes */}
      <Route path={"/catalog"} component={ClientCatalog} />
      <Route path={"/checkout"} component={ClientCheckout} />
      <Route path={"/orders"} component={ClientOrders} />
      <Route path={"/rate-order/:orderId"} component={ClientRateOrder} />
      <Route path={"/profile"} component={ClientProfile} />
      
      {/* Store Reports */}
      <Route path={"/store/reports"} component={StoreReports} />
      
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
