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
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.3056 0.585136L6.50015 3.77725L9.69469 0.585136C11.4816 -1.2042 14.2045 1.51627 12.4152 3.3056L9.22305 6.50015L12.4152 9.69469C14.2045 11.4816 11.4816 14.2045 9.69469 12.4152L6.50015 9.22305L3.3056 12.4152C1.51627 14.2045 -1.2042 11.4816 0.585136 9.69469L3.77725 6.50015L0.585136 3.3056C-1.2042 1.51627 1.51627 -1.2042 3.3056 0.585136Z"
              fill="white"
            />
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
