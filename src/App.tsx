import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
import { motion, AnimatePresence } from "framer-motion";
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

const queryClient = new QueryClient();

function Preloader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight"
        style={{ fontFamily: "Space Grotesk" }}
      >
        <span className="text-foreground">Equi</span>
        <motion.span
          className="text-primary"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Pay
        </motion.span>
      </motion.h1>
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <motion.h1
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-4xl sm:text-5xl font-bold tracking-tight"
          style={{ fontFamily: "Space Grotesk" }}
        >
          <span className="text-foreground">Equi</span>
          <span className="text-primary">Pay</span>
        </motion.h1>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
      <Route path="/groups/new" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
      <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
      <Route path="/groups/:id/settings" element={<ProtectedRoute><GroupSettings /></ProtectedRoute>} />
      <Route path="/add-expense" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
      <Route path="/add" element={<ProtectedRoute><AddMenu /></ProtectedRoute>} />
      <Route path="/add/group" element={<ProtectedRoute><AddGroupOptions /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/convert" element={<ProtectedRoute><Convert /></ProtectedRoute>} />
      <Route path="/help" element={<Help />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/payment-methods" element={<PaymentMethods />} />
      <Route path="/join/:code" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
      <Route path="/personal-budget" element={<ProtectedRoute><PersonalBudget /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <AnimatePresence mode="wait">
            {showPreloader && <Preloader onDone={() => setShowPreloader(false)} />}
          </AnimatePresence>
          {!showPreloader && (
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          )}
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
