import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import FindParking from "@/pages/find-parking";
import LotDetail from "@/pages/lot-detail";
import MyBookings from "@/pages/my-bookings";
import Payment from "@/pages/payment";
import QRTicket from "@/pages/qr-ticket";
import AdminDashboard from "@/pages/admin-dashboard";

// Auth & Layout
import { AuthProvider } from "@/lib/auth-context";
import { MainLayout } from "@/components/layout/main-layout";

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
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/find" component={FindParking} />
        <Route path="/lots/:id" component={LotDetail} />
        
        {/* Protected User Routes */}
        <Route path="/bookings" component={MyBookings} />
        <Route path="/bookings/:id/pay" component={Payment} />
        <Route path="/bookings/:id/qr" component={QRTicket} />
        
        {/* Admin Routes */}
        <Route path="/admin" component={AdminDashboard} />
        
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
