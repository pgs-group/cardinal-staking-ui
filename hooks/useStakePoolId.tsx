import { tryPublicKey } from '@cardinal/namespaces-components'
import { PublicKey } from '@solana/web3.js'
import { stakePoolMetadatas } from 'api/mapping'
import { useRouter } from 'next/router'
import { HONEYLAND_STAKE_POOL_ID } from '../honeyland/api/constants'

import { useStakePoolMetadataCtx } from 'providers/StakePoolMetadataProvider'

export const useStakePoolId = () => {
  let stakePoolId: any = ''
  const {
    query: { stakePoolId : queryStakePoolId },
  } = useRouter()
  stakePoolId = queryStakePoolId || HONEYLAND_STAKE_POOL_ID

  const { stakePoolMetadata } = useStakePoolMetadataCtx()

  if (stakePoolMetadata)
    return new PublicKey(stakePoolMetadata.stakePoolAddress)
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
