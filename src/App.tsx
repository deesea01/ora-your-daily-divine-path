import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import RouteTransition from "@/components/RouteTransition";
import Index from "./pages/Index.tsx";
import Welcome from "./pages/Welcome.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import MonkChat from "./pages/MonkChat.tsx";
import PrayerDetail from "./pages/PrayerDetail.tsx";
import Rosary from "./pages/Rosary.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsOfService from "./pages/TermsOfService.tsx";
import RefundPolicy from "./pages/RefundPolicy.tsx";
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
import JournalHome from "./pages/JournalHome.tsx";
import JournalExamen from "./pages/JournalExamen.tsx";
import Settings from "./pages/Settings.tsx";
import Paywall from "./pages/Paywall.tsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import WeeklyRecap from "./pages/WeeklyRecap.tsx";
import NotFound from "./pages/NotFound.tsx";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { AuthNav } from "@/components/AuthNav";
import { AuthFooterFallback } from "@/components/AuthFooterFallback";
import { RequirePremium } from "@/components/RequirePremium";
import SpiritualJourney from "./pages/SpiritualJourney.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PaymentTestModeBanner />
            <AuthNav />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/paywall" element={<Paywall />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/settings" element={<Settings />} />

              {/* Premium-gated routes */}
              <Route path="/monk-chat" element={<RequirePremium><MonkChat /></RequirePremium>} />
              <Route path="/prayer/:type" element={<RequirePremium><PrayerDetail /></RequirePremium>} />
              <Route path="/rosary" element={<RequirePremium><Rosary /></RequirePremium>} />
              <Route path="/guide" element={<RequirePremium><GuideSelect /></RequirePremium>} />
              <Route path="/impact" element={<RequirePremium><Impact /></RequirePremium>} />
              <Route path="/journey" element={<RequirePremium><SpiritualJourney /></RequirePremium>} />
              <Route path="/confession" element={<RequirePremium><ConfessionDashboard /></RequirePremium>} />
              <Route path="/confession/examine" element={<RequirePremium><ExaminationOfConscience /></RequirePremium>} />
              <Route path="/confession/prep" element={<RequirePremium><ConfessionPrepSummary /></RequirePremium>} />
              <Route path="/confession/log" element={<RequirePremium><LogConfession /></RequirePremium>} />
              <Route path="/confession/history" element={<RequirePremium><ConfessionHistory /></RequirePremium>} />
              <Route path="/confession/privacy" element={<RequirePremium><ConfessionPrivacy /></RequirePremium>} />
              <Route path="/prayer-library" element={<RequirePremium><PrayerLibrary /></RequirePremium>} />
              <Route path="/prayer-library/routines" element={<RequirePremium><PrayerRoutines /></RequirePremium>} />
              <Route path="/prayer-library/:prayerId" element={<RequirePremium><PrayerView /></RequirePremium>} />
              <Route path="/journal" element={<RequirePremium><JournalHome /></RequirePremium>} />
              <Route path="/journal/examen" element={<RequirePremium><JournalExamen /></RequirePremium>} />
              <Route path="/recap" element={<RequirePremium><WeeklyRecap /></RequirePremium>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
