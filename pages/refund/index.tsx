import { useWallet } from '@solana/wallet-adapter-react'
import {
  useWalletModal,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import { useEffect } from 'react'
import { getNfts, getAllNfts, getNft } from '../../api/api_custom'

export default function refund() {
  const { publicKey } = useWallet()
  useEffect(() => {
    if (!publicKey) return
    getNfts(publicKey).then((res) => console.log(res))
    // getAllNfts().then((res) => console.log('all', res))
    // getNft(
    //   'https://arweave.net/UsyQlC1tfhWOsfpBm0odHA0GRq_4iR_4faTG3pzYMd4'
    // ).then((res) => console.log(res))
  }, [publicKey])
  return (
    <div>
      <WalletMultiButton />
    </div>
  )
}
