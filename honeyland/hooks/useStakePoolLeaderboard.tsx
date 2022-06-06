import {
  STAKE_POOL_ADDRESS,
  STAKE_POOL_IDL,
} from '@cardinal/staking/dist/cjs/programs/stakePool'
import { StakeEntryData } from '@cardinal/staking/src/programs/stakePool/constants'
import { useEnvironmentCtx } from './../../providers/EnvironmentProvider'
import { BorshAccountsCoder } from '@project-serum/anchor'
import { useStakePoolData } from './../../hooks/useStakePoolData'
import { AccountData } from '@cardinal/common'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

const SCORE_PER_MILLISECOND = 24 * 60 * 60 * 1000 // each day has one point

interface LeaderboardItem {
  wallet: string
  nftCount: number
  score: number
  currentWalletTotalPoint: number
}

export function useStakePoolLeaderboard(url?: string, options?: any) {
  const [status, setStatus] = useState<{
    loading: boolean
    error?: Error
    leaderboard?: any
    topScore?: number
    currentWalletTotalPoint?: number
  }>({
    loading: false,
  })

  const currentWallet = useWallet()
  const { connection } = useEnvironmentCtx()
  const { data: stakePool }: any = useStakePoolData()

  useEffect(() => {
    console.log('stakepool watched')
    if (stakePool) fetchLeaderboard()
  }, [stakePool])

  useEffect(() => {
    if (Array.isArray(status?.leaderboard)) {
      let currentWalletTotalPoint = 0
      status.leaderboard.find((item) => {
        if (item.wallet == currentWallet?.publicKey?.toString()) {
          currentWalletTotalPoint = item.score
        }
      })
      setStatus({...status , currentWalletTotalPoint })
    }
  }, [currentWallet , status.leaderboard , stakePool])

  const parseStakedTokens = (stakedTokens: any) => {
    const stakeEntryDatas: AccountData<StakeEntryData>[] = []
    const coder = new BorshAccountsCoder(STAKE_POOL_IDL)
    stakedTokens.forEach((account: any) => {
      try {
        const stakeEntryData: StakeEntryData = coder.decode(
          'stakeEntry',
          account.account.data
        )
        if (stakeEntryData) {
          stakeEntryDatas.push({
            ...account,
            parsed: stakeEntryData,
          })
        }
      } catch (e) {
        console.log('Failed to decode token manager data')
      }
    })
    return stakeEntryDatas
  }
  const getStakedTokens = async () => {
    const stakedTokens = await connection.getProgramAccounts(
      STAKE_POOL_ADDRESS,
      {
        filters: [
          {
            memcmp: {
              offset: 9,
              bytes: new PublicKey(stakePool?.pubkey).toBase58(),
            },
          },
        ],
      }
    )
    return parseStakedTokens(stakedTokens)
  }

  const fetchLeaderboard = async () => {
    let data: { [key: string]: LeaderboardItem } = {}
    let leaderboard: LeaderboardItem[] = []
    const today: number = +new Date()

    setStatus({ loading: true })
    const stakedTokens = await getStakedTokens()
    stakedTokens.forEach((stakedToken) => {
      const wallet: string = new PublicKey(
        stakedToken.parsed.lastStaker
      ).toBase58()
      const lastStakedAt: number = +new Date(
        stakedToken.parsed.lastStakedAt.toNumber() * 1000
      )
      const score: number = Math.floor(
        (today - lastStakedAt) / SCORE_PER_MILLISECOND
      )

      if (wallet === '11111111111111111111111111111111') return

      if (!data[wallet])
        data[wallet] = {
          nftCount: 0,
          score: 0,
          wallet,
        }

      // @ts-ignore
      data[wallet].nftCount++
      // @ts-ignore
      data[wallet].score += score
    })

    leaderboard = Object.values(data)
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({ ...item, rank: index + 1 }))

    const topScore = leaderboard.length ? leaderboard[0]?.score : 100
    setStatus({
      ...status,
      loading: false,
      leaderboard,
      topScore,
    })
  }

  return { ...status, fetchLeaderboard }
}
