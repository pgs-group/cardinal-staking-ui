import { FiPower } from 'react-icons/fi'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  useWalletModal,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import { AddressImage, DisplayAddress } from '@cardinal/namespaces-components'

import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { shortPubKey } from './utils'
import { HiUserCircle } from 'react-icons/hi'
import { BiWallet } from 'react-icons/bi'
import { useEffect } from 'react'

export default function WalletButton({ btnClass }) {
  const ctx = useEnvironmentCtx()
  const wallet = useWallet()
  const { setVisible } = useWalletModal()
  const disconnectWallet = () => {
    if (wallet && wallet.connected) wallet.disconnect()
    if (wallet.disconnecting) wallet.disconnect()
  }
  useEffect(() => {
    if (!wallet.connected && !wallet.connecting && !wallet.wallet) {
      setVisible(true)
    }
  }, [])
  return (
    <div>
      {wallet.connected ? (
        <div className="flex flex-row items-center">
          <div className="text-white" onClick={() => disconnectWallet()}>
            DISCONNECT WALLET
          </div>
        </div>
      ) : (
        <WalletMultiButton className={btnClass}>
          {!btnClass && <BiWallet size="22" className="mr-2" />}
          Connect Wallet
        </WalletMultiButton>
      )}
    </div>
  )
}
