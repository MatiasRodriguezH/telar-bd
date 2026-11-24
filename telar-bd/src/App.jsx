import { useState } from 'react';
import { Scissors, ShoppingBag, Ruler } from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Input,
  Select,
  EmptyState,
  Table,
  Modal,
  Drawer,
} from './components/ui';
import { useToast } from './context/ToastContext.jsx';

const ENCARGOS_DEMO = [
  { id: 1, cliente: 'Camila Rojas', prenda: 'Vestido de noche', tela: 'Seda natural', estado: 'En confección', total: '$145.000' },
  { id: 2, cliente: 'Tomás Fuentes', prenda: 'Traje 2 piezas', tela: 'Lana merino', estado: 'Listo para entrega', total: '$280.000' },
  { id: 3, cliente: 'Valentina Soto', prenda: 'Blusa entallada', tela: 'Lino belga', estado: 'Sin stock de tela', total: '$68.000' },
];

const ESTADO_VARIANT = {
  'En confección': 'warning',
  'Listo para entrega': 'success',
  'Sin stock de tela': 'danger',
};

const TELAS_OPTIONS = [
  { value: 'lino', label: 'Lino Belga — $18.000 / metro' },
  { value: 'seda', label: 'Seda Natural — $32.000 / metro' },
  { value: 'algodon', label: 'Algodón Pima — $14.000 / metro' },
  { value: 'lana', label: 'Lana Merino — $29.000 / metro' },
];

export default function App() {
  const { notify } = useToast();

  // Estados para probar formulario, tabla, modal y drawer
  const [tela, setTela] = useState('lino');
  const [cintura, setCintura] = useState('72');
  const [mostrarTablaVacia, setMostrarTablaVacia] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const errorCintura =
    cintura !== '' && Number(cintura) < 40
      ? 'La medida debe ser al menos 40 cm'
      : '';

  const columns = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'prenda', label: 'Prenda' },
    { key: 'tela', label: 'Tela' },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        <Badge variant={ESTADO_VARIANT[row.estado] || 'neutral'}>
          {row.estado}
        </Badge>
      ),
    },
    { key: 'total', label: 'Total', align: 'right' },
  ];

  return (
    <main className="container" style={{ paddingBlock: 'var(--space-8)', display: 'grid', gap: 'var(--space-6)' }}>
      {/* Encabezado */}
      <header>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>
          Telar — Laboratorio UI Kit (Fase 1)
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Prueba interactiva de todos los componentes base del sistema de diseño.
        </p>
      </header>

      {/* 1. Botones y Badges */}
      <Card padding="lg">
        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          1. Botones y Badges
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <Button variant="primary">Encargar prenda</Button>
          <Button variant="secondary">Ver telas</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="danger">Eliminar</Button>
          <Button size="sm">Pequeño</Button>
          <Button size="lg">Grande</Button>
          <Button loading>Guardando</Button>
          <Button disabled>Deshabilitado</Button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Badge variant="neutral">100% Lino</Badge>
          <Badge variant="primary">A medida</Badge>
          <Badge variant="success">Listo para entrega</Badge>
          <Badge variant="warning">En confección</Badge>
          <Badge variant="danger">Tela agotada</Badge>
          <Badge variant="info">Prueba agendada</Badge>
        </div>
      </Card>

      {/* 2. Formularios (Input y Select) */}
      <Card padding="lg">
        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          2. Inputs y Selects
        </h2>

        <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <Select
            label="Tipo de tela"
            placeholder="Selecciona una tela..."
            options={TELAS_OPTIONS}
            value={tela}
            onChange={(e) => setTela(e.target.value)}
            helperText="El precio varía según los metros requeridos."
          />

          <Input
            label="Medida de cintura (cm)"
            type="number"
            value={cintura}
            onChange={(e) => setCintura(e.target.value)}
            error={errorCintura}
            helperText="Prueba escribir un número menor a 40 para ver el estado de error."
          />

          <Input
            label="Notas de confección"
            placeholder="Ej: Cuello en V, pinzas en espalda..."
          />
        </div>
      </Card>

      {/* 3. Modal, Drawer y Toasts */}
      <Card padding="lg">
        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          3. Modal, Drawer y Notificaciones Toast
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <Button onClick={() => setModalOpen(true)}>
            <Ruler size={16} /> Abrir Modal de Medidas
          </Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            <ShoppingBag size={16} /> Abrir Drawer de Encargo
          </Button>
          <Button variant="ghost" onClick={() => notify('success', 'Medidas guardadas correctamente.')}>
            Toast Éxito
          </Button>
          <Button variant="ghost" onClick={() => notify('error', 'No hay suficientes metros de seda natural.')}>
            Toast Error
          </Button>
          <Button variant="ghost" onClick={() => notify('warning', 'Falta confirmar fecha de prueba.')}>
            Toast Aviso
          </Button>
          <Button variant="ghost" onClick={() => notify('info', 'Nueva tela agregada al catálogo.')}>
            Toast Info
          </Button>
        </div>
      </Card>

      {/* 4. Table */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)' }}>4. Tabla de Encargos</h2>
          <Button size="sm" variant="secondary" onClick={() => setMostrarTablaVacia((v) => !v)}>
            {mostrarTablaVacia ? 'Mostrar datos' : 'Probar tabla vacía'}
          </Button>
        </div>

        <Table
          columns={columns}
          data={mostrarTablaVacia ? [] : ENCARGOS_DEMO}
          emptyTitle="No hay encargos registrados"
          emptyDescription="Cuando un cliente solicite una prenda a medida, aparecerá aquí."
        />
      </section>

      {/* 5. EmptyState aislado */}
      <Card padding="none">
        <EmptyState
          icon={<Scissors size={22} />}
          title="Tu taller aún no tiene telas favoritas"
          description="Explora el catálogo de linos, sedas y algodones para guardar tus preferencias."
          action={
            <Button size="sm" onClick={() => notify('info', 'Navegaría al catálogo de telas.')}>
              Explorar telas
            </Button>
          }
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registrar medidas del cliente"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setModalOpen(false);
                notify('success', 'Ficha de medidas guardada.');
              }}
            >
              Guardar medidas
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <Input label="Busto / Pecho (cm)" type="number" placeholder="Ej: 92" />
          <Input label="Cintura (cm)" type="number" placeholder="Ej: 72" />
          <Input label="Cadera (cm)" type="number" placeholder="Ej: 98" />
          <Input label="Largo total (cm)" type="number" placeholder="Ej: 105" />
        </div>
      </Modal>

      {/* Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Tu bolsa de encargos (1)"
        footer={
          <Button
            style={{ width: '100%' }}
            onClick={() => {
              setDrawerOpen(false);
              notify('success', 'Avanzando a confirmación de encargo.');
            }}
          >
            Confirmar encargo — $145.000
          </Button>
        }
      >
        <Card padding="md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <strong>Vestido de noche</strong>
            <Badge variant="primary">A medida</Badge>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Tela: Seda natural · 2.5 metros · Cintura 72 cm
          </p>
        </Card>
      </Drawer>
    </main>
  );
}