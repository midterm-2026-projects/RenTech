import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ProtectedRoute from '../../components/ProtectedRoute';
import * as LoginModule from '../../components/Login';

function renderRoute(allowedRoles, content = <div>SECRET CONTENT</div>, initialEntries = ['/protected']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ProtectedRoute allowedRoles={allowedRoles}>
        {content}
      </ProtectedRoute>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    LoginModule.saveSession('Admin', 'admin', 'abc');
  });

  afterEach(() => {
    LoginModule.clearSession?.();
    vi.restoreAllMocks();
  });

  it('renders children when the session role is allowed', async () => {
    renderRoute(['Admin']);
    expect(await screen.findByText('SECRET CONTENT')).toBeInTheDocument();
  });

  it('redirects to /unauthorized when the role is not allowed', async () => {
    LoginModule.saveSession('Staff', 'staff', 'xyz');
    renderRoute(['Admin']);
    
    await waitFor(() => {
      expect(screen.queryByText('SECRET CONTENT')).not.toBeInTheDocument();
    });
  });

  it('redirects to /login when there is no session', async () => {
    LoginModule.clearSession?.();
    localStorage.clear();
    renderRoute(['Admin']);
    
    await waitFor(() => {
      expect(screen.queryByText('SECRET CONTENT')).not.toBeInTheDocument();
    });
  });

  it('shows a spinning indicator while checking authentication', () => {
    renderRoute(['Admin']);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects staff users to /unauthorized when only Admin is allowed', async () => {
    LoginModule.saveSession('Staff', 'staff', 'xyz');
    renderRoute(['Admin']);

    await waitFor(() => {
      expect(screen.queryByText('SECRET CONTENT')).not.toBeInTheDocument();
    });
  });

  it('allows access for any role when no allowedRoles restriction is set', async () => {
    LoginModule.saveSession('Staff', 'staff', 'xyz');
    renderRoute(undefined);

    await waitFor(() => {
      expect(screen.getByText('SECRET CONTENT')).toBeInTheDocument();
    });
  });

  it('allows multiple allowed roles to access the content', async () => {
    LoginModule.saveSession('Staff', 'staff', 'xyz');
    renderRoute(['Admin', 'Staff']);

    await waitFor(() => {
      expect(screen.getByText('SECRET CONTENT')).toBeInTheDocument();
    });
  });

  it('stops showing the spinner once the check completes', async () => {
    renderRoute(['Admin']);

    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });

  it('spinner contains the correct CSS animation class', () => {
    renderRoute(['Admin']);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner.className).toContain('rounded-full');
  });

  it('handles an expired session gracefully', async () => {
    LoginModule.saveSession('Admin', 'admin', 'abc');
    renderRoute(['Admin']);

    await waitFor(() => {
      expect(screen.getByText('SECRET CONTENT')).toBeInTheDocument();
    });
  });
});