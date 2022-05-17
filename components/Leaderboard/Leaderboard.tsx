import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import cn from 'classnames'
import { colors } from './constant'
import { shortPubKey } from 'common/utils'
import {
  STAKE_POOL_ADDRESS,
  STAKE_POOL_IDL,
} from '@cardinal/staking/dist/cjs/programs/stakePool'
import { StakeEntryData } from '@cardinal/staking/src/programs/stakePool/constants'
import { useEnvironmentCtx } from '../../providers/EnvironmentProvider'
import { BorshAccountsCoder } from '@project-serum/anchor'
import { useStakePoolData } from '../../hooks/useStakePoolData'
import { AccountData } from '@cardinal/common'
import { PublicKey } from '@solana/web3.js'

interface LeaderboardItemType {
  wallet: string
  nftCount: number
  score: number
}

export default function Leaderboard() {
  const [showModal, setShowModal] = useState(false)
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(false)
  const [maxScore, setMaxScore] = useState(100)
  const { connection } = useEnvironmentCtx()
  const { data: stakePool }: any = useStakePoolData()

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

  const getLeaderboard = async () => {
    const leaderboard: { [key: string]: LeaderboardItemType } = {}
    const stakedTokens = await getStakedTokens()
    stakedTokens.forEach((stakedToken) => {
      const walletId: string = new PublicKey(
        stakedToken.parsed.lastStaker
      ).toBase58()

      console.log()
      const score: number = Math.floor(
        (+new Date() -
          +new Date(stakedToken.parsed.lastStakedAt.toNumber() * 1000)) /
          86400000
      )

      if (!leaderboard[walletId])
        leaderboard[walletId] = {
          nftCount: 0,
          score: 0,
          wallet: walletId,
        }

      // @ts-ignore
      leaderboard[walletId].nftCount++
      // @ts-ignore
      leaderboard[walletId].score += score
    })
    let items = Object.values(leaderboard).sort(
      (a: LeaderboardItemType, b: LeaderboardItemType) => {
        return b.score - a.score
      }
    )
    return items
      .map((item, index) => {
        return {
          ...item,
          rank: index + 1,
        }
      })
      .filter((item) => item.wallet !== '11111111111111111111111111111111')
  }

  const show = () => {
    setLoading(true)
    getLeaderboard().then((res: any) => {
      setLoading(false)
      const max = res.length ? res[0].score : 100
      setLeaders(res)
      setMaxScore(max)
    })
    setShowModal(true)
    document.body.setAttribute('style', 'position: fixed;top:0;right:0;left:0')
  }
  const close = () => {
    setShowModal(false)
    document.body.setAttribute('style', '')
    window.scrollTo(0, 0)
  }
  return (
    <>
      <a
        className="pr-8 text-base font-semibold text-white hover:text-white"
        onClick={() => show()}
      >
        Leaderboard
      </a>
      <div className={cn('leaderboard-modal', { show: showModal })}>
        <div className="leaderboard-overlay" onClick={() => close()}></div>
        <div className={cn('leaderboard-modal-body', { show: showModal })}>
          <FiX
            onClick={() => close()}
            size="22"
            className="leaderboard-close"
          />
          <div className="Leaderboard">
            <h3 className="Leaderboard-title">Leaderboard</h3>
            <div className="leaders">
              {loading && <h1>Loading...</h1>}
              {leaders.map((el: any, i) => (
                <div
                  key={i}
                  style={{
                    animationDelay: i * 0.1 + 's',
                  }}
                  className="leader"
                >
                  <div className="leader-wrap">
                    {i < 3 ? (
                      <div
                        style={{
                          backgroundColor: colors[i],
                        }}
                        className="leader-ava"
                      >
                        <svg
                          fill="#fff"
                          xmlns="http://www.w3.org/2000/svg"
                          height={24}
                          width={24}
                          viewBox="0 0 32 32"
                        >
                          <path d="M 16 3 C 14.354991 3 13 4.3549901 13 6 C 13 7.125993 13.63434 8.112309 14.5625 8.625 L 11.625 14.5 L 7.03125 11.21875 C 7.6313215 10.668557 8 9.8696776 8 9 C 8 7.3549904 6.6450096 6 5 6 C 3.3549904 6 2 7.3549904 2 9 C 2 10.346851 2.9241199 11.470238 4.15625 11.84375 L 6 22 L 6 26 L 6 27 L 7 27 L 25 27 L 26 27 L 26 26 L 26 22 L 27.84375 11.84375 C 29.07588 11.470238 30 10.346852 30 9 C 30 7.3549901 28.645009 6 27 6 C 25.354991 6 24 7.3549901 24 9 C 24 9.8696781 24.368679 10.668557 24.96875 11.21875 L 20.375 14.5 L 17.4375 8.625 C 18.36566 8.112309 19 7.125993 19 6 C 19 4.3549901 17.645009 3 16 3 z M 16 5 C 16.564129 5 17 5.4358709 17 6 C 17 6.5641291 16.564129 7 16 7 C 15.435871 7 15 6.5641291 15 6 C 15 5.4358709 15.435871 5 16 5 z M 5 8 C 5.5641294 8 6 8.4358706 6 9 C 6 9.5641286 5.5641291 10 5 10 C 4.4358709 10 4 9.5641286 4 9 C 4 8.4358706 4.4358706 8 5 8 z M 27 8 C 27.564129 8 28 8.4358709 28 9 C 28 9.5641283 27.564128 10 27 10 C 26.435872 10 26 9.5641283 26 9 C 26 8.4358709 26.435871 8 27 8 z M 16 10.25 L 19.09375 16.4375 L 20.59375 16.8125 L 25.59375 13.25 L 24.1875 21 L 7.8125 21 L 6.40625 13.25 L 11.40625 16.8125 L 12.90625 16.4375 L 16 10.25 z M 8 23 L 24 23 L 24 25 L 8 25 L 8 23 z" />
                        </svg>
                      </div>
                    ) : null}
                    <div className="leader-content">
                      <div className="leader-name">
                        {el.rank}. {shortPubKey(el.wallet)}
                      </div>
                      <div className="leader-stat">
                        <div className="leader-stat-item">
                          <span>Score :</span>
                          <div className="leader-score_title">{el.score}</div>
                        </div>
                        <div className="leader-stat-item">
                          <span>Nft :</span>
                          <div className="leader-score_title">
                            {el.nftCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ animationDelay: 0.4 + i * 0.2 + 's' }}
                    className="leader-bar"
                  >
                    <div
                      style={{
                        backgroundColor: colors[i],
                        width: (el.score / maxScore) * 100 + '%',
                      }}
                      className="bar"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
