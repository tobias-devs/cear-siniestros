import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CearLogo from './CearLogo';
import api from '../api';
import {
  LayoutDashboard, Users, LogOut, Shield,
  Car, Flame, GlassWater, Scale, Plane, Settings
} from 'lucide-react';

const adminMainLinks = [
  { to: '/admin', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

const allClienteLinks = [
  { to: '/cliente', label: 'Mis Formularios', icon: LayoutDashboard, end: true, key: 'dashboard' },
  { to: '/formulario/automotores', label: 'Automotores', icon: Car, key: 'automotores' },
  { to: '/formulario/incendio', label: 'Incendio', icon: Flame, key: 'incendio' },
  { to: '/formulario/cristales', label: 'Cristales', icon: GlassWater, key: 'cristales' },
  { to: '/formulario/rc', label: 'Resp. Civil', icon: Scale, key: 'rc' },
  { to: '/formulario/aviso-viaje', label: 'Aviso de Viaje', icon: Plane, key: 'aviso_viaje' },
];

function getVisibleLinks(polizas) {
  const has = {
    automotores: polizas.some(p => p.tipo === 'automotores'),
    incendio: polizas.some(p => p.tipo === 'integral_comercio' && p.cubre_incendio),
    cristales: polizas.some(p => p.tipo === 'integral_comercio' && p.cubre_cristales),
    rc: polizas.some(p => p.tipo === 'integral_comercio' && p.cubre_rc),
    aviso_viaje: polizas.some(p => p.tipo === 'integral_comercio' && p.cubre_aviso_viaje),
  };
  return allClienteLinks.filter(link => link.key === 'dashboard' || has[link.key]);
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [polizas, setPolizas] = useState(null);

  useEffect(() => {
    if (user?.rol !== 'admin') {
      api.get('/polizas/mis-polizas')
        .then(r => setPolizas(r.data))
        .catch(() => setPolizas([]));
    }
  }, [user]);

  const links = user?.rol === 'admin'
    ? adminMainLinks
    : polizas === null
      ? allClienteLinks
      : getVisibleLinks(polizas);

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
     ${isActive
       ? 'bg-white text-[#1B3568] shadow-sm font-semibold'
       : 'text-blue-100 hover:bg-white/10 hover:text-white'}`;

  return (
    <aside className="w-64 min-h-screen bg-[#1B3568] flex flex-col fixed top-0 left-0 z-40 shadow-xl">
      {/* Logo area */}
      <div className="flex flex-col items-center py-8 px-4 border-b border-white/10">
        <Link to={user?.rol === 'admin' ? '/admin' : '/cliente'} className="hover:opacity-80 transition-opacity">
          <CearLogo size={72} dark />
        </Link>
      </div>

      {/* User badge */}
      <div className="mx-4 mt-4 mb-2 bg-white/10 rounded-xl px-4 py-3">
        <p className="text-white text-sm font-semibold truncate">{user?.nombre} {user?.apellido}</p>
        <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-200">
          <Shield size={11} />
          {user?.rol === 'admin' ? 'Administrador' : 'Cliente'}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium
                     text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-150"
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
