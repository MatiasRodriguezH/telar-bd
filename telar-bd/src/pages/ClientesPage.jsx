import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { createCrud, deleteCrud, listCrud, updateCrud } from '../services/crud.service.js';
import { formatRut } from '../utils/formatters.js';
import { validarRut } from '../utils/validators.js';
import { puedeBorrar } from '../utils/permissions.js';
import { Button, Card, Input, Modal, Table } from '../components/ui/index.jsx';

const FORM_INICIAL = {
  rut_cliente: '',
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo: '',
  telefono: '',
};

// Página de manejo de clientes (solo accesible para ADMINISTRADOR y ENCARGADO)
export default function ClientesPage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const permiteBorrar = puedeBorrar(user?.CARGO, 'clientes');

  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // Estado del modal para crear o editar un cliente
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editRut, setEditRut] = useState(null);
  const [formCli, setFormCli] = useState(FORM_INICIAL);

  // Carga todos los clientes desde Oracle (BCMRACUF_SEL_CLIENTE)
  async function cargarClientes() {
    setCargando(true);
    try {
      const lista = await listCrud('clientes');
      setClientes(lista);
    } catch (err) {
      notify('error', err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  // Abre el modal limpio para registrar un cliente nuevo
  function abrirCrear() {
    setEditRut(null);
    setFormCli(FORM_INICIAL);
    setModalAbierto(true);
  }

  // Abre el modal precargado con los datos del cliente seleccionado
  function abrirEditar(cli) {
    setEditRut(cli.RUT_CLIENTE);
    setFormCli({
      rut_cliente: formatRut(cli.RUT_CLIENTE),
      nombres: cli.NOMBRES,
      apellido_paterno: cli.APELLIDO_PATERNO,
      apellido_materno: cli.APELLIDO_MATERNO || '',
      correo: cli.CORREO || '',
      telefono: cli.TELEFONO || '',
    });
    setModalAbierto(true);
  }

  // Guarda la creación o edición de un cliente en Oracle (BCMRACUF_CRUD_CLIENTE)
  async function handleGuardar(e) {
    e.preventDefault();
    const rutFormateado = formatRut(formCli.rut_cliente);

    if (!editRut && !validarRut(rutFormateado)) {
      notify('warning', 'Ingresa un RUT válido (ej: 18.456.789-2).');
      return;
    }

    try {
      if (editRut) {
        await updateCrud('clientes', editRut, formCli);
        notify('success', 'Cliente actualizado correctamente.');
      } else {
        await createCrud('clientes', { ...formCli, rut_cliente: rutFormateado });
        notify('success', 'Cliente registrado correctamente.');
      }
      setModalAbierto(false);
      cargarClientes();
    } catch (err) {
      notify('error', err.message);
    }
  }

  // Elimina un cliente (solo disponible para ADMINISTRADOR; Oracle bloquea si tiene reservas)
  async function handleEliminar(rut) {
    if (!window.confirm(`¿Seguro que deseas eliminar al cliente ${formatRut(rut)}?`)) return;
    try {
      await deleteCrud('clientes', rut);
      notify('success', 'Cliente eliminado.');
      cargarClientes();
    } catch (err) {
      notify('error', err.message);
    }
  }

  // Filtra los clientes en pantalla por RUT (con o sin puntos), nombre o correo
  const queryLimpia = busqueda.toLowerCase().replace(/\./g, '').trim();
  const clientesFiltrados = clientes.filter((c) => {
    const texto = `${c.RUT_CLIENTE} ${c.NOMBRES} ${c.APELLIDO_PATERNO} ${c.APELLIDO_MATERNO || ''} ${c.CORREO || ''}`
      .toLowerCase()
      .replace(/\./g, '');
    return texto.includes(queryLimpia);
  });

  const columnas = [
    { key: 'RUT_CLIENTE', label: 'RUT', render: (c) => formatRut(c.RUT_CLIENTE) },
    {
      key: 'NOMBRES',
      label: 'Nombre',
      render: (c) => `${c.NOMBRES} ${c.APELLIDO_PATERNO} ${c.APELLIDO_MATERNO || ''}`,
    },
    { key: 'CORREO', label: 'Correo', render: (c) => c.CORREO || '—' },
    { key: 'TELEFONO', label: 'Teléfono' },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      render: (c) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={() => abrirEditar(c)}>
            <Pencil size={14} />
          </Button>
          {permiteBorrar && (
            <Button size="sm" variant="danger" onClick={() => handleEliminar(c.RUT_CLIENTE)}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h2>Manejo de Clientes</h2>
          <p>Consulta, registra y actualiza los datos de los clientes del restaurante.</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus size={16} /> Nuevo Cliente
        </Button>
      </div>

      {/* Buscador simple por RUT, nombre o correo */}
      <Card padding="md">
        <Input
          label="Buscar cliente"
          placeholder="Escribe el RUT, nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </Card>

      {cargando ? (
        <p>Cargando clientes...</p>
      ) : (
        <Table
          columns={columnas}
          data={clientesFiltrados}
          rowKey="RUT_CLIENTE"
          emptyTitle="No se encontraron clientes"
          emptyDescription="Prueba otra búsqueda o registra un cliente nuevo."
        />
      )}

      {/* Modal para crear o editar cliente */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={editRut ? `Editar Cliente (${formatRut(editRut)})` : 'Nuevo Cliente'}
      >
        <form onSubmit={handleGuardar} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <Input
            label="RUT"
            placeholder="Ej: 18.456.789-2"
            helperText={!editRut ? 'Se formatea automáticamente al salir del campo.' : undefined}
            required
            disabled={Boolean(editRut)}
            value={formCli.rut_cliente}
            onChange={(e) => setFormCli({ ...formCli, rut_cliente: e.target.value })}
            onBlur={() =>
              setFormCli((prev) => ({
                ...prev,
                rut_cliente: formatRut(prev.rut_cliente),
              }))
            }
          />
          <div className="form-grid">
            <Input
              label="Nombres"
              required
              value={formCli.nombres}
              onChange={(e) => setFormCli({ ...formCli, nombres: e.target.value })}
            />
            <Input
              label="Apellido paterno"
              required
              value={formCli.apellido_paterno}
              onChange={(e) => setFormCli({ ...formCli, apellido_paterno: e.target.value })}
            />
            <Input
              label="Apellido materno"
              value={formCli.apellido_materno}
              onChange={(e) => setFormCli({ ...formCli, apellido_materno: e.target.value })}
            />
            <Input
              label="Teléfono"
              required
              placeholder="+56912345678"
              value={formCli.telefono}
              onChange={(e) => setFormCli({ ...formCli, telefono: e.target.value })}
            />
          </div>
          <Input
            label="Correo electrónico"
            type="email"
            value={formCli.correo}
            onChange={(e) => setFormCli({ ...formCli, correo: e.target.value })}
          />

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
