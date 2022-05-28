import { useState } from 'react'
import Modal from 'react-modal'
import styles from './BasicModal.module.scss'
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    color: 'black',
  },
}
export default function BasicModal({
  show,
  closeModal,
  closeIcon,
  children,
  ...props
}) {
  Modal.setAppElement(`#__next`)

  return (
    <div>
      <Modal
        isOpen={show}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
        overlayClassName={`${styles.overlay} ${styles.overlayCustom}`}
        className={`${styles.body} ${styles.bodyCustom}`}
        {...props}
      >
        {closeIcon && (
          <div className={styles.header}>
            <span className={styles.closeButton} onClick={closeModal}>
              <svg width="14" height="14">
                <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path>
              </svg>
            </span>
          </div>
        )}
        {children}
      </Modal>
    </div>
  )
}
