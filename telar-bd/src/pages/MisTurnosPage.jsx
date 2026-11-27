import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getAsignacionesTurno } from '../services/gestores.service.js';
import { formatMinutosAHora } from '../utils/formatters.js';
import { Badge, Card, Table } from '../components/ui/index.jsx';

// Página para que el garzón comsulte sus turnos
export default function MisTurnosPage() {
  const { user } = useAuth();
  const { notify } = useToast();

  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Carga los turnos del garzón
  useEffect(() => {
    async function cargarMisTurnos() {
      setCargando(true);
      try {
        const lista = await getAsignacionesTurno();
        setTurnos(lista);
      } catch (err) {
        notify('error', err.message);
      } finally {
        setCargando(false);
      }
    }

    cargarMisTurnos();
  }, [notify]);

  const columnas = [
    { key: 'FECHA_FMT', label: 'Fecha' },
    {
      key: 'ID_TURNO',
      label: 'Turno',
      render: (t) => <Badge variant="info">Turno #{t.ID_TURNO}</Badge>,
    },
    {
      key: 'horario',
      label: 'Horario',
      render: (t) => `${formatMinutosAHora(t.INICIO_MIN)} — ${formatMinutosAHora(t.FIN_MIN)}`,
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h2>Mis Turnos</h2>
          <p>
            Turnos asignados para {user?.NOMBRES} {user?.APELLIDO_PATERNO} ({user?.RUT_EMPLEADO}).
          </p>
        </div>
      </div>

      <Card padding="md">
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Vista de solo lectura: para cambiar o asignar un turno, contacta a un Administrador o Encargado.
        </p>
      </Card>

      {cargando ? (
        <p>Cargando tus turnos...</p>
      ) : (
        <Table
          columns={columnas}
          data={turnos}
          emptyTitle="No tienes turnos asignados"
          emptyDescription="Cuando te asignen turnos aparecerán aquí."
        />
      )}
    </div>
  );
}
