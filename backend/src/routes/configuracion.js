const router = require('express').Router();
const supabase = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware, adminOnly);

// GET /api/configuracion/emails
router.get('/emails', async (req, res) => {
  const { data, error } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('clave', 'empleados_emails')
    .single();

  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ message: 'Error al obtener configuración' });
  }

  let asesores = [];
  if (data?.valor) {
    try {
      asesores = JSON.parse(data.valor);
    } catch {
      // compatibilidad: formato antiguo CSV
      asesores = data.valor.split(',')
        .map(e => e.trim()).filter(Boolean)
        .map(email => ({ nombre: '', apellido: '', email }));
    }
  }

  res.json({ asesores });
});

// PUT /api/configuracion/emails
router.put('/emails', async (req, res) => {
  const { asesores } = req.body;
  if (!Array.isArray(asesores)) {
    return res.status(400).json({ message: 'asesores debe ser un array' });
  }

  const valor = JSON.stringify(
    asesores.map(a => ({
      nombre: (a.nombre || '').trim(),
      apellido: (a.apellido || '').trim(),
      email: (a.email || '').trim().toLowerCase(),
    })).filter(a => a.email)
  );

  const { error } = await supabase
    .from('configuracion')
    .upsert({ clave: 'empleados_emails', valor });

  if (error) {
    return res.status(500).json({ message: 'Error al guardar configuración' });
  }

  res.json({ message: 'Configuración guardada' });
});

module.exports = router;
