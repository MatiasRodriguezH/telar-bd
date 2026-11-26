import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { createCrud, deleteCrud, listCrud, updateCrud } from '../services/crud.service.js';
import {
  getRecetas,
  getSuministros,
  guardarReceta,
  registrarSuministro,
} from '../services/gestores.service.js';
import { getReporteInventario } from '../services/reportes.service.js';
import { ESTADO_STOCK_CONFIG } from '../utils/formatters.js';
import { Badge, Button, Card, Input, Modal, Select, Table } from '../components/ui/index.jsx';

// Página de manejo de inventario: stock de ingredientes, ingreso de suministros y recetas
export default function InventarioPage() {
  const { notify } = useToast();

  const [tab, setTab] = useState('stock');
  const [inventario, setInventario] = useState([]);
  const [suministros, setSuministros] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal para crear o editar un ingrediente
  const [modalIng, setModalIng] = useState(false);
  const [editIdIng, setEditIdIng] = useState(null);
  const [formIng, setFormIng] = useState({ nombre: '', unidad_base: 'KG', stock_actual: '0' });

  // Formulario de ingreso de suministro (sube el stock por trigger en Oracle)
  const [formSum, setFormSum] = useState({
    rut_proveedor: '',
    id_ingrediente: '',
    id_bodega: '',
    cantidad: '',
  });

  // Formulario de receta (cuánto de cada ingrediente usa un plato)
  const [formRec, setFormRec] = useState({
    id_plato: '',
    id_ingrediente: '',
    cantidad_por_porcion: '',
  });

  // Carga todos los datos de inventario, suministros, recetas y catálogos de apoyo
  async function cargarDatos() {
    setCargando(true);
    try {
      const [repInv, listaSum, listaRec, listaProv, listaBod, listaPlatos] = await Promise.all([
        getReporteInventario(),
        getSuministros(),
        getRecetas(),
        listCrud('proveedores'),
        listCrud('bodegas'),
        listCrud('platos'),
      ]);
      setInventario(repInv);
      setSuministros(listaSum);
      setRecetas(listaRec);
      setProveedores(listaProv);
      setBodegas(listaBod);
      setPlatos(listaPlatos);
    } catch (err) {
      notify('error', err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // Abre el modal vacío para crear un ingrediente nuevo
  function abrirCrearIngrediente() {
    setEditIdIng(null);
    setFormIng({ nombre: '', unidad_base: 'KG', stock_actual: '0' });
    setModalIng(true);
  }

  // Abre el modal precargado para editar un ingrediente existente
  function abrirEditarIngrediente(ing) {
    setEditIdIng(ing.ID_INGREDIENTE);
    setFormIng({
      nombre: ing.INGREDIENTE,
      unidad_base: ing.UNIDAD_BASE,
      stock_actual: String(ing.STOCK_ACTUAL),
    });
    setModalIng(true);
  }

  // Guarda la creación o edición de un ingrediente (BCMRACUF_CRUD_INGREDIENTE)
  async function handleGuardarIngrediente(e) {
    e.preventDefault();
    try {
      if (editIdIng) {
        await updateCrud('ingredientes', editIdIng, formIng);
        notify('success', 'Ingrediente actualizado.');
      } else {
        await createCrud('ingredientes', formIng);
        notify('success', 'Ingrediente creado.');
      }
      setModalIng(false);
      cargarDatos();
    } catch (err) {
      notify('error', err.message);
    }
  }

  // Elimina un ingrediente si no tiene recetas o suministros asociados
  async function handleEliminarIngrediente(id) {
    if (!window.confirm('¿Seguro que deseas eliminar este ingrediente?')) return;
    try {
      await deleteCrud('ingredientes', id);
      notify('success', 'Ingrediente eliminado.');
      cargarDatos();
    } catch (err) {
      notify('error', err.message);
    }
  }

  // Registra un ingreso de mercadería en bodega (BCMRACUF_GESTOR_SUMINISTRO)
  async function handleRegistrarSuministro(e) {
    e.preventDefault();
    if (!formSum.rut_proveedor || !formSum.id_ingrediente || !formSum.id_bodega || !formSum.cantidad) {
      notify('warning', 'Completa todos los campos del suministro.');
      return;
    }

    try {
      const res = await registrarSuministro(formSum);
      notify('success', res.message);
      setFormSum({ rut_proveedor: '', id_ingrediente: '', id_bodega: '', cantidad: '' });
      cargarDatos();
    } catch (err) {
      notify('error', err.message);
    }
  }

  // Guarda o actualiza la cantidad de ingrediente por porción de un plato (BCMRACUF_GESTOR_RECETA)
  async function handleGuardarReceta(e) {
    e.preventDefault();
    if (!formRec.id_plato || !formRec.id_ingrediente || !formRec.cantidad_por_porcion) {
      notify('warning', 'Completa plato, ingrediente y cantidad por porción.');
      return;
    }

    try {
      await guardarReceta(formRec);
      notify('success', 'Receta actualizada correctamente.');
      setFormRec({ id_plato: '', id_ingrediente: '', cantidad_por_porcion: '' });
      cargarDatos();
    } catch (err) {
      notify('error', err.message);
    }
  }

  const columnasInventario = [
    { key: 'INGREDIENTE', label: 'Ingrediente' },
    {
      key: 'STOCK_ACTUAL',
      label: 'Stock Actual',
      align: 'right',
      render: (i) => (
        <strong>
          {i.STOCK_ACTUAL} {i.UNIDAD_BASE}
        </strong>
      ),
    },
    {
      key: 'ESTADO_STOCK',
      label: 'Estado',
      render: (i) => {
        const cfg = ESTADO_STOCK_CONFIG[i.ESTADO_STOCK] || { label: i.ESTADO_STOCK, variant: 'neutral' };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    { key: 'BODEGA_RECEPCION', label: 'Bodega' },
    { key: 'PROVEEDOR_PRINCIPAL', label: 'Proveedor' },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      render: (i) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="secondary" onClick={() => abrirEditarIngrediente(i)}>
            <Pencil size={14} />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleEliminarIngrediente(i.ID_INGREDIENTE)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  const columnasSuministros = [
    { key: 'ID_SUMINISTRO', label: 'ID' },
    { key: 'FECHA_HORA_FMT', label: 'Fecha / Hora' },
    { key: 'PROVEEDOR', label: 'Proveedor' },
    { key: 'INGREDIENTE', label: 'Ingrediente' },
    {
      key: 'CANTIDAD',
      label: 'Cantidad',
      align: 'right',
      render: (s) => `${s.CANTIDAD} ${s.UNIDAD_BASE}`,
    },
    { key: 'BODEGA_DESTINO', label: 'Bodega' },
  ];

  const columnasRecetas = [
    { key: 'NOMBRE_PLATO', label: 'Plato' },
    { key: 'NOMBRE_INGREDIENTE', label: 'Ingrediente' },
    {
      key: 'CANTIDAD_POR_PORCION',
      label: 'Por porción',
      align: 'right',
      render: (r) => `${r.CANTIDAD_POR_PORCION} ${r.UNIDAD_BASE}`,
    },
    {
      key: 'STOCK_ACTUAL',
      label: 'Stock Disp.',
      align: 'right',
      render: (r) => `${r.STOCK_ACTUAL} ${r.UNIDAD_BASE}`,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Manejo de Inventario</h2>
        </div>
        <Button onClick={abrirCrearIngrediente}>
          <Plus size={16} /> Nuevo Ingrediente
        </Button>
      </div>

      {/* Pestañas para separar las 3 vistas de inventario */}
      <div className="tabs-bar">
        <Button variant={tab === 'stock' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('stock')}>
          Stock e Ingredientes
        </Button>
        <Button variant={tab === 'suministros' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('suministros')}>
          Ingreso de Suministros
        </Button>
        <Button variant={tab === 'recetas' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('recetas')}>
          Recetas por Plato
        </Button>
      </div>

      {cargando ? (
        <p>Cargando inventario...</p>
      ) : tab === 'stock' ? (
        <Table
          columns={columnasInventario}
          data={inventario}
          rowKey="ID_INGREDIENTE"
          emptyTitle="No hay ingredientes"
        />
      ) : tab === 'suministros' ? (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <Card padding="lg">
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
              Registrar ingreso de mercadería
            </h3>
            <form onSubmit={handleRegistrarSuministro} style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <div className="form-grid">
                <Select
                  label="Proveedor"
                  placeholder="Selecciona proveedor..."
                  value={formSum.rut_proveedor}
                  onChange={(e) => setFormSum({ ...formSum, rut_proveedor: e.target.value })}
                  options={proveedores.map((p) => ({
                    value: p.RUT_PROVEEDOR,
                    label: p.RAZON_SOCIAL,
                  }))}
                />
                <Select
                  label="Ingrediente"
                  placeholder="Selecciona ingrediente..."
                  value={formSum.id_ingrediente}
                  onChange={(e) => setFormSum({ ...formSum, id_ingrediente: e.target.value })}
                  options={inventario.map((i) => ({
                    value: i.ID_INGREDIENTE,
                    label: `${i.INGREDIENTE} (${i.STOCK_ACTUAL} ${i.UNIDAD_BASE})`,
                  }))}
                />
                <Select
                  label="Bodega de destino"
                  placeholder="Selecciona bodega..."
                  value={formSum.id_bodega}
                  onChange={(e) => setFormSum({ ...formSum, id_bodega: e.target.value })}
                  options={bodegas.map((b) => ({
                    value: b.ID_BODEGA,
                    label: `${b.SECTOR} (cap. ${b.CAPACIDAD} ${b.UNIDAD_CAPACIDAD})`,
                  }))}
                />
                <Input
                  label="Cantidad recibida"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formSum.cantidad}
                  onChange={(e) => setFormSum({ ...formSum, cantidad: e.target.value })}
                />
              </div>
              <div>
                <Button type="submit">Registrar Suministro</Button>
              </div>
            </form>
          </Card>

          <Table
            columns={columnasSuministros}
            data={suministros}
            rowKey="ID_SUMINISTRO"
            emptyTitle="Sin suministros registrados"
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <Card padding="lg">
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
              Asignar o actualizar ingrediente en una receta
            </h3>
            <form onSubmit={handleGuardarReceta} style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <div className="form-grid">
                <Select
                  label="Plato"
                  placeholder="Selecciona plato..."
                  value={formRec.id_plato}
                  onChange={(e) => setFormRec({ ...formRec, id_plato: e.target.value })}
                  options={platos.map((p) => ({
                    value: p.ID_PLATO,
                    label: p.NOMBRE_PLATO,
                  }))}
                />
                <Select
                  label="Ingrediente"
                  placeholder="Selecciona ingrediente..."
                  value={formRec.id_ingrediente}
                  onChange={(e) => setFormRec({ ...formRec, id_ingrediente: e.target.value })}
                  options={inventario.map((i) => ({
                    value: i.ID_INGREDIENTE,
                    label: `${i.INGREDIENTE} (${i.UNIDAD_BASE})`,
                  }))}
                />
                <Input
                  label="Cantidad por porción"
                  type="number"
                  step="0.05"
                  min="0.01"
                  placeholder="Ej: 0.35"
                  value={formRec.cantidad_por_porcion}
                  onChange={(e) => setFormRec({ ...formRec, cantidad_por_porcion: e.target.value })}
                />
              </div>
              <div>
                <Button type="submit">Guardar en Receta</Button>
              </div>
            </form>
          </Card>

          <Table columns={columnasRecetas} data={recetas} emptyTitle="Sin recetas registradas" />
        </div>
      )}

      {/* Modal para crear/editar ingrediente */}
      <Modal
        isOpen={modalIng}
        onClose={() => setModalIng(false)}
        title={editIdIng ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
      >
        <form onSubmit={handleGuardarIngrediente} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <Input
            label="Nombre del ingrediente"
            required
            value={formIng.nombre}
            onChange={(e) => setFormIng({ ...formIng, nombre: e.target.value })}
          />
          <Select
            label="Unidad base"
            value={formIng.unidad_base}
            onChange={(e) => setFormIng({ ...formIng, unidad_base: e.target.value })}
            options={[
              { value: 'KG', label: 'Kilogramos (KG)' },
              { value: 'LITROS', label: 'Litros (LITROS)' },
              { value: 'UNID', label: 'Unidades (UNID)' },
            ]}
          />
          <Input
            label="Stock actual"
            type="number"
            step="0.1"
            min="0"
            value={formIng.stock_actual}
            onChange={(e) => setFormIng({ ...formIng, stock_actual: e.target.value })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="ghost" onClick={() => setModalIng(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
