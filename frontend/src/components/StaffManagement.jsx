import { useState } from 'react';
import { Users, Trash2, Eye, EyeOff } from 'lucide-react';

export default function StaffManagement({ onAddRole, onDeleteRole, existingRoles = [] }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Both fields are required');
      return;
    }

    if (onAddRole) {
      onAddRole({
        username: username.trim().toLowerCase(),
        password: password.trim(),
        role: 'Staff'
      });
    }

    setUsername('');
    setPassword('');
    setShowPassword(false);
    setError('');
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 text-gray-700 font-semibold mb-6">
        <Users size={18} className="text-[#bf4a53]" />
        <span className="text-sm tracking-wide">Staff Management</span>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-center w-full">
        <div className="w-full sm:flex-1">
          <input
            type="text"
            placeholder="customer"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-100 border border-transparent rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-300 transition-all"
          />
        </div>
        
        <div className="w-full sm:flex-1 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-100 border border-transparent rounded-2xl px-4 py-3 pr-10 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-300 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-[#bf4a53] text-white font-medium text-sm rounded-full hover:bg-[#a63f47] transition-colors shadow-sm flex items-center justify-center gap-1 whitespace-nowrap"
        >
          + Add
        </button>
      </form>

      {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}

      <div className="mt-6 space-y-4">
        {existingRoles.map((user, index) => (
          <div key={index} className="flex justify-between items-center border-t border-gray-50 pt-4 px-1">
            <div>
              <p className="text-sm font-medium text-gray-800">{user.username}</p>
              <p className="text-xs text-gray-400 mt-0.5">Password: {user.password}</p>
            </div>
            {onDeleteRole && (
              <button
                onClick={() => onDeleteRole(user.username)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-50"
                title="Delete staff account"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}