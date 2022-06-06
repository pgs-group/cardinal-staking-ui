import { tryPublicKey } from '@cardinal/namespaces-components'
import { stakePoolMetadatas } from 'api/mapping'
import { useRouter } from 'next/router'
import { HONEYLAND_STAKE_POOL_ID } from '../honeyland/api/constants'

export const useStakePoolId = () => {
  let stakePoolId: any = ''

  const {
    query: { stakePoolId : queryStakePoolId },
  } = useRouter()

  stakePoolId = queryStakePoolId || HONEYLAND_STAKE_POOL_ID

  const nameMapping = stakePoolMetadatas.find((p) => p.name === stakePoolId)
  const addressMapping = stakePoolMetadatas.find(
    (p) => p.stakePoolAddress.toString() === stakePoolId
  )
  const publicKey =
    nameMapping?.stakePoolAddress ||
    addressMapping?.stakePoolAddress ||
    tryPublicKey(stakePoolId)

  return publicKey
}
