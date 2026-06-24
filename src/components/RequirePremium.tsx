import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEntitlement } from "@/hooks/useEntitlement";

interface Props {
  children: ReactNode;
}

/**
 * Gate that requires:
 *  - Signed-in user
 *  - Completed onboarding
 *  - Active subscription (or founder)
 * Redirects to /paywall otherwise.
 */
export function RequirePremium({ children }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { isPremium, loading: entLoading } = useEntitlement();
  const location = useLocation();

  console.info('[routing] RequirePremium render', {
    path: location.pathname,
    authLoading,
    userId: user?.id ?? null,
    profileLoading,
    onboardingComplete: !!profile?.onboarding_completed,
    entLoading,
    isPremium,
  });

  if (authLoading || (user && (profileLoading || entLoading))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    console.info('[routing] RequirePremium → /welcome (no user)');
    return <Navigate to="/welcome" replace />;
  }
  if (!profile?.onboarding_completed) {
    console.info('[routing] RequirePremium → /onboarding');
    return <Navigate to="/onboarding" replace />;
  }
  if (!isPremium) {
    console.info('[routing] RequirePremium → /paywall');
    return <Navigate to="/paywall" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
