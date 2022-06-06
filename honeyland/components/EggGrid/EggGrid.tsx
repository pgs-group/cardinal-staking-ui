import styles from './EggGrid.module.scss'
import { notify } from 'common/Notification'
import { LoadingSpinner } from 'common/LoadingSpinner'
import cn from 'classnames'

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
  let cardTitle = 'SELECT EGGS TO INCUBATE'
  let buttonStyle = styles.button
  let buttonTitle = 'INCUBATE'

  if (mode === 'staked') {
    cardTitle = 'YOUR INCUBATED EGGS'
    buttonStyle += ' ' + styles.button_red
    buttonTitle = 'RELEASE'
  }
  const onToggleSelection = (e, tk) => {
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

  return (
    <div className={styles.wrapper}>
      <div className="flex justify-around">
        <h3 className={styles.heading}>{cardTitle}</h3>
        {mode === 'staked' && (
          <h3 className={styles.heading}>Total Points: ...</h3>
        )}
      </div>
      <div className={styles.grid}>
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
                    <img
                      src={tk.metadata?.data.image || tk.tokenListData?.logoURI}
                      className={styles.image}
                    />
                    <div className={styles.detail}>
                      <span
                        title={tk.metadata?.data.name}
                        className={styles.title}
                      >
                        {tk.metadata?.data.name}
                      </span>
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
            handleClick()
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
