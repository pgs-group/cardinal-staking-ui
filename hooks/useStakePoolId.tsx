import { tryPublicKey } from '@cardinal/namespaces-components'
import { stakePoolMetadatas } from 'api/mapping'
import { useRouter } from 'next/router'
import { HONEYLAND_STAKE_POOL_ID } from '../honeyland/api/constants'

export const useStakePoolId = () => {
  let id: any = ''

  const {
    query: { stakePoolId },
  } = useRouter()
  const nameMapping = stakePoolMetadatas.find((p) => p.name === stakePoolId)
  const addressMapping = stakePoolMetadatas.find(
    (p) => p.stakePoolAddress.toString() === id
  )
  const publicKey =
    nameMapping?.stakePoolAddress ||
    addressMapping?.stakePoolAddress ||
    tryPublicKey(id)

  return publicKey
}
