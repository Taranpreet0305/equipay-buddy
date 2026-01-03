import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import CreateGroup from "./pages/CreateGroup";
import AddExpense from "./pages/AddExpense";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl">💰</span>
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
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
      
      <Route path="/add-expense" element={
        <ProtectedRoute>
          <AddExpense />
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
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
