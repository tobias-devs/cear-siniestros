import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Car, Building2 } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../api';
import Toast from '../../components/Toast';

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm
                   focus:outline-none focus:ring-2 focus:ring-[#1B3568]/20 focus:border-[#1B3568] transition"
        {...props}
      />
    </div>
  );
}

function PolizaCard({ poliza, onDelete }) {
  const tipo = poliza.tipo === 'automotores' ? 'Automotores' : 'Integral de Comercio';
  const Icon = poliza.tipo === 'automotores' ? Car : Building2;
  const coberturas = poliza.tipo === 'integral_comercio'
    ? [poliza.cubre_incendio && 'Incendio', poliza.cubre_cristales && 'Cristales',
       poliza.cubre_rc && 'Resp. Civil', poliza.cubre_aviso_viaje && 'Aviso de Viaje'].filter(Boolean)
    : (poliza.patentes || []);

  return (
    <div className="border border-slate-200 rounded-xl p-4 flex items-start justify-between hover:border-slate-300 transition">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${poliza.tipo === 'automotores' ? 'bg-blue-50' : 'bg-purple-50'}`}>
          <Icon size={18} className={poliza.tipo === 'automotores' ? 'text-blue-600' : 'text-purple-600'} />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm">{tipo}</p>
          <p className="text-xs text-slate-500 mt-0.5">N° {poliza.numero_poliza}</p>
          <p className="text-xs text-slate-400 mt-1">{poliza.fecha_inicio} → {poliza.fecha_fin}</p>
          {coberturas.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {coberturas.map(c => (
                <span key={c} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{c}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <button onClick={() => onDelete(poliza.id)} className="text-slate-400 hover:text-red-500 transition p-1">
        <Trash2 size={15} />
      </button>
    </div>
  );
}

const EMPTY_POLIZA = {
  tipo: 'automotores', numero_poliza: '', fecha_inicio: '', fecha_fin: '',
  cubre_incendio: false, cubre_cristales: false, cubre_rc: false, cubre_aviso_viaje: false,
  patentes: [''],
};

export default function ClienteDetalle() {
  const { id } = useParams();
  const isNew = id === 'nuevo';
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', cuil: '', direccion: '', email: '', username: '', password: '' });
  const [polizas, setPolizas] = useState([]);
  const [showPolizaForm, setShowPolizaForm] = useState(false);
  const [newPoliza, setNewPoliza] = useState(EMPTY_POLIZA);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      api.get(`/usuarios/${id}`).then(r => setForm({ ...r.data, password: '' }));
      api.get(`/polizas/usuario/${id}`).then(r => setPolizas(r.data));
    }
  }, [id, isNew]);

  const saveUsuario = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const { data } = await api.post('/usuarios', form);
        setToast({ message: 'Cliente creado exitosamente', type: 'success' });
        navigate(`/admin/clientes/${data.id}`);
      } else {
        await api.put(`/usuarios/${id}`, form);
        setToast({ message: 'Cliente actualizado', type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error al guardar', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const savePoliza = async () => {
    try {
      await api.post('/polizas', { ...newPoliza, usuario_id: Number(id) });
      setToast({ message: 'Póliza agregada', type: 'success' });
      setShowPolizaForm(false);
      setNewPoliza(EMPTY_POLIZA);
      api.get(`/polizas/usuario/${id}`).then(r => setPolizas(r.data));
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error al guardar póliza', type: 'error' });
    }
  };

  const deletePoliza = async (polizaId) => {
    await api.delete(`/polizas/${polizaId}`);
    setPolizas(p => p.filter(x => x.id !== polizaId));
    setToast({ message: 'Póliza eliminada', type: 'success' });
  };

  const setF = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const setNP = (field, val) => setNewPoliza(p => ({ ...p, [field]: val }));

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/admin/clientes')}
          className="p-2 rounded-xl hover:bg-slate-200 text-slate-600 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3568]">
            {isNew ? 'Nuevo cliente' : `${form.apellido}, ${form.nombre}`}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{isNew ? 'Completá los datos del nuevo cliente' : 'Editá los datos y pólizas'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={saveUsuario} className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-2">Datos personales</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre *" value={form.nombre} onChange={e => setF('nombre', e.target.value)} required />
            <Input label="Apellido" value={form.apellido} onChange={e => setF('apellido', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="DNI/CUIT" value={form.cuil || ''} onChange={e => setF('cuil', e.target.value)} placeholder="20-12345678-9" />
            <Input label="Email" type="email" value={form.email || ''} onChange={e => setF('email', e.target.value)} />
          </div>
          <Input label="Dirección" value={form.direccion || ''} onChange={e => setF('direccion', e.target.value)} />

          <hr className="border-slate-100 my-2" />
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Acceso al sistema</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Usuario *" value={form.username} onChange={e => setF('username', e.target.value)} required />
            <Input label={isNew ? 'Contraseña *' : 'Nueva contraseña'} type="password"
              value={form.password} onChange={e => setF('password', e.target.value)}
              required={isNew} placeholder={isNew ? '' : 'Dejar vacío para no cambiar'} />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1B3568] text-white text-sm font-semibold
                         rounded-xl hover:bg-[#162654] transition disabled:opacity-60">
              <Save size={15} /> {saving ? 'Guardando...' : 'Guardar cliente'}
            </button>
          </div>
        </form>

        {/* Pólizas */}
        {!isNew && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Pólizas</h2>
                <button onClick={() => setShowPolizaForm(p => !p)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#1B3568] hover:underline">
                  <Plus size={14} /> Agregar
                </button>
              </div>

              <div className="space-y-3">
                {polizas.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sin pólizas asignadas</p>}
                {polizas.map(p => <PolizaCard key={p.id} poliza={p} onDelete={deletePoliza} />)}
              </div>
            </div>

            {/* Nueva póliza form */}
            {showPolizaForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 space-y-3 animate-fade-in">
                <h3 className="font-semibold text-slate-700 text-sm">Nueva póliza</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo</label>
                  <select value={newPoliza.tipo} onChange={e => setNP('tipo', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3568]/20">
                    <option value="automotores">Automotores</option>
                    <option value="integral_comercio">Integral de Comercio</option>
                  </select>
                </div>
                <Input label="N° de póliza" value={newPoliza.numero_poliza} onChange={e => setNP('numero_poliza', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Inicio" type="date" value={newPoliza.fecha_inicio} onChange={e => setNP('fecha_inicio', e.target.value)} />
                  <Input label="Vencimiento" type="date" value={newPoliza.fecha_fin} onChange={e => setNP('fecha_fin', e.target.value)} />
                </div>

                {newPoliza.tipo === 'automotores' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Patentes</label>
                    {newPoliza.patentes.map((pat, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input value={pat} onChange={e => {
                          const arr = [...newPoliza.patentes]; arr[i] = e.target.value; setNP('patentes', arr);
                        }} placeholder="ABC 123" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3568]/20" />
                        {newPoliza.patentes.length > 1 &&
                          <button onClick={() => setNP('patentes', newPoliza.patentes.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
                      </div>
                    ))}
                    <button onClick={() => setNP('patentes', [...newPoliza.patentes, ''])}
                      className="text-xs text-[#1B3568] font-medium hover:underline">+ Agregar patente</button>
                  </div>
                )}

                {newPoliza.tipo === 'integral_comercio' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Coberturas incluidas</label>
                    {[['cubre_incendio','Incendio'],['cubre_cristales','Cristales'],['cubre_rc','Responsabilidad Civil'],['cubre_aviso_viaje','Aviso de Viaje']].map(([field, label]) => (
                      <label key={field} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={newPoliza[field]}
                          onChange={e => setNP(field, e.target.checked)}
                          className="w-4 h-4 accent-[#1B3568] rounded" />
                        {label}
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button onClick={savePoliza}
                    className="flex-1 py-2 bg-[#1B3568] text-white text-sm font-semibold rounded-xl hover:bg-[#162654] transition">
                    Guardar póliza
                  </button>
                  <button onClick={() => setShowPolizaForm(false)}
                    className="px-4 py-2 text-slate-600 text-sm rounded-xl hover:bg-slate-100 transition">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
