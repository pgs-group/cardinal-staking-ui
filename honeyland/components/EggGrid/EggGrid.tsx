import styles from './EggGrid.module.scss'
import { notify } from 'common/Notification'
import { useState } from 'react'
import { LoadingSpinner } from 'common/LoadingSpinner'
import cn from 'classnames'
import StopWatchIcon from '../StopWatchIcon'
import { useLeaderboard } from '../../providers/LeaderboardProvider'
import ReleaseConfirmModal from '../ReleaseConfirmModal'

function EggGrid({
  mode,
  eggs,
  selectedEggs,
  setSelectedEggs,
  isSelectedEgg,
  handleClick,
  loading,
  loadingButton,
}) {
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false)
  const { currentWalletTotalPoint } = useLeaderboard()
  let cardTitle = 'SELECT EGGS TO INCUBATE'
  let buttonStyle = styles.button
  let buttonTitle = 'INCUBATE'

  if (mode === 'staked') {
    cardTitle = 'YOUR INCUBATED EGGS'
    buttonStyle += ' ' + styles.button_red
    buttonTitle = 'RELEASE'
  }

  const getStakedDaysAgo = (lastStakedAt: any) => {
    return Math.floor(
      (+new Date() - +new Date(lastStakedAt.toNumber() * 1000)) / 86400000
    )
  }

  const onToggleSelection = (e, tk) => {
    if (mode === 'staked') {
      if (isSelectedEgg(tk)) {
        setSelectedEggs(
          selectedEggs.filter(
            (data) =>
              data.stakeEntry?.pubkey.toString() !==
              tk.stakeEntry?.pubkey.toString()
          )
        )
      } else {
        setSelectedEggs([...selectedEggs, tk])
      }
    } else {
      const amount = Number(e.target.value)
      if (tk.tokenAccount?.account.data.parsed.info.tokenAmount.amount > 1) {
        if (e.target.value.length > 0 && !amount) {
          notify({
            message: 'Please enter a valid amount',
            type: 'error',
          })
          setSelectedEggs(
            selectedEggs.filter(
              (data) =>
                data.tokenAccount?.account.data.parsed.info.mint.toString() !==
                tk.tokenAccount?.account.data.parsed.info.mint.toString()
            )
          )
          return
        }
        tk.amountToStake = amount
      }

      if (isSelectedEgg(tk)) {
        setSelectedEggs(
          selectedEggs.filter(
            (data) =>
              data.tokenAccount?.account.data.parsed.info.mint.toString() !==
              tk.tokenAccount?.account.data.parsed.info.mint.toString()
          )
        )
      } else {
        if (tk.tokenAccount?.account.data.parsed.info.tokenAmount.amount > 1) {
          tk.amountToStake = amount
        }
        setSelectedEggs([...selectedEggs, tk])
      }
    }
  }
  const handleReleaseConfirm = () => {
    setShowReleaseConfirm(false)
    handleClick()
  }
  const handleReleaseClick = () => {
    setShowReleaseConfirm(true)
  }
  const toggleAllSelect = () => {
    selectedEggs?.length === eggs?.length
      ? setSelectedEggs([])
      : setSelectedEggs(eggs)
  }
  return (
    <div className={styles.wrapper}>
      <ReleaseConfirmModal
        show={showReleaseConfirm}
        handleConfirm={handleReleaseConfirm}
        onClose={() => setShowReleaseConfirm(false)}
      />
      <div className="flex items-center justify-between	 pt-1 pb-3">
        <h3 className={styles.heading}>{cardTitle}</h3>
        {mode === 'staked' && (
          <h3 className={cn(styles.heading, styles.totalPoints)}>
            Total Points:{' '}
            {currentWalletTotalPoint ? currentWalletTotalPoint : '...'}
          </h3>
        )}

        <button
          type="button"
          onClick={toggleAllSelect}
          className={styles.selectAllButton}
          style={{ opacity: eggs?.length ? '1' : '.5' }}
          disabled={!eggs?.length}
        >
          {' '}
          {selectedEggs?.length === eggs?.length && eggs?.length
            ? 'Deselect All'
            : 'Select All'}
        </button>
      </div>
      <div className={`${styles.grid} custom-scrollbar`}>
        {loading ? (
          <div className="align-center flex h-full w-full justify-center">
            <LoadingSpinner height="100px" />
          </div>
        ) : (
          <>
            {(eggs || []).map((tk) => (
              <div
                className={styles.gridItem}
                key={tk.tokenAccount?.pubkey.toString()}
              >
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
                      src={tk.metadata?.data.image || tk.tokenListData?.logoURI}
                      className={styles.image}
                    />
                    <div className={styles.detail}>
                      <span
                        title={tk.metadata?.data.name}
                        className={styles.title}
                      >
                        {(tk.metadata?.data.name || '').replace(
                          mode === 'staked' ? 'Genesis ' : '',
                          ''
                        )}
                      </span>
                      {mode === 'staked' && (
                        <>
                          <span className={styles.divider}></span>
                          <span className={styles.timeAgo}>
                            <StopWatchIcon />
                            {getStakedDaysAgo(
                              tk.stakeEntry.parsed.lastStakedAt
                            )}{' '}
                            days
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <input
                    disabled={/* loadingStake || loadingUnstake */ false}
                    placeholder={
                      tk.tokenAccount?.account.data.parsed.info.tokenAmount
                        .amount > 1
                        ? '1'
                        : ''
                    }
                    className="hidden"
                    autoComplete="off"
                    type={
                      tk.tokenAccount?.account.data.parsed.info.tokenAmount
                        .amount > 1
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
            ))}
          </>
        )}
      </div>
      <div className={styles.footer}>
        <button
          className={buttonStyle}
          onClick={() => {
            if (selectedEggs.length === 0) {
              notify({
                message: `No tokens selected`,
                type: 'error',
              })
            }
            if (mode === 'staked') {
              handleReleaseClick()
            } else {
              handleClick()
            }
          }}
        >
          <span className="mr-1 inline-block">
            {loadingButton ? <LoadingSpinner height="25px" /> : ''}
          </span>
          <span className="my-auto">{buttonTitle}</span>
        </button>
      </div>
    </div>
  )
}
export default EggGrid
