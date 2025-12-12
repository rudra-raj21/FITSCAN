import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import AddMeal from "./pages/AddMeal";
import Summary from "./pages/Summary";
import Profile from "./pages/Profile";
import MealPlanner from "./pages/MealPlanner";
import AIChatbot from "./pages/AIChatbot";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/" element={<Index />} />
            <Route path="/add-meal" element={<AddMeal />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/meal-planner" element={<MealPlanner />} />
            <Route path="/ai-chatbot" element={<AIChatbot />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
