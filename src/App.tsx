import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import GroupSettings from "./pages/GroupSettings";
import CreateGroup from "./pages/CreateGroup";
import AddMenu from "./pages/AddMenu";
import AddGroupOptions from "./pages/AddGroupOptions";
import AddExpense from "./pages/AddExpense";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import Convert from "./pages/Convert";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import PaymentMethods from "./pages/PaymentMethods";
import JoinGroup from "./pages/JoinGroup";
import PersonalBudget from "./pages/PersonalBudget";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-pulse">
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
            EquiPay
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Landing />
        </PublicRoute>
      } />
      <Route path="/auth" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/groups" element={
        <ProtectedRoute>
          <Groups />
        </ProtectedRoute>
      } />
      
      <Route path="/groups/new" element={
        <ProtectedRoute>
          <CreateGroup />
        </ProtectedRoute>
      } />
      
      <Route path="/groups/:id" element={
        <ProtectedRoute>
          <GroupDetail />
        </ProtectedRoute>
      } />

      <Route path="/groups/:id/settings" element={
        <ProtectedRoute>
          <GroupSettings />
        </ProtectedRoute>
      } />
      
      <Route path="/add-expense" element={
        <ProtectedRoute>
          <AddExpense />
        </ProtectedRoute>
      } />

      <Route path="/add" element={
        <ProtectedRoute>
          <AddMenu />
        </ProtectedRoute>
      } />

      <Route path="/add/group" element={
        <ProtectedRoute>
          <AddGroupOptions />
        </ProtectedRoute>
      } />
      
      <Route path="/activity" element={
        <ProtectedRoute>
          <Activity />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/convert" element={
        <ProtectedRoute>
          <Convert />
        </ProtectedRoute>
      } />

      <Route path="/help" element={<Help />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/payment-methods" element={<PaymentMethods />} />

      <Route path="/join/:code" element={
        <ProtectedRoute>
          <JoinGroup />
        </ProtectedRoute>
      } />

      <Route path="/personal-budget" element={
        <ProtectedRoute>
          <PersonalBudget />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
