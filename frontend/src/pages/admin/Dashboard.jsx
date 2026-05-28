import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, TrendingUp } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../api';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
      <div className={`p-3.5 rounded-xl ${bg}`}>
        <Icon size={24} className={color} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    api.get('/usuarios').then(r => setClientes(r.data)).catch(() => {});
  }, []);

  const activos = clientes.filter(c => c.activo).length;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B3568]">Panel de Administración</h1>
        <p className="text-slate-500 mt-1 text-sm">Resumen general del sistema CEAR</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard icon={Users} label="Clientes registrados" value={clientes.length}
          color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={ShieldCheck} label="Clientes activos" value={activos}
          color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={TrendingUp} label="Formularios disponibles" value={5}
          color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800 text-base">Últimos clientes</h2>
          <Link to="/admin/clientes"
            className="text-[#1B3568] text-sm font-medium hover:underline">
            Ver todos →
          </Link>
        </div>

        {clientes.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No hay clientes registrados aún</p>
            <Link to="/admin/clientes/nuevo" className="mt-3 inline-block text-[#1B3568] text-sm font-medium hover:underline">
              Crear primer cliente →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuario</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {clientes.slice(0, 8).map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-700">{c.apellido}, {c.nombre}</td>
                    <td className="py-3 px-3 text-slate-500">{c.username}</td>
                    <td className="py-3 px-3 text-slate-500">{c.email || '—'}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${c.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
