import EmptyState from './EmptyState.jsx';
import styles from './Table.module.css';

export default function Table({
  columns = [],
  data = [],
  rowKey = 'id',
  emptyTitle = 'Sin registros',
  emptyDescription = 'Aún no hay datos para mostrar.',
}) {
  if (data.length === 0) {
    return (
      <div className={styles.wrapper}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.align ? styles[col.align] : ''}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row[rowKey] ?? index}>
              {columns.map((col) => (
                <td key={col.key} className={col.align ? styles[col.align] : ''}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}