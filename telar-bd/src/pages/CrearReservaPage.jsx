import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, X } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { createCrud, listCrud } from '../services/crud.service.js';
import { crearReserva } from '../services/gestores.service.js';
import { formatRut } from '../utils/formatters.js';
import { validarRut } from '../utils/validators.js';
import { Badge, Button, Card, Input, Modal, Select } from '../components/ui/index.jsx';

// Página dedicada a registrar una nueva reserva de mesa (BCMRACUF_GESTOR_RESERVA)
export default function CrearReservaPage() {
  const { notify } = useToast();
  const navigate = useNavigate();

  // Listas cargadas desde Oracle
  const [clientes, setClientes] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Buscador con sugerencias por RUT para no recorrer una lista gigante de clientes
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [rutCliente, setRutCliente] = useState('');

  // Campos restantes del formulario de reserva
  const [numMesa, setNumMesa] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [comensales, setComensales] = useState('2');
  const [nombreAcompanante, setNombreAcompanante] = useState('');
  const [acompanantes, setAcompanantes] = useState([]);

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

  // Filtra hasta 8 clientes que coincidan con el RUT (con o sin puntos/guion) o el nombre escrito
  const textoLimpio = busquedaCliente.replace(/[.\-\s]/g, '').toLowerCase();
  const sugerencias = textoLimpio
    ? clientes
        .filter((c) => {
          const rutLimpio = String(c.RUT_CLIENTE).replace(/[.\-\s]/g, '').toLowerCase();
          const nombreLimpio = `${c.NOMBRES} ${c.APELLIDO_PATERNO}`.replace(/\s+/g, '').toLowerCase();
          return rutLimpio.includes(textoLimpio) || nombreLimpio.includes(textoLimpio);
        })
        .slice(0, 8)
    : [];

  // Cuando el usuario hace clic en una sugerencia, guardamos su RUT exacto y cerramos la lista
  function seleccionarCliente(cliente) {
    setRutCliente(cliente.RUT_CLIENTE);
    setBusquedaCliente(
      `${formatRut(cliente.RUT_CLIENTE)} — ${cliente.NOMBRES} ${cliente.APELLIDO_PATERNO}`
    );
    setMostrarSugerencias(false);
  }

  // Agrega un acompañante a la lista temporal antes de guardar la reserva
  function handleAgregarAcompanante() {
    const limpio = nombreAcompanante.trim();
    if (!limpio) return;
    setAcompanantes([...acompanantes, limpio]);
    setNombreAcompanante('');
  }

  // Quita un acompañante de la lista temporal por su posición
  function handleQuitarAcompanante(index) {
    setAcompanantes(acompanantes.filter((_, i) => i !== index));
  }

  // Envía la reserva a Oracle; los triggers validan horario libre y capacidad de la mesa
  async function handleCrearReserva(e) {
    e.preventDefault();

    if (!rutCliente) {
      notify('warning', 'Escribe el RUT y selecciona un cliente de la lista.');
      return;
    }
    if (!numMesa || !inicio || !fin) {
      notify('warning', 'Completa mesa, fecha de inicio y fecha de término.');
      return;
    }

    // Si quedó un nombre escrito sin presionar "Agregar", también lo incluimos
    const listaFinalAcomp = nombreAcompanante.trim()
      ? [...acompanantes, nombreAcompanante.trim()]
      : acompanantes;

    setGuardando(true);
    try {
      const res = await crearReserva({
        rut_cliente: rutCliente,
        num_mesa: Number(numMesa),
        inicio,
        fin,
        comensales: Number(comensales),
        acompanantes: listaFinalAcomp,
      });
      notify('success', `Reserva #${res.id_reserva} creada correctamente.`);
      navigate('/reservas');
    } catch (err) {
      notify('error', err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Guarda un cliente nuevo usando BCMRACUF_CRUD_CLIENTE con RUT formateado (XX.XXX.XXX-X)
  async function handleGuardarCliente(e) {
    e.preventDefault();
    const rutFormateado = formatRut(nuevoCliente.rut_cliente);

    if (!validarRut(rutFormateado)) {
      notify('warning', 'Ingresa un RUT válido (ej: 18.456.789-2).');
      return;
    }

    try {
      await createCrud('clientes', {
        ...nuevoCliente,
        rut_cliente: rutFormateado,
      });
      notify('success', 'Cliente registrado.');
      setModalCliente(false);
      await cargarDatos();

      // Dejamos al cliente recién creado ya seleccionado en el buscador
      setRutCliente(rutFormateado);
      setBusquedaCliente(
        `${rutFormateado} — ${nuevoCliente.nombres.trim().toUpperCase()} ${nuevoCliente.apellido_paterno.trim().toUpperCase()}`
      );
      setMostrarSugerencias(false);

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
          <p>Busca al cliente por RUT y asigna mesa, horario y acompañante opcional.</p>
        </div>
        <Button variant="secondary" onClick={() => setModalCliente(true)}>
          <UserPlus size={16} /> Nuevo Cliente
        </Button>
      </div>

      <Card padding="lg">
        <form onSubmit={handleCrearReserva} style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div className="form-grid">
            {/* Buscador de cliente por RUT con menú desplegable de coincidencias */}
            <div className="autocomplete-box">
              <Input
                label="Buscar cliente por RUT"
                placeholder="Escribe el RUT (ej: 18456 o 18.456.789-2)..."
                value={busquedaCliente}
                helperText={
                  rutCliente
                    ? `Cliente seleccionado: ${formatRut(rutCliente)}`
                    : 'Escribe al menos unos dígitos del RUT y elige una opción.'
                }
                onFocus={() => setMostrarSugerencias(true)}
                onBlur={() => setMostrarSugerencias(false)}
                onChange={(e) => {
                  setBusquedaCliente(e.target.value);
                  setRutCliente(''); // Limpia la selección previa mientras sigue escribiendo
                  setMostrarSugerencias(true);
                }}
              />

              {mostrarSugerencias && textoLimpio.length > 0 && (
                <div className="autocomplete-list">
                  {sugerencias.length > 0 ? (
                    sugerencias.map((c) => (
                      <button
                        key={c.RUT_CLIENTE}
                        type="button"
                        className="autocomplete-item"
                        // Se usa onMouseDown para que seleccione antes de que el input dispare onBlur
                        onMouseDown={() => seleccionarCliente(c)}
                      >
                        <strong>{formatRut(c.RUT_CLIENTE)}</strong>
                        <span>
                          {c.NOMBRES} {c.APELLIDO_PATERNO}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="autocomplete-empty">
                      No se encontró ningún cliente con "{busquedaCliente}".{' '}
                      <button
                        type="button"
                        onMouseDown={() => {
                          setNuevoCliente((prev) => ({
                            ...prev,
                            rut_cliente: formatRut(busquedaCliente),
                          }));
                          setModalCliente(true);
                          setMostrarSugerencias(false);
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          padding: 0,
                        }}
                      >
                        Registrar como nuevo cliente
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

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
          </div>

          {/* Sección para agregar uno o varios acompañantes a la reserva */}
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-2)', alignItems: 'end' }}>
              <Input
                label="Acompañantes (opcional)"
                placeholder="Ej: Patricia Soto"
                value={nombreAcompanante}
                onChange={(e) => setNombreAcompanante(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAgregarAcompanante();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAgregarAcompanante}>
                <Plus size={16} /> Agregar
              </Button>
            </div>

            {acompanantes.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {acompanantes.map((nombre, index) => (
                  <Badge key={`${nombre}-${index}`} variant="primary">
                    <span>{nombre}</span>
                    <button
                      type="button"
                      onClick={() => handleQuitarAcompanante(index)}
                      aria-label={`Quitar a ${nombre}`}
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        display: 'inline-flex',
                        color: 'inherit',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
            helperText="Puedes escribirlo con o sin puntos y guion; se formatea automáticamente."
            required
            value={nuevoCliente.rut_cliente}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, rut_cliente: e.target.value })}
            onBlur={() =>
              setNuevoCliente((prev) => ({
                ...prev,
                rut_cliente: formatRut(prev.rut_cliente),
              }))
            }
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
