const router = require('express').Router();
const supabase = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /api/polizas/mis-polizas  — para el cliente logueado
router.get('/mis-polizas', authMiddleware, async (req, res) => {
  const { data: polizas, error } = await supabase
    .from('polizas')
    .select('*')
    .eq('usuario_id', req.user.id)
    .order('fecha_fin', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });

  // Obtener patentes para cada póliza de tipo automotores
  const polizasConPatentes = await Promise.all(
    (polizas || []).map(async (p) => {
      if (p.tipo === 'automotores') {
        const { data: patentes } = await supabase
          .from('patentes')
          .select('patente')
          .eq('poliza_id', p.id);
        return { ...p, patentes: (patentes || []).map(pt => pt.patente) };
      }
      return { ...p, patentes: [] };
    })
  );

  res.json(polizasConPatentes);
});

// --- Rutas solo admin ---
router.use(authMiddleware, adminOnly);

// GET /api/polizas/usuario/:usuarioId
router.get('/usuario/:usuarioId', async (req, res) => {
  const { data: polizas, error } = await supabase
    .from('polizas')
    .select('*')
    .eq('usuario_id', req.params.usuarioId)
    .order('fecha_fin', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });

  // Obtener patentes para cada póliza de tipo automotores
  const polizasConPatentes = await Promise.all(
    (polizas || []).map(async (p) => {
      if (p.tipo === 'automotores') {
        const { data: patentes } = await supabase
          .from('patentes')
          .select('patente')
          .eq('poliza_id', p.id);
        return { ...p, patentes: (patentes || []).map(pt => pt.patente) };
      }
      return { ...p, patentes: [] };
    })
  );

  res.json(polizasConPatentes);
});

// POST /api/polizas  — crear póliza
router.post('/', async (req, res) => {
  const {
    usuario_id, numero_poliza, tipo, fecha_inicio, fecha_fin,
    cubre_incendio, cubre_cristales, cubre_rc, cubre_aviso_viaje,
    patentes,
  } = req.body;

  if (!usuario_id || !numero_poliza || !tipo || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }

  try {
    // Insertar póliza
    const { data: polizaData, error: polizaError } = await supabase
      .from('polizas')
      .insert([{
        usuario_id,
        numero_poliza,
        tipo,
        fecha_inicio,
        fecha_fin,
        cubre_incendio: cubre_incendio || false,
        cubre_cristales: cubre_cristales || false,
        cubre_rc: cubre_rc || false,
        cubre_aviso_viaje: cubre_aviso_viaje || false,
      }])
      .select('id');

    if (polizaError) return res.status(400).json({ message: polizaError.message });

    const polizaId = polizaData[0].id;

    // Insertar patentes si es automotores
    if (tipo === 'automotores' && Array.isArray(patentes) && patentes.length) {
      const patentesData = patentes
        .filter(p => p.trim())
        .map(p => ({ poliza_id: polizaId, patente: p.trim().toUpperCase() }));

      if (patentesData.length > 0) {
        const { error: patentesError } = await supabase
          .from('patentes')
          .insert(patentesData);

        if (patentesError) {
          // Si falla insertar patentes, eliminar la póliza creada
          await supabase.from('polizas').delete().eq('id', polizaId);
          return res.status(400).json({ message: patentesError.message });
        }
      }
    }

    res.status(201).json({ id: polizaId, message: 'Póliza creada exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/polizas/:id  — editar póliza
router.put('/:id', async (req, res) => {
  const {
    numero_poliza, fecha_inicio, fecha_fin,
    cubre_incendio, cubre_cristales, cubre_rc, cubre_aviso_viaje,
    patentes,
  } = req.body;

  try {
    // Obtener tipo de póliza
    const { data: polizaData, error: getError } = await supabase
      .from('polizas')
      .select('tipo')
      .eq('id', req.params.id)
      .single();

    if (getError || !polizaData) return res.status(404).json({ message: 'Póliza no encontrada' });

    // Actualizar póliza
    const { error: updateError } = await supabase
      .from('polizas')
      .update({
        numero_poliza,
        fecha_inicio,
        fecha_fin,
        cubre_incendio: cubre_incendio || false,
        cubre_cristales: cubre_cristales || false,
        cubre_rc: cubre_rc || false,
        cubre_aviso_viaje: cubre_aviso_viaje || false,
      })
      .eq('id', req.params.id);

    if (updateError) return res.status(400).json({ message: updateError.message });

    // Actualizar patentes si es automotores
    if (polizaData.tipo === 'automotores' && Array.isArray(patentes)) {
      // Eliminar patentes existentes
      await supabase.from('patentes').delete().eq('poliza_id', req.params.id);

      // Insertar nuevas patentes
      const patentesData = patentes
        .filter(p => p.trim())
        .map(p => ({ poliza_id: req.params.id, patente: p.trim().toUpperCase() }));

      if (patentesData.length > 0) {
        const { error: patentesError } = await supabase
          .from('patentes')
          .insert(patentesData);

        if (patentesError) return res.status(400).json({ message: patentesError.message });
      }
    }

    res.json({ message: 'Póliza actualizada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/polizas/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('polizas')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: 'Póliza eliminada' });
});

module.exports = router;
