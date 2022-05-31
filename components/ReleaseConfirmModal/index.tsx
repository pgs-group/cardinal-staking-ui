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
          Releasing your NFT from the Staking will reset your points to zero for
          that particular NFT.This cannot be undone.
          <br />
          <br />
          You will not lose points accumulated for NFTs that remain in the
          Staking.
        </p>
        <div className={styles.checkboxForm}>
          <BasicCheckbox
            id="confirmCheckbox"
            checked={checkbox}
            onChange={handleCheck}
          />
          <label className={styles.checkboxFormLabel} for="confirmCheckbox">
            I understand that by releasing my NFTs from the Staking will reset
            my points for that NFT.
          </label>
        </div>
        <div className={styles.footer}>
          <BasicButton
            onClick={handleConfirm}
            disabled={!checkbox}
            type={checkbox ? 'red' : 'gray'}
          >
            Release my NFT
          </BasicButton>
          <span className={styles.cancelConfirm} onClick={onClose}>
            Nevermind
          </span>
        </div>
      </div>
    </BasicModal>
  )
}
