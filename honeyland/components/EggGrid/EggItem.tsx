import styles from './EggGrid.module.scss'
import { notify } from 'common/Notification'
import { useState } from 'react'
import { LoadingSpinner } from 'common/LoadingSpinner'
import cn from 'classnames'
import StopWatchIcon from '../StopWatchIcon'
import { useLeaderboard } from '../../providers/LeaderboardProvider'
import ReleaseConfirmModal from '../ReleaseConfirmModal'
import { useMintMetadata } from 'hooks/useMintMetadata'
import {
  getImageFromTokenData,
  getNameFromTokenData,
} from 'common/tokenDataUtils'

function EggGrid({
  tk,
  onToggleSelection,
  isSelectedEgg,
  loadingButton,
  mode,
}: any) {
  const mintMetadata = useMintMetadata(tk)

  const getStakedDaysAgo = (lastStakedAt: any) => {
    return Math.floor(
      (+new Date() - +new Date(lastStakedAt.toNumber() * 1000)) / 86400000
    )
  }

  return (
    <div className={styles.gridItem} key={tk.tokenAccount?.pubkey.toString()}>
      <label>
        <div
          className={cn(styles.card, {
            [styles.selected]: isSelectedEgg(tk),
          })}
        >
          {loadingButton && isSelectedEgg(tk) && (
            <div className="absolute top-0 left-0 z-10 flex h-full w-full justify-center rounded-xl bg-black bg-opacity-80  align-middle">
              <div className="my-auto flex">
                <div>
                  <LoadingSpinner height="25px" />
                </div>
                <div className="ml-2">
                  {mode === 'staked' ? 'Releasing' : 'Incubating'}
                </div>
              </div>
            </div>
          )}
          <img
            src={getImageFromTokenData(tk, mintMetadata?.data)}
            className={styles.image}
          />

          <div className={styles.detail}>
            <span className={styles.title}>
              {(getNameFromTokenData(tk, mintMetadata?.data) || '').replace(
                mode === 'staked' ? 'Genesis ' : '',
                ''
              )}
            </span>
            {mode === 'staked' && (
              <>
                <span className={styles.divider}></span>
                <span className={styles.timeAgo}>
                  <StopWatchIcon />
                  {getStakedDaysAgo(tk.stakeEntry.parsed.lastStakedAt)} days
                </span>
              </>
            )}
          </div>
        </div>
        <input
          disabled={/* loadingStake || loadingUnstake */ false}
          placeholder={
            tk.tokenAccount?.account.data.parsed.info.tokenAmount.amount > 1
              ? '1'
              : ''
          }
          className="hidden"
          autoComplete="off"
          type={
            tk.tokenAccount?.account.data.parsed.info.tokenAmount.amount > 1
              ? 'text'
              : 'checkbox'
          }
          id={tk?.tokenAccount?.pubkey.toBase58()}
          name={tk?.tokenAccount?.pubkey.toBase58()}
          checked={isSelectedEgg(tk)}
          onChange={(e) => onToggleSelection(e, tk)}
        />
      </label>
    </div>
  )
}
export default EggGrid
