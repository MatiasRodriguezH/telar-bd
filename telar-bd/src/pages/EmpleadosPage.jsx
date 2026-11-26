import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { createCrud, deleteCrud, listCrud, updateCrud } from '../services/crud.service.js';
import { asignarTurno, getAsignacionesTurno } from '../services/gestores.service.js';
import { getReporteGarzones } from '../services/reportes.service.js';
import { CARGO_CONFIG, formatCLP, formatMinutosAHora } from '../utils/formatters.js';
import { Badge, Button, Card, Input, Modal, Select, Table } from '../components/ui/index.jsx';

const CARGOS_OPCIONES = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'GARZON', label: 'Garzón' },
  { value: 'BODEGUERO', label: 'Bodeguero' },
  { value: 'COCINERO', label: 'Cocinero' },
];

const FORM_INICIAL = {
  rut_empleado: '',
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  cargo: 'GARZON',
  sueldo: '',
  telefono: '',
  contrasena: '',
};

// Página de manejo de empleados: CRUD de personal, asignación de turnos y desempeño
export default function EmpleadosPage() {
  const { notify } = useToast();

  const [tab, setTab] = useState('personal');
  const [empleados, setEmpleados] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [desempeno, setDesempeno] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal crear / editar empleado
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editRut, setEditRut] = useState(null);
  const [formEmp, setFormEmp] = useState(FORM_INICIAL);

  // Formulario para asignar un turno en una fecha específica
  const [formTurno, setFormTurno] = useState({
    rut_empleado: '',
    id_turno: '',
    fecha: new Date().toISOString().slice(0, 10),
  });

  // Carga empleados, turnos disponibles, asignaciones y reporte de desempeño
  async function cargarDatos() {
    setCargando(true);
    try {
      const [listaEmp, listaTurnos, listaAsig, repGarzones] = await Promise.all([
        listCrud('empleados'),
        listCrud('turnos'),
        getAsignacionesTurno(),
        getReporteGarzones(),
      ]);
      setEmpleados(listaEmp);
      setTurnos(listaTurnos);
      setAsignaciones(listaAsig);
      setDesempeno(repGarzones);
    } catch (err) {
      notify('error', err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // Abre el modal vacío para registrar un nuevo empleado
  function abrirCrear() {
    setEditRut(null);
    setFormEmp(FORM_INICIAL);
    setModalAbierto(true);
  }

  // Abre el modal con los datos del empleado seleccionado (la contraseña queda opcional)
  function abrirEditar(emp) {
    setEditRut(emp.RUT_EMPLEADO);
    setFormEmp({
      rut_empleado: emp.RUT_EMPLEADO,
      nombres: emp.NOMBRES,
      apellido_paterno: emp.APELLIDO_PATERNO,
      apellido_materno: emp.APELLIDO_MATERNO || '',
      cargo: emp.CARGO,
      sueldo: String(emp.SUELDO),
      telefono: emp.TELEFONO || '',
      contrasena: '',
    });
    setModalAbierto(true);
  }

  // Crea o actualiza un empleado llamando a BCMRACUF_CRUD_EMPLEADO
  async function handleGuardarEmpleado(e) {
    e.preventDefault();
    try {
      if (editRut) {
        await updateCrud('empleados', editRut, formEmp);
        notify('success', 'Empleado actualizado.');
      } else {
        await createCrud('empleados', formEmp);
        notify('success', 'Empleado creado correctamente.');
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      notify('error', err.message);
    }
  }

  // Elimina un empleado si no tiene pedidos o turnos asignados
  async function handleEliminarEmpleado(rut) {
    if (!window.confirm(`¿Eliminar al empleado ${rut}?`)) return;
    try {
      await deleteCrud('empleados', rut);
      notify('success', 'Empleado eliminado.');
      cargarDatos();
    } catch (err) {
      notify('error', err.message);
    }
  }

  // Asigna un turno a un empleado en una fecha (Oracle valida que no haya cruce de horario)
  async function handleAsignarTurno(e) {
    e.preventDefault();
    if (!formTurno.rut_empleado || !formTurno.id_turno || !formTurno.fecha) {
      notify('warning', 'Completa empleado, turno y fecha.');
      return;
    }

    try {
      await asignarTurno(formTurno);
      notify('success', 'Turno asignado correctamente.');
      cargarDatos();
    } catch (err) {
      notify('error', err.message);
    }
  }

  const columnasEmpleados = [
    { key: 'RUT_EMPLEADO', label: 'RUT' },
    {
      key: 'NOMBRES',
      label: 'Nombre',
      render: (e) => `${e.NOMBRES} ${e.APELLIDO_PATERNO} ${e.APELLIDO_MATERNO || ''}`,
    },
    {
      key: 'CARGO',
      label: 'Cargo',
      render: (e) => {
        const cfg = CARGO_CONFIG[e.CARGO] || { label: e.CARGO, variant: 'neutral' };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'SUELDO',
      label: 'Sueldo',
      align: 'right',
      render: (e) => formatCLP(e.SUELDO),
    },
    { key: 'TELEFONO', label: 'Teléfono' },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      render: (e) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={() => abrirEditar(e)}>
            <Pencil size={14} />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleEliminarEmpleado(e.RUT_EMPLEADO)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  const columnasTurnos = [
    { key: 'FECHA_FMT', label: 'Fecha' },
    { key: 'EMPLEADO', label: 'Empleado' },
    {
      key: 'CARGO',
      label: 'Cargo',
      render: (a) => <Badge variant={CARGO_CONFIG[a.CARGO]?.variant || 'neutral'}>{a.CARGO}</Badge>,
    },
    {
      key: 'horario',
      label: 'Horario',
      render: (a) => `${formatMinutosAHora(a.INICIO_MIN)} — ${formatMinutosAHora(a.FIN_MIN)}`,
    },
  ];

  const columnasDesempeno = [
    { key: 'EMPLEADO', label: 'Empleado' },
    { key: 'CARGO', label: 'Cargo' },
    { key: 'TURNOS_ASIGNADOS', label: 'Turnos', align: 'center' },
    { key: 'PEDIDOS_ATENDIDOS', label: 'Pedidos', align: 'center' },
    {
      key: 'MONTO_VENTAS',
      label: 'Ventas',
      align: 'right',
      render: (d) => formatCLP(d.MONTO_VENTAS),
    },
    {
      key: 'PROPINAS_ACUMULADAS',
      label: 'Propinas',
      align: 'right',
      render: (d) => <strong>{formatCLP(d.PROPINAS_ACUMULADAS)}</strong>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Manejo de Empleados</h2>
        </div>
        <Button onClick={abrirCrear}>
          <Plus size={16} /> Nuevo Empleado
        </Button>
      </div>

      {/* Pestañas de sección */}
      <div className="tabs-bar">
        <Button variant={tab === 'personal' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('personal')}>
          Personal
        </Button>
        <Button variant={tab === 'turnos' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('turnos')}>
          Asignación de Turnos
        </Button>
        <Button variant={tab === 'desempeno' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('desempeno')}>
          Desempeño Garzones
        </Button>
      </div>

      {cargando ? (
        <p>Cargando empleados...</p>
      ) : tab === 'personal' ? (
        <Table
          columns={columnasEmpleados}
          data={empleados}
          rowKey="RUT_EMPLEADO"
          emptyTitle="No hay empleados registrados"
        />
      ) : tab === 'turnos' ? (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <Card padding="lg">
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
              Asignar turno a un empleado
            </h3>
            <form onSubmit={handleAsignarTurno} style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <div className="form-grid">
                <Select
                  label="Empleado"
                  placeholder="Selecciona empleado..."
                  value={formTurno.rut_empleado}
                  onChange={(e) => setFormTurno({ ...formTurno, rut_empleado: e.target.value })}
                  options={empleados.map((e) => ({
                    value: e.RUT_EMPLEADO,
                    label: `${e.NOMBRES} ${e.APELLIDO_PATERNO} (${e.CARGO})`,
                  }))}
                />
                <Select
                  label="Turno"
                  placeholder="Selecciona horario..."
                  value={formTurno.id_turno}
                  onChange={(e) => setFormTurno({ ...formTurno, id_turno: e.target.value })}
                  options={turnos.map((t) => ({
                    value: t.ID_TURNO,
                    label: `Turno #${t.ID_TURNO}: ${formatMinutosAHora(t.INICIO_MIN)} a ${formatMinutosAHora(t.FIN_MIN)}`,
                  }))}
                />
                <Input
                  label="Fecha"
                  type="date"
                  value={formTurno.fecha}
                  onChange={(e) => setFormTurno({ ...formTurno, fecha: e.target.value })}
                />
              </div>
              <div>
                <Button type="submit">Asignar Turno</Button>
              </div>
            </form>
          </Card>

          <Table columns={columnasTurnos} data={asignaciones} emptyTitle="Sin turnos asignados" />
        </div>
      ) : (
        <Table
          columns={columnasDesempeno}
          data={desempeno}
          rowKey="RUT_EMPLEADO"
          emptyTitle="Sin datos de desempeño"
        />
      )}

      {/* Modal para crear o editar un empleado */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={editRut ? `Editar Empleado (${editRut})` : 'Nuevo Empleado'}
      >
        <form onSubmit={handleGuardarEmpleado} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <Input
            label="RUT"
            placeholder="Ej: 20.123.456-7"
            required
            disabled={Boolean(editRut)}
            value={formEmp.rut_empleado}
            onChange={(e) => setFormEmp({ ...formEmp, rut_empleado: e.target.value })}
          />
          <div className="form-grid">
            <Input
              label="Nombres"
              required
              value={formEmp.nombres}
              onChange={(e) => setFormEmp({ ...formEmp, nombres: e.target.value })}
            />
            <Input
              label="Apellido paterno"
              required
              value={formEmp.apellido_paterno}
              onChange={(e) => setFormEmp({ ...formEmp, apellido_paterno: e.target.value })}
            />
            <Input
              label="Apellido materno"
              value={formEmp.apellido_materno}
              onChange={(e) => setFormEmp({ ...formEmp, apellido_materno: e.target.value })}
            />
            <Select
              label="Cargo"
              value={formEmp.cargo}
              onChange={(e) => setFormEmp({ ...formEmp, cargo: e.target.value })}
              options={CARGOS_OPCIONES}
            />
            <Input
              label="Sueldo (CLP)"
              type="number"
              required
              value={formEmp.sueldo}
              onChange={(e) => setFormEmp({ ...formEmp, sueldo: e.target.value })}
            />
            <Input
              label="Teléfono"
              value={formEmp.telefono}
              onChange={(e) => setFormEmp({ ...formEmp, telefono: e.target.value })}
            />
            <Input
              label={editRut ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              type="password"
              required={!editRut}
              value={formEmp.contrasena}
              onChange={(e) => setFormEmp({ ...formEmp, contrasena: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
