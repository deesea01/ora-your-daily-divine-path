import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/hooks/useAuth';

describe('AuthNav', () => {
  it('shows Sign In and Create Account when logged out', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: false, signOut: vi.fn() });
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AuthNav />
      </MemoryRouter>
    );
    expect(container.querySelector('[data-testid="auth-nav-signin"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="auth-nav-signup"]')).not.toBeNull();
  });

  it('shows profile button when logged in', () => {
    (useAuth as any).mockReturnValue({
      user: { email: 'test@example.com', id: '1' },
      loading: false,
      signOut: vi.fn(),
    });
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AuthNav />
      </MemoryRouter>
    );
    expect(container.querySelector('[data-testid="auth-nav-profile"]')).not.toBeNull();
  });

  it('hides on /auth route', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: false, signOut: vi.fn() });
    const { container } = render(
      <MemoryRouter initialEntries={['/auth']}>
        <AuthNav />
      </MemoryRouter>
    );
    expect(container.querySelector('[data-testid="auth-nav"]')).toBeNull();
  });
});
