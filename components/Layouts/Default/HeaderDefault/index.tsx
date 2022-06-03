import Image from 'next/image'
import Leaderboard from 'components/Leaderboard/Leaderboard'
import { useLeaderboard } from 'providers/LeaderboardProvider'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { number } from 'yup/lib/locale'
import WalletButton from 'common/WalletButton'
const HeaderDefault = () => {
  const { leaderboard } = useLeaderboard()
  const router = useRouter()
  const page = router.route.includes('refund') ? 'refund' : 'main'

  const [statistics, setStatistics] = useState({
    totalStakedNft: 0,
    totalScore: 0,
  })
  useEffect(() => {
    if (Array.isArray(leaderboard)) {
      const temp = {
        totalStakedNft: 0,
        totalScore: 0,
      }

      leaderboard.forEach((item) => {
        temp.totalStakedNft += item.nftCount
        temp.totalScore += item.score
      })
      setStatistics(temp)
    }
  }, [leaderboard])
  return (
    <div className="v-header">
      <div className="v-header-logo">
        <img src="/honeyland-logo.png" width="100%" />
      </div>
      <div className="v-header-content">
        <div className="v-header-menu">
          <div className="v-header-menu-title">
            {page === 'refund'
              ? 'REFUNDING GENESIS EGGs'
              : 'GENESIS EGG INCUBATOR'}
          </div>
          <div className="v-header-menu-buttons">
            {page !== 'refund' && <Leaderboard />}
            <a>
              <WalletButton btnClass="walletButton" />
            </a>
          </div>
        </div>
        {page !== 'refund' && (
          <div className="v-header-statistics">
            <div className="v-header-statistics-box">
              <div className="v-header-statistics-box__count">
                {statistics.totalStakedNft}
              </div>
              <div className="v-header-statistics-box__title">
                Total Genesis Eggs Incubating
              </div>
            </div>
            <div className="v-header-statistics-box">
              <div className="v-header-statistics-box__count">
                {(statistics.totalStakedNft * 0.0181).toFixed(2)}%
              </div>
              <div className="v-header-statistics-box__title">
                % of Genesis Eggs Incubating
              </div>
            </div>
            <div className="v-header-statistics-box">
              <div className="v-header-statistics-box__count">
                {statistics.totalScore}
              </div>
              <div className="v-header-statistics-box__title">
                Total Incubating Points Earned
              </div>
            </div>
          </div>
        )}
      </div>
      <img src="/bee-01.png" className="v-header-top-bee" />
      <img src="/bee-02.png" className="v-header-bottom-bee" />
    </div>
  )
}
export default HeaderDefault
