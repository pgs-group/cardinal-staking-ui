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
export default function BasicModal({ show, closeModal, children, ...props }) {
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
        {children}
      </Modal>
    </div>
  )
}
