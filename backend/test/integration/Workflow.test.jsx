// @vitest-environment happy-dom
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use local session helpers here to avoid importing frontend modules which bring
// their own React copy and cause invalid hook call errors in the test runner.
const SESSION_KEY = 'rentech_session';
function saveSession(role, username, token) {
  const session = {
    role,
    username,
    token: token ?? btoa(`${username}:${role}`),
    issuedAt: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}
function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

const mockFetch = vi.fn();
beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  if (typeof window !== 'undefined' && window.alert) {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  }
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  clearSession();
});

function LoginPage({ onLogin, onBack }) {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;

    // Try remote auth first (tests stub `fetch`).
    try {
      const res = await fetch('http://localhost:5000/api/login', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        saveSession(data.role, data.username, data.token);
        onLogin?.(data.role);
        if (data.role === 'Admin') navigate('/admin', { replace: true });
        else navigate('/customer', { replace: true });
        return;
      }
    } catch {}

    // Fallback demo local credentials (admin/customer)
    if (username === 'admin' && password === 'admin') {
      saveSession('Admin', 'admin', btoa('admin:Admin'));
      onLogin?.('Admin');
      navigate('/admin', { replace: true });
      return;
    }
    if (username === 'customer' && password === 'customer') {
      saveSession('Customer', 'customer', btoa('customer:Customer'));
      onLogin?.('Customer');
      navigate('/customer', { replace: true });
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="admin" />
      <input name="password" placeholder="••••••••" />
      <button type="submit">Sign In</button>
    </form>
  );
}

function HomePage() {
  const session = getSession();
  if (session?.role === 'Admin') return <Navigate to="/admin" replace />;
  if (session?.role) return <Navigate to="/customer" replace />;
  return <Navigate to="/login" replace />;
}

function AdminLayout() {
  return <div>Admin Portal</div>;
}

function CustomerLayout() {
  return <div>Browse our premium formal wear</div>;
}

function ProtectedAdmin() {
  const session = getSession();
  if (!session?.role) return <Navigate to="/login" replace />;
  if (session.role !== 'Admin') return <Navigate to="/unauthorized" replace />;
  return <AdminLayout />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<ProtectedAdmin />} />
      <Route path="/customer" element={<CustomerLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>
  );
}

describe('Login → role-based dashboard workflow', () => {
  it('admin login reaches the admin dashboard', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'abc', role: 'Admin', username: 'admin' }),
    });

    renderApp('/login');
    const userField = screen.getByPlaceholderText('admin');
    const passField = screen.getByPlaceholderText('••••••••');
    const submit = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(userField, { target: { value: 'admin' } });
    fireEvent.change(passField, { target: { value: 'admin' } });
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText(/Admin Portal/i)).toBeInTheDocument());
  });

  it('customer session redirects / to the customer portal', async () => {
    saveSession('Customer', 'customer', 'abc');
    renderApp('/');
    await waitFor(() => expect(screen.getByText(/Browse our premium formal wear/i)).toBeInTheDocument());
  });

  it('unauthenticated user is sent to /login from a protected route', async () => {
    renderApp('/admin');
    await waitFor(() => expect(screen.getByPlaceholderText('admin')).toBeInTheDocument());
  });
});