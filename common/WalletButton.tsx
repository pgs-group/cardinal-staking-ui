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

export default function WalletButton({ btnClass }) {
  const ctx = useEnvironmentCtx()
  const wallet = useWallet()
  const { setVisible } = useWalletModal()
  return (
    <div>
      {wallet.connected ? (
        <div className="flex flex-row" onClick={() => setVisible(true)}>
          <div className="text-white">
            {wallet?.publicKey ? shortPubKey(wallet?.publicKey) : ''}
          </div>
          {/* <AddressImage
            connection={ctx.connection}
            address={wallet.publicKey || undefined}
            height="30px"
            width="30px"
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
                  marginLeft: '5px',
                }}
              >
                <div style={{ height: '40px', width: '40px' }}>
                  <HiUserCircle style={{ height: '100%', width: '100%' }} />
                </div>
              </div>
            }
          /> */}
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
