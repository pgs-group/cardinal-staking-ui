import cn from 'classnames'
import { colors } from './constant'
import { FiX, FiUser } from 'react-icons/fi'
import { shortPubKey } from 'common/utils'
import { useState } from 'react'
import { useStakePoolLeaderboard } from '../../hooks/useStakePoolLeaderboard'
import { useWallet } from '@solana/wallet-adapter-react'
import { useLeaderboard } from '../../providers/LeaderboardProvider'
import BasicModal from '../../components/BasicModal'
export default function Leaderboard() {
  const { leaderboard, loading, topScore } = useLeaderboard()
  const [showModal, setShowModal] = useState(false)
  const wallet = useWallet()

  const show = () => {
    setShowModal(true)
    // document.body.setAttribute('style', 'position: fixed;top:0;right:0;left:0')
  }

  const close = () => {
    setShowModal(false)
    // document.body.setAttribute('style', '')
    window.scrollTo(0, 0)
  }

  return (
    <>
      <a onClick={() => show()}>LEADERBOARD</a>
      <BasicModal
        show={showModal}
        closeModal={() => {
          close()
        }}
      >
        <>
          <span className="leaderboard-close" onClick={close}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.3056 0.585136L6.50015 3.77725L9.69469 0.585136C11.4816 -1.2042 14.2045 1.51627 12.4152 3.3056L9.22305 6.50015L12.4152 9.69469C14.2045 11.4816 11.4816 14.2045 9.69469 12.4152L6.50015 9.22305L3.3056 12.4152C1.51627 14.2045 -1.2042 11.4816 0.585136 9.69469L3.77725 6.50015L0.585136 3.3056C-1.2042 1.51627 1.51627 -1.2042 3.3056 0.585136Z"
                fill="white"
              />
            </svg>
          </span>

          <div className="Leaderboard">
            <h3 className="Leaderboard-title">LEADERBOARD</h3>
            <div className="leaders custom-scrollbar">
              {loading && <h1 className="leaders-loading">LOADING...</h1>}
              {!loading && leaderboard && leaderboard.length === 0 && (
                <h1 className="leaders-loading" style={{ fontSize: '15px' }}>
                  No Items Found
                </h1>
              )}
              {leaderboard &&
                leaderboard.map((item: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      animationDelay: index * 0.1 + 's',
                    }}
                    className="leader"
                  >
                    {wallet?.publicKey?.toString() === item.wallet && (
                      <FiUser size={24} className="current-user-leader-icon" />
                    )}
                    <div className="leader-wrap">
                      {index < 3 ? (
                        <div
                          style={{
                            backgroundColor: colors[index],
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
                          {item.rank}. {shortPubKey(item.wallet)}
                        </div>
                        <div className="leader-stat">
                          <div className="leader-stat-item">
                            <span>Score:</span>
                            <div className="leader-score_title">
                              {item.score}
                            </div>
                          </div>
                          <div className="leader-stat-item">
                            <span>NFTs:</span>
                            <div className="leader-score_title">
                              {item.nftCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ animationDelay: 0.4 + index * 0.2 + 's' }}
                      className="leader-bar"
                    >
                      <div
                        style={{
                          backgroundColor: colors[index],
                          width: (item.score / (topScore || 100)) * 100 + '%',
                        }}
                        className="bar"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      </BasicModal>
    </>
  )
}
