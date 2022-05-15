import { useWallet } from '@solana/wallet-adapter-react'
import {
  useWalletModal,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import { AddressImage, DisplayAddress } from '@cardinal/namespaces-components'

import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { shortPubKey } from './utils'
import { HiUserCircle } from 'react-icons/hi'

export default function WalletButton() {
  const ctx = useEnvironmentCtx()
  const wallet = useWallet()
  const { setVisible } = useWalletModal()
  return (
    <div>
      {wallet.connected ? (
        <div
          className="rounded-xlg flex cursor-pointer gap-2 rounded-2xl bg-gray-800 py-2 px-4"
          onClick={() => setVisible(true)}
        >
          <div>
            <div className="wallet-address">
              <DisplayAddress
                style={{ pointerEvents: 'none', color: 'white' }}
                connection={ctx.connection}
                address={wallet.publicKey || undefined}
                height="12px"
                width="100px"
                dark={true}
              />
            </div>
            <div className="text-gray-200">
              {wallet?.publicKey ? shortPubKey(wallet?.publicKey) : ''}
            </div>
          </div>
          <AddressImage
            connection={ctx.connection}
            address={wallet.publicKey || undefined}
            height="40px"
            width="40px"
            dark={true}
            placeholder={
              <div
                style={{
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  marginRight: '5px',
                }}
              >
                <div style={{ height: '40px', width: '40px' }}>
                  <HiUserCircle style={{ height: '100%', width: '100%' }} />
                </div>
              </div>
            }
          />
        </div>
      ) : (
        <WalletMultiButton />
      )}
    </div>
  )
}
