const router = require('express').Router();
const bcrypt = require('bcrypt');
const supabase = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware, adminOnly);

// GET /api/usuarios  — lista todos los clientes
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, apellido, cuil, direccion, email, username, activo, created_at')
    .eq('rol', 'cliente')
    .order('apellido,nombre');
  
  if (error) return res.status(500).json({ message: error.message });
  res.json(data || []);
});

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, apellido, cuil, direccion, email, username, activo, created_at')
    .eq('id', req.params.id)
    .eq('rol', 'cliente')
    .single();

  if (error || !data) return res.status(404).json({ message: 'Cliente no encontrado' });
  res.json(data);
});

// POST /api/usuarios  — crear cliente
router.post('/', async (req, res) => {
  const { nombre, apellido, cuil, direccion, email, username, password } = req.body;
  if (!nombre || !apellido || !username || !password) {
    return res.status(400).json({ message: 'Nombre, apellido, usuario y contraseña son requeridos' });
  }
  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{
      nombre, apellido, cuil: cuil || null, direccion: direccion || null, 
      email: email || null, username, password_hash: hash, rol: 'cliente'
    }])
    .select('id');

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json({ id: data[0].id, message: 'Cliente creado exitosamente' });
});

// PUT /api/usuarios/:id  — editar cliente
router.put('/:id', async (req, res) => {
  const { nombre, apellido, cuil, direccion, email, username, password, activo } = req.body;
  const updates = {};

  if (nombre !== undefined)    updates.nombre = nombre;
  if (apellido !== undefined)  updates.apellido = apellido;
  if (cuil !== undefined)      updates.cuil = cuil;
  if (direccion !== undefined) updates.direccion = direccion;
  if (email !== undefined)     updates.email = email;
  if (username !== undefined)  updates.username = username;
  if (activo !== undefined)    updates.activo = activo;
  if (password) {
    updates.password_hash = await bcrypt.hash(password, 10);
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: 'Nada que actualizar' });
  }

  const { error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', req.params.id)
    .eq('rol', 'cliente');

  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: 'Cliente actualizado' });
});

// DELETE /api/usuarios/:id  — desactivar (soft delete)
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('usuarios')
    .update({ activo: false })
    .eq('id', req.params.id)
    .eq('rol', 'cliente');

  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: 'Cliente desactivado' });
});

module.exports = router;
