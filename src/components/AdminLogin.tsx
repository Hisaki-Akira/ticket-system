import React, { useState } from 'react';
import { Lock, User, PlaneTakeoff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUser = import.meta.env.VITE_ADMIN_USER || 'admin';
    const validPass = import.meta.env.VITE_ADMIN_PASS || 'password123';

    if (username === validUser && password === validPass) {
      setError('');
      onLogin();
      navigate('/admin');
    } else {
      setError('IDまたはパスワードが正しくありません。');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-950/50">
          <PlaneTakeoff className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            運航管理コンソール ログイン
          </h2>
          <p className="mt-1 text-xs font-mono tracking-widest text-sky-400">
            SHIBAURA TECH AIRWAYS
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#11192C] py-8 px-6 sm:px-8 border border-slate-800 rounded-2xl shadow-2xl space-y-6">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg flex items-center space-x-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-400">
                管理者ID (STAFF ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-400">
                パスワード (PASSWORD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-md shadow-sky-950/40 cursor-pointer"
              >
                ログイン
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center space-y-2">
            <p className="text-[11px] font-mono text-slate-500">
              ※ 初期認証情報: admin / password123
            </p>
            <div>
              <Link 
                to="/" 
                className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>出発案内ボードへ戻る</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
