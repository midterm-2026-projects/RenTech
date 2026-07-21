import { useState, useEffect } from 'react';
import { Users, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getStaffList, addStaff, removeStaff } from '../services/inventoryApiClient';

export default function StaffManagement({ onStaffChange }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaffList();
      setStaffList(Array.isArray(data) ? data : []);
    } catch {
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getStaffList();
        if (!cancelled) setStaffList(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setStaffList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('Both fields are required');
      return;
    }

    try {
      const result = await addStaff(username.trim(), password.trim());
      setSuccess(result.message || 'Staff added successfully');
      setUsername('');
      setPassword('');
      setShowPassword(false);
      await fetchStaff();
      if (onStaffChange) onStaffChange();
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to add staff';
      setError(msg);
    }
  };

  const handleDelete = async (targetUsername) => {
    setError('');
    setSuccess('');

    try {
      const result = await removeStaff(targetUsername);
      setSuccess(result.message || 'Staff removed');
      await fetchStaff();
      if (onStaffChange) onStaffChange();
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to remove staff';
      setError(msg);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-slate-800">
        <Users size={18} className="text-[#bf4a53]" />
        <span className="font-bold text-base text-slate-900">Staff Management</span>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-center w-full">
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-rose-400 transition-all"
          />
        </div>
        
        <div className="w-full sm:flex-1 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 pr-10 text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-rose-400 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-[#bf4a53] text-white font-bold text-sm rounded-full hover:bg-[#a63f47] transition-colors shadow-sm flex items-center justify-center gap-1 whitespace-nowrap"
        >
          + Add
        </button>
      </form>

      {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
      {success && <p className="text-emerald-600 text-xs ml-1">{success}</p>}

      <div className="space-y-3 pt-2">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
            <Loader2 size={14} className="animate-spin" />
            Loading staff...
          </div>
        ) : staffList.length === 0 ? (
          <p className="text-slate-400 text-sm py-2">No staff accounts yet.</p>
        ) : (
          staffList.map((member, index) => (
            <div key={member.username || index} className="flex justify-between items-center bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
              <div>
                <p className="text-sm font-bold text-slate-900">{member.username}</p>
                <p className="text-xs text-slate-400 mt-0.5">Role: {member.role}</p>
              </div>
              <button
                onClick={() => handleDelete(member.username)}
                className="text-rose-500 hover:text-rose-700 transition-colors p-2 rounded-xl hover:bg-rose-50"
                title="Delete staff account"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
