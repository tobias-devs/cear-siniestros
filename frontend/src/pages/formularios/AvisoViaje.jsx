import api from '../../api';
import { FormBase, FInput, Divider } from './FormBase';

export default function FormAvisoViaje() {
  const submit = (fd) => api.post('/formularios/aviso-viaje', fd);

  return (
    <FormBase titulo="Aviso de Viaje Escolar" subtitulo="Notificación de salida educativa" colorClass="text-emerald-700"
      onSubmit={submit}>
      <Divider label="Institución" />
      <FInput label="Institución educativa" name="institucion" placeholder="Nombre del colegio / institución" required />

      <Divider label="Datos del viaje" />
      <div className="grid grid-cols-2 gap-4">
        <FInput label="Fecha de salida" name="fecha_salida" type="date" required />
        <FInput label="Fecha de regreso" name="fecha_regreso" type="date" required />
      </div>
      <FInput label="Destino" name="destino" placeholder="Ciudad / lugar de destino" required />
      <div className="grid grid-cols-2 gap-4">
        <FInput label="Cantidad de alumnos" name="cantidad_alumnos" type="number" min="1" required />
        <FInput label="Cantidad de docentes" name="cantidad_docentes" type="number" min="1" required />
      </div>

      <Divider label="Transporte (opcional)" />
      <FInput label="Empresa de transporte" name="empresa_transporte" placeholder="Nombre de la empresa" />
      <div className="grid grid-cols-2 gap-4">
        <FInput label="Nombre del conductor" name="conductor_nombre" />
        <FInput label="N° de licencia" name="conductor_licencia" />
      </div>
    </FormBase>
  );
}
