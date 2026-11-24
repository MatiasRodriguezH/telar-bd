import { useId } from 'react';
import styles from './Select.module.css';

export default function Select({
  label,
  id,
  options = [],
  placeholder,
  error,
  helperText,
  className = '',
  children,
  ...props
}) {
  const generatedId = useId();
  const selectId = id || generatedId;

  const selectClasses = [
    styles.select,
    error ? styles.hasError : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={selectClasses}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error ? (
        <span className={styles.error}>{error}</span>
      ) : (
        helperText && <span className={styles.helper}>{helperText}</span>
      )}
    </div>
  );
}