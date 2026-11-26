import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { createCrud, listCrud } from '../services/crud.service.js';
import { crearReserva } from '../services/gestores.service.js';
import { Button, Card, Input, Modal, Select } from '../components/ui/index.jsx';

// Página dedicada a registrar una nueva reserva de mesa (BCMRACUF_GESTOR_RESERVA)
export default function CrearReservaPage() {
  const { notify } = useToast();
  const navigate = useNavigate();

  // Listas necesarias para llenar los selects del formulario
  const [clientes, setClientes] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Campos del formulario de reserva
  const [rutCliente, setRutCliente] = useState('');
  const [numMesa, setNumMesa] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [comensales, setComensales] = useState('2');
  const [nombreAcompanante, setNombreAcompanante] = useState('');

  // Estado del modal para crear un cliente nuevo si no está registrado
  const [modalCliente, setModalCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    rut_cliente: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo: '',
    telefono: '',
  });

  // Carga clientes y mesas desde Oracle al entrar a la página
  async function cargarDatos() {
    try {
      const [listaClientes, listaMesas] = await Promise.all([
        listCrud('clientes'),
        listCrud('mesas'),
      ]);
      setClientes(listaClientes);
      setMesas(listaMesas);
    } catch (err) {
      notify('error', err.message);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // Envía la reserva a Oracle; los triggers validan horario libre y capacidad de la mesa
  async function handleCrearReserva(e) {
    e.preventDefault();

    if (!rutCliente || !numMesa || !inicio || !fin) {
      notify('warning', 'Completa cliente, mesa, inicio y fin.');
      return;
    }

    setGuardando(true);
    try {
      const res = await crearReserva({
        rut_cliente: rutCliente,
        num_mesa: Number(numMesa),
        inicio,
        fin,
        comensales: Number(comensales),
        nombre_acompanante: nombreAcompanante.trim() || null,
      });
      notify('success', `Reserva #${res.id_reserva} creada correctamente.`);
      navigate('/reservas');
    } catch (err) {
      notify('error', err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Guarda un cliente nuevo usando BCMRACUF_CRUD_CLIENTE y lo deja seleccionado automáticamente
  async function handleGuardarCliente(e) {
    e.preventDefault();
    try {
      await createCrud('clientes', nuevoCliente);
      notify('success', 'Cliente registrado.');
      setModalCliente(false);
      await cargarDatos();
      setRutCliente(nuevoCliente.rut_cliente.trim().toUpperCase());
      setNuevoCliente({
        rut_cliente: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        correo: '',
        telefono: '',
      });
    } catch (err) {
      notify('error', err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Crear Reserva</h2>
          <p>Registra una reserva de mesa y un acompañante opcional.</p>
        </div>
        <Button variant="secondary" onClick={() => setModalCliente(true)}>
          <UserPlus size={16} /> Nuevo Cliente
        </Button>
      </div>

      <Card padding="lg">
        <form onSubmit={handleCrearReserva} style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div className="form-grid">
            <Select
              label="Cliente titular"
              placeholder="Selecciona un cliente..."
              value={rutCliente}
              onChange={(e) => setRutCliente(e.target.value)}
              options={clientes.map((c) => ({
                value: c.RUT_CLIENTE,
                label: `${c.NOMBRES} ${c.APELLIDO_PATERNO} (${c.RUT_CLIENTE})`,
              }))}
            />

            <Select
              label="Mesa"
              placeholder="Selecciona una mesa..."
              value={numMesa}
              onChange={(e) => setNumMesa(e.target.value)}
              options={mesas.map((m) => ({
                value: m.NUM_MESA,
                label: `Mesa #${m.NUM_MESA} — ${m.UBICACION} (máx. ${m.CAPACIDAD} pers.)`,
              }))}
            />

            <Input
              label="Fecha y hora de inicio"
              type="datetime-local"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />

            <Input
              label="Fecha y hora de término"
              type="datetime-local"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
            />

            <Input
              label="Cantidad de comensales"
              type="number"
              min="1"
              value={comensales}
              onChange={(e) => setComensales(e.target.value)}
            />

            <Input
              label="Nombre de acompañante (opcional)"
              placeholder="Ej: Patricia Soto"
              value={nombreAcompanante}
              onChange={(e) => setNombreAcompanante(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => navigate('/reservas')}>
              Cancelar
            </Button>
            <Button type="submit" loading={guardando}>
              Guardar Reserva
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal simple para registrar un cliente nuevo sin salir de esta pantalla */}
      <Modal
        isOpen={modalCliente}
        onClose={() => setModalCliente(false)}
        title="Registrar nuevo cliente"
      >
        <form onSubmit={handleGuardarCliente} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <Input
            label="RUT"
            placeholder="Ej: 18.456.789-2"
            required
            value={nuevoCliente.rut_cliente}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, rut_cliente: e.target.value })}
          />
          <Input
            label="Nombres"
            required
            value={nuevoCliente.nombres}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombres: e.target.value })}
          />
          <Input
            label="Apellido paterno"
            required
            value={nuevoCliente.apellido_paterno}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, apellido_paterno: e.target.value })}
          />
          <Input
            label="Apellido materno"
            value={nuevoCliente.apellido_materno}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, apellido_materno: e.target.value })}
          />
          <Input
            label="Correo"
            type="email"
            value={nuevoCliente.correo}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, correo: e.target.value })}
          />
          <Input
            label="Teléfono"
            required
            placeholder="+56912345678"
            value={nuevoCliente.telefono}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" onClick={() => setModalCliente(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cliente</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
