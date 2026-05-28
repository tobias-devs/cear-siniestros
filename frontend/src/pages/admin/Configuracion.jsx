import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Save, ChevronLeft, Mail } from 'lucide-react';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import api from '../../api';

const emailVacio = () => ({ nombre: '', apellido: '', email: '' });

export default function Configuracion() {
  const [asesores, setAsesores] = useState([]);
  const [nuevo, setNuevo] = useState(emailVacio());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get('/configuracion/emails');
      setAsesores(data.asesores || []);
    } catch {
      showToast('Error al cargar la configuración', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const agregarAsesor = () => {
    const email = nuevo.email.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('El email no tiene un formato válido', 'error');
      return;
    }
    if (asesores.some(a => a.email === email)) {
      showToast('Ese email ya está en la lista', 'error');
      return;
    }
    setAsesores(prev => [...prev, { nombre: nuevo.nombre.trim(), apellido: nuevo.apellido.trim(), email }]);
    setNuevo(emailVacio());
  };

  const eliminar = (email) => setAsesores(prev => prev.filter(a => a.email !== email));

  const guardar = async () => {
    if (asesores.length === 0) {
      showToast('Debe haber al menos un asesor destinatario', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.put('/configuracion/emails', { asesores });
      showToast('Configuración guardada correctamente');
    } catch {
      showToast('Error al guardar la configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); agregarAsesor(); } };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#1B3568] transition-colors">
          <ChevronLeft size={15} />
          Volver al panel
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B3568]">Emails de asesores</h1>
        <p className="text-slate-500 text-sm mt-1">Configurá quiénes reciben las denuncias de siniestros</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

          <div className="flex items-center gap-2 mb-5">
            <Mail size={18} className="text-[#1B3568]" />
            <h2 className="font-semibold text-slate-800">Asesores destinatarios</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* Lista */}
              {asesores.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">
                  No hay asesores configurados. Agregá al menos uno.
                </p>
              ) : (
                <ul className="space-y-2 mb-5">
                  {asesores.map((a) => (
                    <li key={a.email}
                      className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        {(a.nombre || a.apellido) && (
                          <p className="text-sm font-medium text-slate-700">
                            {[a.nombre, a.apellido].filter(Boolean).join(' ')}
                          </p>
                        )}
                        <p className="text-sm text-slate-500">{a.email}</p>
                      </div>
                      <button
                        onClick={() => eliminar(a.email)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Formulario agregar */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agregar asesor</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={nuevo.nombre}
                    onChange={e => setNuevo(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Nombre (opcional)"
                    className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-[#1B3568]/20 focus:border-[#1B3568] transition-all"
                  />
                  <input
                    type="text"
                    value={nuevo.apellido}
                    onChange={e => setNuevo(p => ({ ...p, apellido: e.target.value }))}
                    placeholder="Apellido (opcional)"
                    className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-[#1B3568]/20 focus:border-[#1B3568] transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={nuevo.email}
                    onChange={e => setNuevo(p => ({ ...p, email: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    placeholder="email@ejemplo.com *"
                    className="flex-1 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-[#1B3568]/20 focus:border-[#1B3568] transition-all"
                  />
                  <button
                    onClick={agregarAsesor}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200
                               text-slate-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    <Plus size={15} />
                    Agregar
                  </button>
                </div>
              </div>

              {/* Guardar */}
              <button
                onClick={guardar}
                disabled={saving}
                className="mt-5 flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white
                           rounded-xl transition-colors disabled:opacity-50 bg-[#1B3568] hover:bg-[#162654]"
              >
                <Save size={15} />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
