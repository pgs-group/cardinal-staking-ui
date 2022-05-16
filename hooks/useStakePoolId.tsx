import { tryPublicKey } from '@cardinal/namespaces-components'
import { stakePoolMetadatas } from 'api/mapping'
import { useRouter } from 'next/router'
import { STAKE_POOL_ID_HONEYLAND } from '../api/constants'

export const useStakePoolId = () => {
  let id: any = ''
  const {
    query: { stakePoolId },
  } = useRouter()
  id = stakePoolId || STAKE_POOL_ID_HONEYLAND
  const nameMapping = stakePoolMetadatas.find((p) => p.name === id)
  const addressMapping = stakePoolMetadatas.find(
    (p) => p.pubkey.toString() === id
  )
  const publicKey =
    nameMapping?.pubkey || addressMapping?.pubkey || tryPublicKey(id)

  return publicKey
}
