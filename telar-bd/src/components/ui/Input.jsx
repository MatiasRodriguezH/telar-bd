import { useId } from 'react';
import styles from './Input.module.css';

export default function Input({
  label,
  id,
  error,
  helperText,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const inputClasses = [
    styles.input,
    error ? styles.hasError : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClasses}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? (
        <span className={styles.error}>{error}</span>
      ) : (
        helperText && <span className={styles.helper}>{helperText}</span>
      )}
    </div>
  );
}