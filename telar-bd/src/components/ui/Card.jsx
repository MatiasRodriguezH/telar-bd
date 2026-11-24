import styles from './Card.module.css';

export default function Card({
  padding = 'md',
  className = '',
  children,
  ...props
}) {
  const classes = [styles.card, styles[padding], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}