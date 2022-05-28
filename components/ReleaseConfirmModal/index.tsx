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
      closeIcon
    >
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
