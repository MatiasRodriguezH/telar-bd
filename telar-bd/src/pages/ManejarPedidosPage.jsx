import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { puedeBorrar } from '../utils/permissions.js';
import { listCrud } from '../services/crud.service.js';
import {
  agregarDetallePedido,
  eliminarPedido,
  getDetallePedido,
  getPedidos,
} from '../services/gestores.service.js';
import { getReporteVentasPlato } from '../services/reportes.service.js';
import { formatCLP } from '../utils/formatters.js';
import { Badge, Button, Card, Input, Modal, Select, Table } from '../components/ui/index.jsx';

// Página para ver todos los pedidos, inspeccionar/agregar platos y ver ranking de ventas
export default function ManejarPedidosPage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const permiteBorrar = puedeBorrar(user?.CARGO, 'pedidos');

  const [tab, setTab] = useState('pedidos');
  const [pedidos, setPedidos] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [ventasPlato, setVentasPlato] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estado del modal de detalle de un pedido seleccionado
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [nuevoPlatoId, setNuevoPlatoId] = useState('');
  const [nuevaCantidad, setNuevaCantidad] = useState('1');

  // Carga los pedidos, el menú de platos y el reporte de ventas por plato
  async function cargarDatos() {
    setCargando(true);
    try {
      const [listaPedidos, listaPlatos, repVentas] = await Promise.all([
        getPedidos(),
        listCrud('platos'),
        getReporteVentasPlato(),
      ]);
      setPedidos(listaPedidos);
      setPlatos(listaPlatos);
      setVentasPlato(repVentas);
    } catch (err) {
      notify('error', err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // Abre el modal y consulta en Oracle los platos que tiene ese pedido
  async function handleVerDetalle(pedido) {
    setPedidoActivo(pedido);
    setDetalles([]);
    try {
      const filas = await getDetallePedido(pedido.ID_PEDIDO);
      setDetalles(filas);
    } catch (err) {
      notify('error', err.message);
    }
  }

  // Agrega un plato adicional al pedido abierto en el modal validando disponibilidad
  async function handleAgregarPlatoExistente(e) {
    e.preventDefault();
    const plato = platos.find((p) => Number(p.ID_PLATO) === Number(nuevoPlatoId));
    const cantidad = Number(nuevaCantidad);

    if (!plato) {
      notify('warning', 'Elige un plato para agregar.');
      return;
    }

    const disponibles = Number(plato.PLATOS_DISPONIBLES ?? 0);
    if (disponibles <= 0) {
      notify('error', `"${plato.NOMBRE_PLATO}" está agotado (0 disponibles).`);
      return;
    }
    if (cantidad > disponibles) {
      notify('warning', `Solo quedan ${disponibles} porciones disponibles de "${plato.NOMBRE_PLATO}".`);
      return;
    }

    try {
      await agregarDetallePedido(pedidoActivo.ID_PEDIDO, {
        id_plato: Number(nuevoPlatoId),
        cantidad,
      });
      notify('success', 'Plato agregado al pedido.');
      setNuevoPlatoId('');
      setNuevaCantidad('1');
      // Refrescamos tanto el detalle del modal como la tabla principal
      const filas = await getDetallePedido(pedidoActivo.ID_PEDIDO);
      setDetalles(filas);
      cargarDatos();
    } catch (err) {
      notify('error', err.message);
    }
  }

  // Elimina un pedido completo después de confirmar
  async function handleEliminar(idPedido) {
    if (!window.confirm(`¿Eliminar el pedido #${idPedido}?`)) return;
    try {
      await eliminarPedido(idPedido);
      notify('success', 'Pedido eliminado.');
      cargarDatos();
    } catch (err) {
      notify('error', err.message);
    }
  }

  const columnasPedidos = [
    { key: 'ID_PEDIDO', label: 'ID' },
    {
      key: 'NUM_MESA',
      label: 'Mesa',
      render: (p) => <Badge variant="primary">Mesa #{p.NUM_MESA}</Badge>,
    },
    { key: 'GARZON', label: 'Garzón' },
    { key: 'FECHA_HORA_FMT', label: 'Fecha / Hora' },
    {
      key: 'PROPINA',
      label: 'Propina',
      align: 'right',
      render: (p) => formatCLP(p.PROPINA),
    },
    {
      key: 'TOTAL_CON_PROPINA',
      label: 'Total',
      align: 'right',
      render: (p) => <strong>{formatCLP(p.TOTAL_CON_PROPINA)}</strong>,
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={() => handleVerDetalle(p)}>
            <Eye size={14} /> Detalle
          </Button>
          {permiteBorrar && (
            <Button size="sm" variant="danger" onClick={() => handleEliminar(p.ID_PEDIDO)}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const columnasDetalle = [
    { key: 'NOMBRE_PLATO', label: 'Plato' },
    { key: 'CANTIDAD', label: 'Cant.', align: 'center' },
    {
      key: 'PRECIO_UNITARIO',
      label: 'P. Unitario',
      align: 'right',
      render: (d) => formatCLP(d.PRECIO_UNITARIO),
    },
    {
      key: 'SUBTOTAL',
      label: 'Subtotal',
      align: 'right',
      render: (d) => formatCLP(d.SUBTOTAL),
    },
  ];

  const columnasRanking = [
    { key: 'CATEGORIA', label: 'Categoría' },
    { key: 'PLATO', label: 'Plato' },
    { key: 'UNIDADES_VENDIDAS', label: 'Vendidos', align: 'center' },
    {
      key: 'RECAUDACION_TOTAL',
      label: 'Recaudación',
      align: 'right',
      render: (r) => <strong>{formatCLP(r.RECAUDACION_TOTAL)}</strong>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Manejar Pedidos</h2>
        </div>
        <Button onClick={() => navigate('/pedidos/crear')}>
          <Plus size={16} /> Nuevo Pedido
        </Button>
      </div>

      {/* Pestañas simples */}
      <div className="tabs-bar">
        <Button variant={tab === 'pedidos' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('pedidos')}>
          Listado de Pedidos
        </Button>
        <Button variant={tab === 'ranking' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('ranking')}>
          Ranking de Ventas por Plato
        </Button>
      </div>

      {cargando ? (
        <p>Cargando pedidos...</p>
      ) : tab === 'pedidos' ? (
        <Table
          columns={columnasPedidos}
          data={pedidos}
          rowKey="ID_PEDIDO"
          emptyTitle="No hay pedidos registrados"
          emptyDescription="Genera un pedido nuevo para verlo aquí."
        />
      ) : (
        <Table
          columns={columnasRanking}
          data={ventasPlato}
          rowKey="ID_PLATO"
          emptyTitle="Sin datos de ventas"
        />
      )}

      {/* Modal para ver los platos de un pedido y agregar más si el cliente pide algo extra */}
      <Modal
        isOpen={Boolean(pedidoActivo)}
        onClose={() => setPedidoActivo(null)}
        title={pedidoActivo ? `Detalle Pedido #${pedidoActivo.ID_PEDIDO} — Mesa #${pedidoActivo.NUM_MESA}` : ''}
        size="lg"
      >
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <Table
            columns={columnasDetalle}
            data={detalles}
            rowKey="ID_PLATO"
            emptyTitle="Este pedido aún no tiene platos"
          />

          <Card padding="md">
            <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
              Agregar otro plato a este pedido
            </h4>
            <form
              onSubmit={handleAgregarPlatoExistente}
              style={{ display: 'grid', gridTemplateColumns: '2fr 100px auto', gap: 'var(--space-2)', alignItems: 'end' }}
            >
              <Select
                label="Plato"
                placeholder="Selecciona plato..."
                value={nuevoPlatoId}
                onChange={(e) => setNuevoPlatoId(e.target.value)}
                options={platos.map((p) => ({
                  value: p.ID_PLATO,
                  label: `${p.NOMBRE_PLATO} (${formatCLP(p.PRECIO_VIGENTE)} · ${p.PLATOS_DISPONIBLES ?? 0} disp.)`,
                }))}
              />
              <Input
                label="Cant."
                type="number"
                min="1"
                value={nuevaCantidad}
                onChange={(e) => setNuevaCantidad(e.target.value)}
              />
              <Button type="submit" size="md">
                Agregar
              </Button>
            </form>
          </Card>
        </div>
      </Modal>
    </div>
  );
}
