import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { login } from '../services/authService';

function FindDeeLogo() {
  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Sparkles */}
      <svg className="absolute -top-3 -left-6 w-8 h-8 opacity-80" viewBox="0 0 32 32" fill="none">
        <path d="M8 4 L9.5 8 L13.5 9.5 L9.5 11 L8 15 L6.5 11 L2.5 9.5 L6.5 8 Z" fill="#3281D1"/>
        <path d="M22 2 L23 4.5 L25.5 5.5 L23 6.5 L22 9 L21 6.5 L18.5 5.5 L21 4.5 Z" fill="#034EA2" opacity="0.7"/>
      </svg>
      {/* Main logo text */}
      <div className="flex items-center">
        <span className="text-5xl font-black tracking-tight text-[#154194]">Find</span>
        {/* The "D" as a circle with magnifying glass */}
        <span className="relative mx-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#034EA2] to-[#154194] shadow-lg">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10.5" cy="10.5" r="5.5" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <span className="text-5xl font-black tracking-tight text-[#154194]">ee</span>
      </div>
      {/* Subtitle pill */}
      <div className="mt-3 rounded-full bg-gradient-to-r from-[#034EA2] to-[#3281D1] px-5 py-1.5 shadow-md">
        <span className="text-sm font-semibold tracking-wide text-white">Find Data Easily &amp; Efficiently</span>
      </div>
    </div>
  );
}

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      onLogin(user);
    } catch (err) {
      const msg = err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F0F6FD] via-white to-[#EBF2FA] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <FindDeeLogo />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
          <h2 className="mb-1 text-xl font-semibold text-slate-800">เข้าสู่ระบบ</h2>
          <p className="mb-6 text-sm text-slate-500">กรุณากรอก Username และ Password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="กรอก Username"
                required
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#034EA2] focus:bg-white focus:ring-2 focus:ring-[#D9E8F7]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="กรอก Password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-11 text-sm text-slate-800 outline-none transition focus:border-[#034EA2] focus:bg-white focus:ring-2 focus:ring-[#D9E8F7]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#034EA2] py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#154194] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 FindDee — Find Data Easily &amp; Efficiently
        </p>
      </div>
    </div>
  );
}

