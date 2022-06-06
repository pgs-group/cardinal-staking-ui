import styles from './index.module.scss'
export default function BasicCheckbox({ id, checked, onChange }) {
  return (
    <label className={styles.wrapper}>
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.checkmark}></span>
    </label>
  )
}
