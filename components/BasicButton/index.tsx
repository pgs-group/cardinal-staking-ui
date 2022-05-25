import styles from './index.module.scss'
export default function BasicButton({ onClick, children, type, ...props }) {
  return (
    <button
      className={`${styles.button} ${styles[type]}`}
      type="button"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
