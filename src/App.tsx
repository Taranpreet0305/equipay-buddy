import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
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

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useApp();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />} />
      
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
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
