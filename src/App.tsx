import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import MonkChat from "./pages/MonkChat.tsx";
import PrayerDetail from "./pages/PrayerDetail.tsx";
import Rosary from "./pages/Rosary.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import GuideSelect from "./pages/GuideSelect.tsx";
import Impact from "./pages/Impact.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/monk-chat" element={<MonkChat />} />
            <Route path="/prayer/:type" element={<PrayerDetail />} />
            <Route path="/rosary" element={<Rosary />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/guide" element={<GuideSelect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
