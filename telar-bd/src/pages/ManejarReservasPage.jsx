import { useEffect, useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp, Trash2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { puedeBorrar } from '../utils/permissions.js';
import { listCrud } from '../services/crud.service.js';
import { eliminarReserva, getReservas } from '../services/gestores.service.js';
import { formatRut } from '../utils/formatters.js';
import { Badge, Button, Card, Input, Table } from '../components/ui/index.jsx';

// Convierte "DD/MM/YYYY HH:MM" a milisegundos para poder ordenar reservas por fecha
function fechaTextoAMs(texto = '') {
  const [fecha, hora = '00:00'] = String(texto).split(' ');
  const [dd, mm, yyyy] = fecha.split('/').map(Number);
  const [hh, min] = hora.split(':').map(Number);
  return new Date(yyyy || 0, (mm || 1) - 1, dd || 1, hh || 0, min || 0).getTime();
}

// Página para ver, buscar y cancelar reservas existentes (con acompañantes desplegables por fila)
export default function ManejarReservasPage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const permiteBorrar = puedeBorrar(user?.CARGO, 'reservas');

  const [reservas, setReservas] = useState([]);
  const [acompanantes, setAcompanantes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ordenAsc, setOrdenAsc] = useState(true); // true = más próximas primero
  const [reservaAbierta, setReservaAbierta] = useState(null); // ID de la reserva con acompañantes desplegados
  const [cargando, setCargando] = useState(true);

  // Carga las reservas y los acompañantes desde Oracle
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

  // Muestra u oculta la lista de acompañantes al hacer clic en una reserva
  function toggleAcompanantes(idReserva) {
    setReservaAbierta((actual) => (actual === idReserva ? null : idReserva));
  }

  // Filtra las reservas según el buscador y las ordena cronológicamente por fecha de inicio
  const reservasFiltradas = reservas
    .filter((r) => {
      const texto = `${r.CLIENTE} ${r.RUT_CLIENTE} ${r.UBICACION_MESA} mesa ${r.NUM_MESA}`.toLowerCase();
      return texto.includes(busqueda.toLowerCase());
    })
    .sort((a, b) => {
      const diff = fechaTextoAMs(a.INICIO_FMT) - fechaTextoAMs(b.INICIO_FMT);
      return ordenAsc ? diff : -diff;
    });

  const columnasReservas = [
    { key: 'ID_RESERVA', label: 'ID' },
    { key: 'CLIENTE', label: 'Cliente' },
    { key: 'RUT_CLIENTE', label: 'RUT', render: (r) => formatRut(r.RUT_CLIENTE) },
    {
      key: 'NUM_MESA',
      label: 'Mesa',
      render: (r) => <Badge variant="primary">Mesa #{r.NUM_MESA} ({r.UBICACION_MESA})</Badge>,
    },
    { key: 'INICIO_FMT', label: 'Inicio' },
    { key: 'FIN_FMT', label: 'Fin' },
    { key: 'COMENSALES', label: 'Comensales', align: 'center' },
    {
      key: 'acompanantes',
      label: 'Acompañantes',
      render: (r) => {
        const lista = acompanantes.filter((a) => a.RUT_CLIENTE === r.RUT_CLIENTE);
        const abierto = reservaAbierta === r.ID_RESERVA;

        return (
          <div>
            <Button size="sm" variant="secondary" onClick={() => toggleAcompanantes(r.ID_RESERVA)}>
              <Users size={14} />
              <span>{lista.length}</span>
              {abierto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>

            {abierto && (
              <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                {lista.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '2px' }}>
                    {lista.map((a) => (
                      <li key={`${a.RUT_CLIENTE}-${a.NRO_ACOMPANANTE}`}>
                        • {a.NOMBRE_ACOMPANANTE}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Sin acompañantes registrados</span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
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

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2>Manejar Reservas</h2>
        <Button size="sm" variant="secondary" onClick={() => setOrdenAsc((v) => !v)}>
          <ArrowUpDown size={15} />
          {ordenAsc ? 'Orden: Más próximas primero' : 'Orden: Más lejanas primero'}
        </Button>
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
    </div>
  );
}
