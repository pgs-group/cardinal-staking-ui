import { useEffect, useState } from 'react'
import BasicModal from 'components/BasicModal'
import styles from './index.module.scss'
import BasicCheckbox from 'components/BasicCheckbox'
import BasicButton from 'components/BasicButton'
export default function ReleaseConfirmModal({ show, handleConfirm, onClose }) {
  const [innerShow, setInnerShow] = useState(show)
  const [checkbox, setCheckbox] = useState(false)
  const handleCheck = (e) => {
    const target = e.target
    setCheckbox(target.checked)
  }

  useEffect(() => {
    if (!show) setCheckbox(false)
    setInnerShow(show)
  }, [show])
  return (
    <BasicModal
      show={innerShow}
      closeModal={() => {
        onClose()
      }}
    >
      <div className={styles.header}>
        <span className={styles.closeButton} onClick={onClose}>
          <svg width="14" height="14">
            <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path>
          </svg>
        </span>
      </div>
      <div className={styles.wrapper}>
        <h3 className={styles.heading}>Are you sure?</h3>
        <p>
          Releasing your Genesis Egg from the incubator will reset your points
          to zero for that particular Genesis Egg.This cannot be undone.
          <br />
          <br />
          You will not lose points accumulated for Genesis Eggs that remain in
          the incubator.
        </p>
        <div className={styles.checkboxForm}>
          <BasicCheckbox
            id="confirmCheckbox"
            checked={checkbox}
            onChange={handleCheck}
          />
          <label className={styles.checkboxFormLabel} for="confirmCheckbox">
            I understand that by releasing my Genesis Egg from the incubator
            will reset my points for that Genesis Egg.
          </label>
        </div>
        <div className={styles.footer}>
          <BasicButton
            onClick={handleConfirm}
            disabled={!checkbox}
            type={checkbox ? 'red' : 'gray'}
          >
            Release my Genesis Egg
          </BasicButton>
          <span className={styles.cancelConfirm} onClick={onClose}>
            Nevermind
          </span>
        </div>
      </div>
    </BasicModal>
  )
}
