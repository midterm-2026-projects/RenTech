import { useState } from 'react';

const SESSION_KEY = 'rentech_session';

const API = 'http://localhost:5000/api/auth';

function saveSession(role, username) {
  const session = {
    role,
    username,
    token: btoa(`${username}:${role}:${Date.now()}`),
    issuedAt: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export default function Signup({ onLogin, onBack, onNavigateToLogin }) {
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    const formattedUsername = signupUsername.trim().toLowerCase();

    if (!formattedUsername || !signupPassword || !signupConfirm) {
      setError('Please fill in all fields');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formattedUsername, password: signupPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Signup failed');
        return;
      }
      saveSession('Customer', formattedUsername);
      onLogin('Customer');
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#fcfcfd]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-gray-100/80">

        {onBack && (
          <button
            onClick={onBack}
            className="text-xs text-[#bf4a53] font-semibold mb-4 block hover:underline"
          >
            ← Back to Home
          </button>
        )}

        <div className="flex justify-center mb-6">
          <img src="/RenTech.png" alt="RENTECH Logo" className="w-16 h-16" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Create Account</h2>
        <p className="text-center text-gray-500 text-sm mb-6">Sign up for a RenTech account</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              Choose Username
            </label>
            <input
              type="text"
              required
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
              placeholder="newcustomer"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              required
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={signupConfirm}
              onChange={(e) => setSignupConfirm(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-400 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-semibold text-center bg-red-50 py-2 px-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#bf4a53] text-white font-semibold rounded-full hover:bg-[#a63f47] transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-gray-500 text-xs mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-[#bf4a53] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer ml-1 inline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}