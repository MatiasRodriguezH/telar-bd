import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { listCrud } from '../services/crud.service.js';
import { agregarDetallePedido, crearPedido } from '../services/gestores.service.js';
import { formatCLP } from '../utils/formatters.js';
import { Button, Card, Input, Select, Table } from '../components/ui/index.jsx';

// Página dedicada a abrir un nuevo pedido y agregarle los platos solicitados
export default function GenerarPedidoPage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  // Catálogos cargados desde Oracle
  const [mesas, setMesas] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [garzones, setGarzones] = useState([]);

  // Datos de la cabecera del pedido
  const [numMesa, setNumMesa] = useState('');
  const [rutEmpleado, setRutEmpleado] = useState(user?.RUT_EMPLEADO || '');
  const [propina, setPropina] = useState('0');

  // Selector temporal para añadir platos a la comanda antes de confirmar
  const [idPlatoSel, setIdPlatoSel] = useState('');
  const [cantidadSel, setCantidadSel] = useState('1');
  const [items, setItems] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Carga mesas, platos y empleados habilitados (GARZON o ADMINISTRADOR)
  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const [listaMesas, listaPlatos, listaEmpleados] = await Promise.all([
          listCrud('mesas'),
          listCrud('platos'),
          listCrud('empleados'),
        ]);
        setMesas(listaMesas);
        setPlatos(listaPlatos);

        // Según BCMRACUF_GESTOR_PEDIDO, GARZON, ENCARGADO o ADMINISTRADOR pueden abrir pedidos
        const habilitados = listaEmpleados.filter((e) =>
          ['GARZON', 'ADMINISTRADOR', 'ENCARGADO'].includes(e.CARGO)
        );
        setGarzones(habilitados);
      } catch (err) {
        notify('error', err.message);
      }
    }
    cargarCatalogos();
  }, []);

  // Agrega un plato a la lista temporal del pedido (si ya existe, suma su cantidad)
  function handleAgregarPlato() {
    const plato = platos.find((p) => Number(p.ID_PLATO) === Number(idPlatoSel));
    const cantidad = Number(cantidadSel);

    if (!plato) {
      notify('warning', 'Selecciona un plato de la carta.');
      return;
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      notify('warning', 'La cantidad debe ser un número entero mayor a 0.');
      return;
    }

    const existe = items.find((i) => i.id_plato === plato.ID_PLATO);
    if (existe) {
      setItems(
        items.map((i) =>
          i.id_plato === plato.ID_PLATO ? { ...i, cantidad: i.cantidad + cantidad } : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          id_plato: plato.ID_PLATO,
          nombre: plato.NOMBRE_PLATO,
          precio_unitario: plato.PRECIO_VIGENTE,
          cantidad,
        },
      ]);
    }

    setCantidadSel('1');
  }

  // Quita un plato de la lista temporal antes de guardar
  function handleQuitarPlato(idPlato) {
    setItems(items.filter((i) => i.id_plato !== idPlato));
  }

  // Suma los subtotales de los platos agregados y suma la propina
  const subtotal = items.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0);
  const propinaSugerida = Math.round(subtotal * 0.1);
  const totalFinal = subtotal + Number(propina || 0);

  // Crea primero la cabecera del pedido y luego inserta cada plato en DETALLE_PEDIDO
  async function handleConfirmarPedido(e) {
    e.preventDefault();

    if (!numMesa || !rutEmpleado) {
      notify('warning', 'Selecciona la mesa y el empleado responsable.');
      return;
    }
    if (items.length === 0) {
      notify('warning', 'Agrega al menos un plato al pedido.');
      return;
    }

    setGuardando(true);
    try {
      // Paso 1: Crear cabecera en BCMRACUF_PEDIDO
      const cabecera = await crearPedido({
        num_mesa: Number(numMesa),
        rut_empleado: rutEmpleado,
        propina: Number(propina || 0),
      });

      // Paso 2: Insertar cada plato en BCMRACUF_DETALLE_PEDIDO (Oracle descuenta stock por trigger)
      for (const item of items) {
        await agregarDetallePedido(cabecera.id_pedido, {
          id_plato: item.id_plato,
          cantidad: item.cantidad,
        });
      }

      notify('success', `Pedido #${cabecera.id_pedido} generado correctamente.`);
      navigate('/pedidos');
    } catch (err) {
      notify('error', err.message);
    } finally {
      setGuardando(false);
    }
  }

  const columnasItems = [
    { key: 'nombre', label: 'Plato' },
    { key: 'cantidad', label: 'Cantidad', align: 'center' },
    {
      key: 'precio_unitario',
      label: 'Precio Unitario',
      align: 'right',
      render: (i) => formatCLP(i.precio_unitario),
    },
    {
      key: 'subtotal',
      label: 'Subtotal',
      align: 'right',
      render: (i) => formatCLP(i.cantidad * i.precio_unitario),
    },
    {
      key: 'quitar',
      label: '',
      align: 'right',
      render: (i) => (
        <Button size="sm" variant="ghost" onClick={() => handleQuitarPlato(i.id_plato)}>
          <Trash2 size={14} />
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h2>Generar Pedido</h2>
        </div>
      </div>

      {/* Paso 1: Datos generales de la mesa y garzón */}
      <Card padding="lg">
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          1. Datos del pedido
        </h3>
        <div className="form-grid">
          <Select
            label="Mesa"
            placeholder="Selecciona mesa..."
            value={numMesa}
            onChange={(e) => setNumMesa(e.target.value)}
            options={mesas.map((m) => ({
              value: m.NUM_MESA,
              label: `Mesa #${m.NUM_MESA} — ${m.UBICACION}`,
            }))}
          />

          <Select
            label="Garzón / Responsable"
            placeholder="Selecciona empleado..."
            value={rutEmpleado}
            onChange={(e) => setRutEmpleado(e.target.value)}
            options={garzones.map((g) => ({
              value: g.RUT_EMPLEADO,
              label: `${g.NOMBRES} ${g.APELLIDO_PATERNO} (${g.CARGO})`,
            }))}
          />

          <div>
            <Input
              label="Propina (CLP)"
              type="number"
              min="0"
              value={propina}
              onChange={(e) => setPropina(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setPropina(String(propinaSugerida))}
              style={{
                marginTop: '4px',
                fontSize: 'var(--text-xs)',
                color: 'var(--primary)',
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              Aplicar 10% sugerido ({formatCLP(propinaSugerida)})
            </button>
          </div>
        </div>
      </Card>

      {/* Paso 2: Selección de platos */}
      <Card padding="lg">
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          2. Agregar platos de la carta
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 120px auto',
            gap: 'var(--space-3)',
            alignItems: 'end',
            marginBottom: 'var(--space-4)',
          }}
        >
          <Select
            label="Plato"
            placeholder="Elige un plato..."
            value={idPlatoSel}
            onChange={(e) => setIdPlatoSel(e.target.value)}
            options={platos.map((p) => ({
              value: p.ID_PLATO,
              label: `[${p.NOMBRE_CATEGORIA}] ${p.NOMBRE_PLATO} — ${formatCLP(p.PRECIO_VIGENTE)} (${p.PLATOS_DISPONIBLES ?? 0} disp.)`,
            }))}
          />

          <Input
            label="Cantidad"
            type="number"
            min="1"
            value={cantidadSel}
            onChange={(e) => setCantidadSel(e.target.value)}
          />

          <Button onClick={handleAgregarPlato}>
            <Plus size={16} /> Agregar
          </Button>
        </div>

        <Table
          columns={columnasItems}
          data={items}
          rowKey="id_plato"
          emptyTitle="Aún no agregas platos"
          emptyDescription="Selecciona platos arriba para armar el pedido."
        />

        {/* Resumen final y botón de confirmación */}
        <div
          style={{
            marginTop: 'var(--space-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Subtotal: <strong>{formatCLP(subtotal)}</strong> · Propina:{' '}
            <strong>{formatCLP(propina)}</strong> · Total:{' '}
            <strong style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
              {formatCLP(totalFinal)}
            </strong>
          </div>

          <Button onClick={handleConfirmarPedido} loading={guardando}>
            Confirmar Pedido
          </Button>
        </div>
      </Card>
    </div>
  );
}
