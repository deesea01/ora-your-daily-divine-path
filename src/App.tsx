import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import MonkChat from "./pages/MonkChat.tsx";
import PrayerDetail from "./pages/PrayerDetail.tsx";
import Rosary from "./pages/Rosary.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import GuideSelect from "./pages/GuideSelect.tsx";
import Impact from "./pages/Impact.tsx";
import ConfessionDashboard from "./pages/ConfessionDashboard.tsx";
import ExaminationOfConscience from "./pages/ExaminationOfConscience.tsx";
import ConfessionPrepSummary from "./pages/ConfessionPrepSummary.tsx";
import LogConfession from "./pages/LogConfession.tsx";
import ConfessionHistory from "./pages/ConfessionHistory.tsx";
import ConfessionPrivacy from "./pages/ConfessionPrivacy.tsx";
import PrayerLibrary from "./pages/PrayerLibrary.tsx";
import PrayerView from "./pages/PrayerView.tsx";
import PrayerRoutines from "./pages/PrayerRoutines.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/monk-chat" element={<MonkChat />} />
              <Route path="/prayer/:type" element={<PrayerDetail />} />
              <Route path="/rosary" element={<Rosary />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/guide" element={<GuideSelect />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/confession" element={<ConfessionDashboard />} />
              <Route path="/confession/examine" element={<ExaminationOfConscience />} />
              <Route path="/confession/prep" element={<ConfessionPrepSummary />} />
              <Route path="/confession/log" element={<LogConfession />} />
              <Route path="/confession/history" element={<ConfessionHistory />} />
              <Route path="/confession/privacy" element={<ConfessionPrivacy />} />
              <Route path="/prayer-library" element={<PrayerLibrary />} />
              <Route path="/prayer-library/routines" element={<PrayerRoutines />} />
              <Route path="/prayer-library/:prayerId" element={<PrayerView />} />
              <Route path="/journal" element={<JournalHome />} />
              <Route path="/journal/examen" element={<JournalExamen />} />
              <Route path="/journal/write" element={<JournalWrite />} />
              <Route path="/journal/prompts" element={<JournalPrompts />} />
              <Route path="/journal/insights" element={<JournalInsights />} />
              <Route path="/journal/privacy" element={<JournalPrivacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
