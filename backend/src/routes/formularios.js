const router = require('express').Router();
const multer = require('multer');
const nodemailer = require('nodemailer');
const supabase = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware);

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });
}

function buildHtml(titulo, cliente, numeroPoliza, campos) {
  const filas = Object.entries(campos)
    .filter(([k]) => k !== '_archivos')
    .map(([k, v]) => `<tr><td style="padding:8px 12px;font-weight:600;background:#f0f4ff;border:1px solid #d0d9f0">${k}</td><td style="padding:8px 12px;border:1px solid #d0d9f0">${v || '—'}</td></tr>`)
    .join('');

  return `
  <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto">
    <div style="background:#1B3568;padding:24px 32px;border-radius:8px 8px 0 0">
      <h2 style="color:#fff;margin:0;font-size:22px">CEAR · Cobertura Educativa</h2>
      <p style="color:#a8c4ff;margin:4px 0 0;font-size:14px">Nueva ${titulo}</p>
    </div>
    <div style="border:1px solid #d0d9f0;border-top:none;padding:24px 32px;border-radius:0 0 8px 8px">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tr><td style="padding:8px 12px;font-weight:600;background:#e8edff;border:1px solid #d0d9f0">Cliente</td>
            <td style="padding:8px 12px;border:1px solid #d0d9f0">${cliente}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;background:#e8edff;border:1px solid #d0d9f0">N° de Póliza</td>
            <td style="padding:8px 12px;border:1px solid #d0d9f0">${numeroPoliza}</td></tr>
        ${filas}
      </table>
      <p style="color:#888;font-size:12px;margin-top:24px">Este mensaje fue generado automáticamente por el sistema CEAR.</p>
    </div>
  </div>`;
}

async function getPolizaVigente(usuarioId, tipo) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: polizas, error } = await supabase
    .from('polizas')
    .select('*')
    .eq('usuario_id', usuarioId)
    .eq('tipo', tipo)
    .lte('fecha_inicio', today)
    .gte('fecha_fin', today)
    .order('fecha_fin', { ascending: false })
    .limit(1);

  if (error) return null;
  return polizas && polizas.length > 0 ? polizas[0] : null;
}

async function enviarMail(titulo, htmlContent, archivos = []) {
  const transporter = getTransporter();
  const destinos = (process.env.EMPLEADOS_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

  const attachments = archivos.map((f, i) => ({
    filename: f.originalname || `adjunto_${i + 1}`,
    content: f.buffer,
    contentType: f.mimetype,
  }));

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: destinos.join(','),
    subject: `[CEAR] Nueva ${titulo}`,
    html: htmlContent,
    attachments,
  });
}

// POST /api/formularios/automotores
router.post('/automotores', upload.array('archivos', 5), async (req, res) => {
  const { patente, fecha_siniestro, descripcion, conductor_nombre, conductor_dni,
    conductor_licencia, hubo_terceros, tercero_nombre, tercero_patente, tercero_aseguradora } = req.body;

  const poliza = await getPolizaVigente(req.user.id, 'automotores');
  if (!poliza) return res.status(403).json({ message: 'No tenés una póliza de automotores vigente' });

  const cliente = `${req.user.nombre} ${req.user.apellido}`;
  const campos = {
    'Patente del vehículo': patente,
    'Fecha del siniestro': fecha_siniestro,
    'Descripción': descripcion,
    'Conductor (Nombre)': conductor_nombre,
    'Conductor (DNI)': conductor_dni,
    'Conductor (N° Licencia)': conductor_licencia,
    '¿Hubo terceros?': hubo_terceros === 'true' ? 'Sí' : 'No',
    'Tercero (Nombre)': tercero_nombre,
    'Tercero (Patente)': tercero_patente,
    'Tercero (Aseguradora)': tercero_aseguradora,
  };

  const html = buildHtml('Denuncia de Siniestro · Automotores', cliente, poliza.numero_poliza, campos);
  await enviarMail('Denuncia de Siniestro · Automotores', html, req.files || []);
  res.json({ message: 'Denuncia enviada exitosamente' });
});

