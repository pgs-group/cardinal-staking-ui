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
  useEffect(() => {
    if (!wallet.connected && !wallet.connecting && !wallet.wallet) {
      setVisible(true)
    }
  }, [])
  return (
    <div>
      {wallet.connected ? (
        <div className="flex flex-row" onClick={() => setVisible(true)}>
          <div className="text-white">
            {wallet?.publicKey ? shortPubKey(wallet?.publicKey) : ''}
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
