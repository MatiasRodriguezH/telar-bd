import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { puedeBorrar } from '../utils/permissions.js';
import { listCrud } from '../services/crud.service.js';
import { eliminarReserva, getReservas } from '../services/gestores.service.js';
import { Badge, Button, Card, Input, Table } from '../components/ui/index.jsx';

// Página para ver, buscar y cancelar reservas existentes, además de ver acompañantes
export default function ManejarReservasPage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const permiteBorrar = puedeBorrar(user?.CARGO, 'reservas');

  const [reservas, setReservas] = useState([]);
  const [acompanantes, setAcompanantes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // Carga las reservas y la lista de acompañantes desde Oracle
  async function cargarDatos() {
    setCargando(true);
    try {
      const [listaReservas, listaAcomp] = await Promise.all([
        getReservas(),
        listCrud('acompanantes'),
      ]);
      setReservas(listaReservas);
      setAcompanantes(listaAcomp);
    } catch (err) {
      notify('error', err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // Elimina una reserva previa confirmación simple del navegador
  async function handleEliminar(idReserva) {
    if (!window.confirm(`¿Seguro que deseas eliminar la reserva #${idReserva}?`)) return;
    try {
      await eliminarReserva(idReserva);
      notify('success', 'Reserva eliminada.');
      cargarDatos();
    } catch (err) {
      notify('error', err.message);
    }
  }

  // Filtra las reservas en memoria según lo que escriba el usuario en el buscador
  const reservasFiltradas = reservas.filter((r) => {
    const texto = `${r.CLIENTE} ${r.RUT_CLIENTE} ${r.UBICACION_MESA} mesa ${r.NUM_MESA}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const columnasReservas = [
    { key: 'ID_RESERVA', label: 'ID' },
    { key: 'CLIENTE', label: 'Cliente' },
    { key: 'RUT_CLIENTE', label: 'RUT' },
    {
      key: 'NUM_MESA',
      label: 'Mesa',
      render: (r) => <Badge variant="primary">Mesa #{r.NUM_MESA} ({r.UBICACION_MESA})</Badge>,
    },
    { key: 'INICIO_FMT', label: 'Inicio' },
    { key: 'FIN_FMT', label: 'Fin' },
    { key: 'COMENSALES', label: 'Comensales', align: 'center' },
    // Solo mostramos la columna de eliminar si el cargo tiene permiso para borrar
    ...(permiteBorrar
      ? [
          {
            key: 'acciones',
            label: 'Acción',
            align: 'right',
            render: (r) => (
              <Button size="sm" variant="danger" onClick={() => handleEliminar(r.ID_RESERVA)}>
                <Trash2 size={14} /> Cancelar
              </Button>
            ),
          },
        ]
      : []),
  ];

  const columnasAcompanantes = [
    { key: 'RUT_CLIENTE', label: 'RUT Titular' },
    { key: 'CLIENTE_TITULAR', label: 'Cliente Titular' },
    { key: 'NRO_ACOMPANANTE', label: 'N°', align: 'center' },
    { key: 'NOMBRE_ACOMPANANTE', label: 'Nombre Acompañante' },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>Manejar Reservas</h2>
      </div>

      {/* Buscador simple */}
      <Card padding="md">
        <Input
          label="Buscar reserva"
          placeholder="Buscar por nombre de cliente, RUT, mesa o ubicación..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </Card>

      {cargando ? (
        <p>Cargando reservas...</p>
      ) : (
        <Table
          columns={columnasReservas}
          data={reservasFiltradas}
          rowKey="ID_RESERVA"
          emptyTitle="No hay reservas"
          emptyDescription="Crea una reserva nueva para verla en esta tabla."
        />
      )}

      {/* Tabla de acompañantes */}
      <section>
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>
          Acompañantes registrados
        </h3>
        <Table
          columns={columnasAcompanantes}
          data={acompanantes}
          emptyTitle="Sin acompañantes"
          emptyDescription="Los acompañantes ingresados en clientes o reservas aparecerán aquí."
        />
      </section>
    </div>
  );
}
