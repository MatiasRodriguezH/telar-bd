export default function App() {
  return (
    <main className="container" style={{ paddingBlock: 'var(--space-8)' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Nexus Gaming Store — Bloque 1
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        Verificación de tipografía, tokens de color, espaciados y foco accesible.
      </p>
      {/* Prueba de enlace y foco con tecla Tab */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <a href="#prueba">Enlace de prueba</a>
        <button type="button">Botón nativo (prueba Tab)</button>
      </div>
      {/* Muestra visual de tus tokens de color */}
      <section style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {['--primary', '--success', '--warning', '--danger', '--info'].map((token) => (
          <div
            key={token}
            style={{
              background: `var(${token})`,
              color: '#fff',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {token}
          </div>
        ))}
      </section>
    </main>
  );
}