import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Clientes from './pages/admin/Clientes';
import ClienteDetalle from './pages/admin/ClienteDetalle';
import Configuracion from './pages/admin/Configuracion';
import ClienteDashboard from './pages/cliente/Dashboard';
import FormAutomotores from './pages/formularios/Automotores';
import FormIncendio from './pages/formularios/Incendio';
import FormCristales from './pages/formularios/Cristales';
import FormRC from './pages/formularios/RC';
import FormAvisoViaje from './pages/formularios/AvisoViaje';

function RequireAuth({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.rol !== role) return <Navigate to={user.rol === 'admin' ? '/admin' : '/cliente'} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.rol === 'admin' ? '/admin' : '/cliente'} replace /> : <Login />} />

      {/* Admin */}
      <Route path="/admin" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
      <Route path="/admin/clientes" element={<RequireAuth role="admin"><Clientes /></RequireAuth>} />
      <Route path="/admin/clientes/:id" element={<RequireAuth role="admin"><ClienteDetalle /></RequireAuth>} />
      <Route path="/admin/configuracion" element={<RequireAuth role="admin"><Configuracion /></RequireAuth>} />

      {/* Cliente */}
      <Route path="/cliente" element={<RequireAuth role="cliente"><ClienteDashboard /></RequireAuth>} />
      <Route path="/formulario/automotores" element={<RequireAuth role="cliente"><FormAutomotores /></RequireAuth>} />
      <Route path="/formulario/incendio" element={<RequireAuth role="cliente"><FormIncendio /></RequireAuth>} />
      <Route path="/formulario/cristales" element={<RequireAuth role="cliente"><FormCristales /></RequireAuth>} />
      <Route path="/formulario/rc" element={<RequireAuth role="cliente"><FormRC /></RequireAuth>} />
      <Route path="/formulario/aviso-viaje" element={<RequireAuth role="cliente"><FormAvisoViaje /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