// POST /api/formularios/incendio
router.post('/incendio', upload.array('archivos', 5), async (req, res) => {
  const { fecha_siniestro, direccion, descripcion, hubo_victimas, bienes_afectados, intervino_bomberos } = req.body;

  const poliza = await getPolizaVigente(req.user.id, 'integral_comercio');
  if (!poliza || !poliza.cubre_incendio) return res.status(403).json({ message: 'Tu póliza no cubre incendio' });

  const cliente = `${req.user.nombre} ${req.user.apellido}`;
  const campos = {
    'Fecha del siniestro': fecha_siniestro,
    'Dirección del hecho': direccion,
    'Descripción': descripcion,
    '¿Hubo víctimas?': hubo_victimas === 'true' ? 'Sí' : 'No',
    'Bienes afectados': bienes_afectados,
    '¿Intervino bomberos?': intervino_bomberos === 'true' ? 'Sí' : 'No',
  };

  const html = buildHtml('Denuncia de Siniestro · Incendio', cliente, poliza.numero_poliza, campos);
  await enviarMail('Denuncia de Siniestro · Incendio', html, req.files || []);
  res.json({ message: 'Denuncia enviada exitosamente' });
});

// POST /api/formularios/cristales
router.post('/cristales', upload.array('archivos', 5), async (req, res) => {
  const { fecha_siniestro, descripcion, tipo_cristal, dimensiones, causa_identificada } = req.body;

  const poliza = await getPolizaVigente(req.user.id, 'integral_comercio');
  if (!poliza || !poliza.cubre_cristales) return res.status(403).json({ message: 'Tu póliza no cubre cristales' });

  const cliente = `${req.user.nombre} ${req.user.apellido}`;
  const campos = {
    'Fecha del siniestro': fecha_siniestro,
    'Descripción': descripcion,
    'Tipo de cristal': tipo_cristal,
    'Dimensiones aproximadas': dimensiones,
    'Causa identificada': causa_identificada,
  };

  const html = buildHtml('Denuncia de Siniestro · Cristales', cliente, poliza.numero_poliza, campos);
  await enviarMail('Denuncia de Siniestro · Cristales', html, req.files || []);
  res.json({ message: 'Denuncia enviada exitosamente' });
});

// POST /api/formularios/rc
router.post('/rc', upload.array('archivos', 5), async (req, res) => {
  const { fecha_siniestro, descripcion, tercero_nombre, tercero_dni, tercero_direccion,
    monto_reclamado, actuacion_judicial } = req.body;

  const poliza = await getPolizaVigente(req.user.id, 'integral_comercio');
  if (!poliza || !poliza.cubre_rc) return res.status(403).json({ message: 'Tu póliza no cubre Responsabilidad Civil' });

  const cliente = `${req.user.nombre} ${req.user.apellido}`;
  const campos = {
    'Fecha del siniestro': fecha_siniestro,
    'Descripción': descripcion,
    'Tercero reclamante (Nombre)': tercero_nombre,
    'Tercero reclamante (DNI)': tercero_dni,
    'Tercero reclamante (Dirección)': tercero_direccion,
    'Monto reclamado': monto_reclamado,
    '¿Actuación judicial?': actuacion_judicial === 'true' ? 'Sí' : 'No',
  };

  const html = buildHtml('Denuncia de Responsabilidad Civil', cliente, poliza.numero_poliza, campos);
  await enviarMail('Denuncia de Responsabilidad Civil', html, req.files || []);
  res.json({ message: 'Denuncia enviada exitosamente' });
});

// POST /api/formularios/aviso-viaje
router.post('/aviso-viaje', upload.array('archivos', 5), async (req, res) => {
  const { institucion, fecha_salida, fecha_regreso, destino,
    cantidad_alumnos, cantidad_docentes, empresa_transporte,
    conductor_nombre, conductor_licencia } = req.body;

  const poliza = await getPolizaVigente(req.user.id, 'integral_comercio');
  if (!poliza || !poliza.cubre_aviso_viaje) return res.status(403).json({ message: 'Tu póliza no cubre Aviso de Viaje' });

  const cliente = `${req.user.nombre} ${req.user.apellido}`;
  const campos = {
    'Institución educativa': institucion,
    'Fecha de salida': fecha_salida,
    'Fecha de regreso': fecha_regreso,
    'Destino': destino,
    'Cantidad de alumnos': cantidad_alumnos,
    'Cantidad de docentes': cantidad_docentes,
    'Empresa de transporte': empresa_transporte,
    'Conductor (Nombre)': conductor_nombre,
    'Conductor (N° Licencia)': conductor_licencia,
  };

  const html = buildHtml('Aviso de Viaje Escolar', cliente, poliza.numero_poliza, campos);
  await enviarMail('Aviso de Viaje Escolar', html, req.files || []);
  res.json({ message: 'Aviso de viaje enviado exitosamente' });
});

module.exports = router;
