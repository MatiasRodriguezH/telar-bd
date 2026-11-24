import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

const ICONS = {
  success: <CheckCircle2 size={18} className={styles.iconSuccess} />,
  error: <AlertCircle size={18} className={styles.iconError} />,
  warning: <AlertTriangle size={18} className={styles.iconWarning} />,
  info: <Info size={18} className={styles.iconInfo} />,
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          {ICONS[toast.type] || ICONS.info}
          <span className={styles.message}>{toast.message}</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}