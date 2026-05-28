import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CearLogo from '../components/CearLogo';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(user.rol === 'admin' ? '/admin' : '/cliente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0e1a3a 0%, #1B3568 55%, #2348a0 100%)' }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex flex-col items-center text-center">
          <CearLogo size={180} dark />
          <h1 className="text-white text-3xl font-bold mt-8 leading-snug">
            Sistema de Gestión<br />
            <span className="text-blue-300">de Siniestros</span>
          </h1>
          <p className="text-blue-200 mt-4 text-base leading-relaxed max-w-sm">
            Plataforma digital para la denuncia y seguimiento<br />de siniestros asegurados.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5" />
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 animate-fade-in">
          {/* Mobile logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <CearLogo size={90} />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1B3568]">Bienvenido</h2>
            <p className="text-slate-500 mt-1 text-sm">Ingresá con tu usuario y contraseña</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="tu_usuario"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3568]/30
                           focus:border-[#1B3568] transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800
                             placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3568]/30
                             focus:border-[#1B3568] transition text-sm"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm
                         bg-[#1B3568] hover:bg-[#162654] text-white transition-all duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#1B3568]/30
                         hover:shadow-lg hover:shadow-[#1B3568]/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <LogIn size={17} />
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} CEAR · Cobertura Educativa · Asesores de Seguros
          </p>
        </div>
      </div>
    </div>
  );
}
