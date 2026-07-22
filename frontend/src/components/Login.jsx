import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const MOCK_USERS = {
  admin: { password: 'admin', role: 'Admin' },
  customer: { password: 'customer', role: 'Customer' },
};

const API = 'http://localhost:5000/api/auth';

const SESSION_KEY = 'rentech_session';

export function saveSession(role, username) {
  const session = {
    role,
    username,
    token: btoa(`${username}:${role}:${Date.now()}`),
    issuedAt: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function Login({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  useEffect(() => {
    const session = getSession();
    if (session?.role && session?.token) {
      onLogin(session.role);
    }
  }, []);

  const apiFetch = async (path, body) => {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return { ok: res.ok, ...json };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const name = username.trim().toLowerCase();
    if (apiAvailable) {
      setLoading(true);
      try {
        const res = await apiFetch('/signin', { username: name, password });
        if (res.ok) {
          saveSession(res.data.role, res.data.username);
          onLogin(res.data.role);
          return;
        }
      } catch { setApiAvailable(false); }
      setLoading(false);
    }
    const user = MOCK_USERS[name];
    if (user && user.password === password) {
      saveSession(user.role, name);
      onLogin(user.role);
    } else {
      setError('Invalid username or password');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!signupUsername || !signupPassword || !signupConfirm) {
      setError('Please fill in all fields');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/signup', { username: signupUsername.trim().toLowerCase(), password: signupPassword });
      if (!res.ok) {
        setError(res.message || 'Signup failed');
        return;
      }
      saveSession('Customer', signupUsername.trim().toLowerCase());
      onLogin('Customer');
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-gray-100/80">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="text-center text-gray-500 text-sm mb-6">{isSignup ? 'Sign up for a RenTech account' : 'Sign in to your RenTech account'}</p>

        {/* --- SIGN UP FORM --- */}
        {isSignup ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Username</label>
              <input type="text" required value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showSignupPassword ? 'text' : 'password'} required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:bg-white transition-all pr-10" />
                <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSignupPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <input type={showSignupConfirm ? 'text' : 'password'} required value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:bg-white transition-all pr-10" />
                <button type="button" onClick={() => setShowSignupConfirm(!showSignupConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSignupConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-semibold text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50">{loading ? 'Creating account...' : 'Sign Up'}</button>
          </form>
        ) : (
          /* --- LOGIN FORM --- */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:bg-white transition-all" placeholder="admin" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:bg-white transition-all pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-semibold text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
        )}

        <p className="text-center text-gray-500 text-xs mt-4">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={toggleMode} className="text-[#bf4a53] font-bold hover:underline cursor-pointer">
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {!isSignup && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Demo credentials: <br /> admin / admin | customer / customer
          </p>
        )}
      </div>
    </div>
  );
}