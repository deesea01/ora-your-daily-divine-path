import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// --- Mocks must be declared before importing the component under test ---
vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/hooks/useUserProfile', () => ({ useUserProfile: vi.fn() }));
vi.mock('@/hooks/useOnboardingResponses', () => ({
  useOnboardingResponses: () => ({ save: vi.fn() }),
}));
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', setLanguage: vi.fn(), t: (k: string) => k }),
}));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({ upsert: vi.fn().mockResolvedValue({ error: null }) }),
  },
}));

import Onboarding from './Onboarding';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

const renderAt = () =>
  render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <Onboarding />
    </MemoryRouter>,
  );

describe('Onboarding — stable hook order across states', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the loading spinner when auth is loading', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: true });
    (useUserProfile as any).mockReturnValue({
      profile: null,
      loading: false,
      saveProfile: vi.fn(),
    });
    expect(() => renderAt()).not.toThrow();
  });

  it('renders the loading spinner when profile is loading', () => {
    (useAuth as any).mockReturnValue({
      user: { id: 'u1', email: 't@x.com' },
      loading: false,
    });
    (useUserProfile as any).mockReturnValue({
      profile: null,
      loading: true,
      saveProfile: vi.fn(),
    });
    expect(() => renderAt()).not.toThrow();
  });

  it('renders the welcome step when user + profile resolved (no plan yet)', () => {
    (useAuth as any).mockReturnValue({
      user: { id: 'u1', email: 't@x.com' },
      loading: false,
    });
    (useUserProfile as any).mockReturnValue({
      profile: { onboarding_completed: false },
      loading: false,
      saveProfile: vi.fn(),
    });
    expect(() => renderAt()).not.toThrow();
  });

  it('redirects (no throw) when onboarding is already completed', () => {
    (useAuth as any).mockReturnValue({
      user: { id: 'u1', email: 't@x.com' },
      loading: false,
    });
    (useUserProfile as any).mockReturnValue({
      profile: { onboarding_completed: true },
      loading: false,
      saveProfile: vi.fn(),
    });
    expect(() => renderAt()).not.toThrow();
  });

  it('does not throw when transitioning between loading and resolved states', () => {
    // First render: loading
    (useAuth as any).mockReturnValue({ user: null, loading: true });
    (useUserProfile as any).mockReturnValue({
      profile: null,
      loading: true,
      saveProfile: vi.fn(),
    });
    const { rerender } = renderAt();

    // Second render: resolved — hook order MUST stay identical.
    (useAuth as any).mockReturnValue({
      user: { id: 'u1', email: 't@x.com' },
      loading: false,
    });
    (useUserProfile as any).mockReturnValue({
      profile: { onboarding_completed: false },
      loading: false,
      saveProfile: vi.fn(),
    });
    expect(() =>
      rerender(
        <MemoryRouter initialEntries={['/onboarding']}>
          <Onboarding />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });
});
