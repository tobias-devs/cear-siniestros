require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',           require('./routes/auth'));
app.use('/api/usuarios',       require('./routes/usuarios'));
app.use('/api/polizas',        require('./routes/polizas'));
app.use('/api/formularios',    require('./routes/formularios'));
app.use('/api/configuracion',  require('./routes/configuracion'));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Error interno del servidor' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`CEAR backend corriendo en http://localhost:${PORT}`));
}

module.exports = app;
