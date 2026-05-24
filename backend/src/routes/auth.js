const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
  }

  const { data: users, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('username', username)
    .eq('activo', true)
    .single();

  if (error || !users) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const match = await bcrypt.compare(password, users.password_hash);
  if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

  const token = jwt.sign(
    { id: users.id, username: users.username, rol: users.rol, nombre: users.nombre, apellido: users.apellido },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: users.id, nombre: users.nombre, apellido: users.apellido, rol: users.rol, username: users.username },
  });
});

module.exports = router;
