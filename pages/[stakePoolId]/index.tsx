import { useEffect } from 'react'
import {
  createStakeEntryAndStakeMint,
  stake,
  unstake,
  executeTransaction,
} from '@cardinal/staking'
import cn from 'classnames'
import { ReceiptType } from '@cardinal/staking/dist/cjs/programs/stakePool'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { TokenData } from 'api/types'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { useState } from 'react'
import { Wallet } from '@metaplex/js'
import { useUserTokenData } from 'providers/TokenDataProvider'
import { LoadingSpinner } from 'common/LoadingSpinner'
import { notify } from 'common/Notification'
import {
  getMintDecimalAmountFromNaturalV2,
  getMintNaturalAmountFromDecimal,
} from 'common/units'
import { BN } from '@project-serum/anchor'
import { useStakedTokenDatas } from 'hooks/useStakedTokenDatas'
import { AllowedTokens } from 'components/AllowedTokens'
import { useStakePoolEntries } from 'hooks/useStakePoolEntries'
import { useStakePoolData } from 'hooks/useStakePoolData'
import { useAllowedTokenDatas } from 'hooks/useAllowedTokenDatas'
import DefaultLayout from 'components/Layouts/Default'
import styles from './StakePoolId.module.scss'
import StopWatchIcon from 'components/StopWatchIcon'
import { useLeaderboard } from 'providers/LeaderboardProvider'
import BasicImage from 'common/BasicImage'
import ReleaseConfirmModal from 'components/ReleaseConfirmModal'
function Home() {
  const { connection, environment } = useEnvironmentCtx()
  const wallet = useWallet()
  const userTokenAccounts = useUserTokenData()
  const { data: stakePool, loaded: stakePoolLoaded } = useStakePoolData()
  const stakedTokenDatas = useStakedTokenDatas()
  const stakePoolEntries = useStakePoolEntries()

  const [unstakedSelected, setUnstakedSelected] = useState<TokenData[]>([])
  const [stakedSelected, setStakedSelected] = useState<TokenData[]>([])
  const [loadingStake, setLoadingStake] = useState(false)
  const [loadingUnstake, setLoadingUnstake] = useState(false)
  const [receiptType, setReceiptType] = useState<ReceiptType>(
    ReceiptType.Original
  )
  const [showFungibleTokens, setShowFungibleTokens] = useState(false)
  const [showAllowedTokens, setShowAllowedTokens] = useState<boolean>()
  const [totalPoints, setTotalPoints] = useState(null)
  const { data: filteredTokens } = useAllowedTokenDatas(showFungibleTokens)
  const { leaderboard, fetchLeaderboard } = useLeaderboard()
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false)
  const handleReleaseConfirm = () => {
    setShowReleaseConfirm(false)
    handleUnstake()
  }
  const showResultTokens = () => {
    if (!wallet.connected) return []
    if (!filteredTokens) return []
    else return filteredTokens
  }
  useEffect(() => {
    if (Array.isArray(leaderboard)) {
      let walletPoints = null
      leaderboard.find((item) => {
        if (item.wallet == wallet?.publicKey?.toString()) {
          walletPoints = item.score
        }
      })
      setTotalPoints(walletPoints)
    }
  }, [leaderboard, stakedTokenDatas, wallet?.publicKey])

  async function handleUnstake() {
    if (!wallet.connected) {
      notify({ message: `Wallet not connected`, type: 'error' })
      return
    }
    if (!stakePool) {
      notify({ message: `No stake pool detected`, type: 'error' })
      return
    }
    setLoadingUnstake(true)

    for (let step = 0; step < stakedSelected.length; step++) {
      try {
        let token = stakedSelected[step]
        if (!token || !token.stakeEntry) {
          throw new Error('No stake entry for token')
        }
        console.log('Unstaking...')
        // unstake
        const transaction = await unstake(connection, wallet as Wallet, {
          stakePoolId: stakePool?.pubkey,
          originalMintId: token.stakeEntry.parsed.originalMint,
        })
        await executeTransaction(connection, wallet as Wallet, transaction, {})
        notify({
          message: `Successfully unstaked ${step + 1}/${stakedSelected.length}`,
          type: 'success',
        })
        fetchLeaderboard && fetchLeaderboard()
        console.log('Successfully unstaked')
        userTokenAccounts
          .refreshTokenAccounts(true)
          .then(() => userTokenAccounts.refreshTokenAccounts())
        stakedTokenDatas.refresh(true).then(() => stakedTokenDatas.refresh())
        stakePoolEntries.refresh().then(() => stakePoolEntries.refresh())
      } catch (e) {
        notify({ message: `Transaction failed: ${e}`, type: 'error' })
        console.error(e)
        break
      }
    }

    setStakedSelected([])
    setUnstakedSelected([])
    setLoadingUnstake(false)
  }

  async function handleStake() {
    if (!wallet.connected) {
      notify({ message: `Wallet not connected`, type: 'error' })
      return
    }
    if (!stakePool) {
      notify({ message: `Wallet not connected`, type: 'error' })
      return
    }
    setLoadingStake(true)

    for (let step = 0; step < unstakedSelected.length; step++) {
      try {
        let token = unstakedSelected[step]
        if (!token || !token.tokenAccount) {
          throw new Error('Token account not set')
        }

        if (
          token.tokenAccount?.account.data.parsed.info.tokenAmount.amount > 1 &&
          !token.amountToStake
        ) {
          notify({ message: `Invalid amount chosen for token`, type: 'error' })
          return
        }

        if (token.stakeEntry && token.stakeEntry.parsed.amount.toNumber() > 0) {
          notify({
            message: `'Fungible tokens already staked in the pool. Staked tokens need to be unstaked and then restaked together with the new tokens.'`,
            type: 'error',
          })
          return
        }

        if (receiptType === ReceiptType.Receipt) {
          console.log('Creating stake entry and stake mint...')
          const [initTx, , stakeMintKeypair] =
            await createStakeEntryAndStakeMint(connection, wallet as Wallet, {
              stakePoolId: stakePool?.pubkey,
              originalMintId: new PublicKey(
                token.tokenAccount.account.data.parsed.info.mint
              ),
            })
          if (initTx.instructions.length > 0) {
            await executeTransaction(connection, wallet as Wallet, initTx, {
              signers: stakeMintKeypair ? [stakeMintKeypair] : [],
            })
          }
          console.log('Successfully created stake entry and stake mint')
        }

        console.log('Staking...')
        // stake
        const transaction = await stake(connection, wallet as Wallet, {
          stakePoolId: stakePool?.pubkey,
          receiptType: receiptType,
          originalMintId: new PublicKey(
            token.tokenAccount.account.data.parsed.info.mint
          ),
          userOriginalMintTokenAccountId: token.tokenAccount?.pubkey,
          amount: token?.amountToStake
            ? new BN(
                token?.amountToStake && token.tokenListData
                  ? getMintNaturalAmountFromDecimal(
                      token?.amountToStake,
                      token.tokenListData?.decimals
                    )
                  : 1
              )
            : undefined,
        })
        await executeTransaction(connection, wallet as Wallet, transaction, {})
        notify({
          message: `Successfully staked ${step + 1}/${unstakedSelected.length}`,
          type: 'success',
        })
        fetchLeaderboard && fetchLeaderboard()
        console.log('Successfully staked')
        userTokenAccounts
          .refreshTokenAccounts(true)
          .then(() => userTokenAccounts.refreshTokenAccounts())
        stakedTokenDatas.refresh(true).then(() => stakedTokenDatas.refresh())
        stakePoolEntries.refresh().then(() => stakePoolEntries.refresh())
      } catch (e) {
        notify({ message: `Transaction failed: ${e}`, type: 'error' })
        console.error(e)
        break
      }
    }
    setStakedSelected([])
    setUnstakedSelected([])
    setLoadingStake(false)
  }

  const isUnstakedTokenSelected = (tk: TokenData) =>
    unstakedSelected.some(
      (utk) =>
        utk.tokenAccount?.account.data.parsed.info.mint.toString() ===
        tk.tokenAccount?.account.data.parsed.info.mint.toString()
    )
  const isStakedTokenSelected = (tk: TokenData) =>
    stakedSelected.some(
      (stk) =>
        stk.stakeEntry?.parsed.originalMint.toString() ===
        tk.stakeEntry?.parsed.originalMint.toString()
    )

  const getStakedDaysAgo = (lastStakedAt: any) => {
    return Math.floor(
      (+new Date() - +new Date(lastStakedAt.toNumber() * 1000)) / 86400000
    )
  }
  const handleReleaseClick = () => {
    if (stakedSelected.length === 0) {
      notify({
        message: `No tokens selected`,
        type: 'error',
      })
    } else {
      setShowReleaseConfirm(true)
    }
  }
  return (
    <div className={`container mx-auto`}>
      <ReleaseConfirmModal
        show={showReleaseConfirm}
        handleConfirm={handleReleaseConfirm}
        onClose={() => setShowReleaseConfirm(false)}
      />

      <div className="my-2 mx-5 grid gap-10 lg:grid-cols-2">
        <div className={styles.wrapper}>
          <h3 className={styles.heading}>SELECT EGGS TO INCUBATE</h3>
          {showAllowedTokens && (
            <AllowedTokens stakePool={stakePool}></AllowedTokens>
          )}
          <div className={cn(styles.grid, 'custom-scrollbar')}>
            {!wallet.wallet && !wallet.connected && !wallet.connecting && (
              <p className="text-center text-2xl text-yellow-500">
                No connected wallet detected
              </p>
            )}
            {wallet.connected && !userTokenAccounts.loaded ? (
              <div className="align-center flex h-full w-full justify-center">
                <LoadingSpinner height="100px" />
              </div>
            ) : (showResultTokens() || []).length == 0 && wallet.connected ? (
              <p className="text-center text-2xl text-green-500">
                No allowed Genesis Eggs found in wallet.
              </p>
            ) : (
              (showResultTokens() || []).map((tk, i) => (
                <div
                  className={styles.gridItem}
                  key={tk.tokenAccount?.pubkey.toString()}
                >
                  <label>
                    <div
                      className={cn(styles.card, {
                        [styles.selected]: isUnstakedTokenSelected(tk),
                      })}
                    >
                      <BasicImage
                        className={styles.image}
                        src={
                          tk.metadata?.data.image || tk.tokenListData?.logoURI
                        }
                        fallbackSrc="honey/no-image-placeholder.svg"
                      />
                      <div className={styles.detail}>
                        <span className={styles.title}>EGG</span>
                        <span
                          title={tk.metadata?.data.name}
                          className={styles.title}
                        >
                          {tk.metadata?.data.name}
                        </span>
                      </div>
                    </div>
                    <input
                      disabled={loadingStake || loadingUnstake}
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
                      checked={isUnstakedTokenSelected(tk)}
                      onChange={(e) => {
                        const amount = Number(e.target.value)
                        if (
                          tk.tokenAccount?.account.data.parsed.info.tokenAmount
                            .amount > 1
                        ) {
                          if (e.target.value.length > 0 && !amount) {
                            notify({
                              message: 'Please enter a valid amount',
                              type: 'error',
                            })
                            setUnstakedSelected(
                              unstakedSelected.filter(
                                (data) =>
                                  data.tokenAccount?.account.data.parsed.info.mint.toString() !==
                                  tk.tokenAccount?.account.data.parsed.info.mint.toString()
                              )
                            )
                            return
                          }
                          tk.amountToStake = amount
                        }

                        if (isUnstakedTokenSelected(tk)) {
                          setUnstakedSelected(
                            unstakedSelected.filter(
                              (data) =>
                                data.tokenAccount?.account.data.parsed.info.mint.toString() !==
                                tk.tokenAccount?.account.data.parsed.info.mint.toString()
                            )
                          )
                        } else {
                          if (
                            tk.tokenAccount?.account.data.parsed.info
                              .tokenAmount.amount > 1
                          ) {
                            tk.amountToStake = amount
                          }
                          setUnstakedSelected([...unstakedSelected, tk])
                        }
                      }}
                    />
                  </label>
                </div>
              ))
            )}
          </div>
          <div className={styles.footer}>
            <button
              onClick={() => {
                if (unstakedSelected.length === 0) {
                  notify({
                    message: `No tokens selected`,
                    type: 'error',
                  })
                }
                handleStake()
              }}
              className={styles.button}
              disabled={loadingStake}
            >
              <span className="mr-1 inline-block">
                {loadingStake && <LoadingSpinner height="25px" />}
              </span>
              <span className="my-auto">Incubate</span>
            </button>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className="flex justify-around">
            <h3 className={styles.heading}>YOUR INCUBATED EGGS</h3>
            <h3 className={styles.heading}>
              Total Points:{' '}
              {totalPoints || totalPoints == 0 ? totalPoints : '...'}
            </h3>
          </div>
          {showAllowedTokens && (
            <AllowedTokens stakePool={stakePool}></AllowedTokens>
          )}
          <div className={cn(styles.grid, 'custom-scrollbar')}>
            {!stakedTokenDatas.loaded ? (
              <div className="align-center flex h-full w-full justify-center">
                <LoadingSpinner height="100px" />
              </div>
            ) : stakedTokenDatas.data?.length === 0 ? (
              <p className="text-center text-2xl text-green-500">
                No Genesis Eggs currently incubated.
              </p>
            ) : (
              stakedTokenDatas.data &&
              stakedTokenDatas.data.map((tk, i) => (
                <div
                  className={styles.gridItem}
                  key={tk.tokenAccount?.pubkey.toString()}
                >
                  <label>
                    <div
                      className={cn(styles.card, {
                        [styles.selected]: isStakedTokenSelected(tk),
                      })}
                    >
                      <BasicImage
                        className={styles.image}
                        src={
                          tk.metadata?.data.image || tk.tokenListData?.logoURI
                        }
                        fallbackSrc="honey/no-image-placeholder.svg"
                      />
                      <div className={styles.detail}>
                        <span
                          className={styles.title}
                          title={tk.metadata?.data.name}
                        >
                          {tk.metadata?.data.name}
                        </span>
                        <span
                          className={cn(styles.divider, {
                            [styles.dividerSelected]: isStakedTokenSelected(tk),
                          })}
                        ></span>
                        <span className={styles.timeAgo}>
                          <StopWatchIcon />
                          <span>
                            {getStakedDaysAgo(
                              tk.stakeEntry.parsed.lastStakedAt
                            )}{' '}
                            days
                          </span>
                        </span>
                      </div>
                    </div>
                    <input
                      disabled={loadingStake || loadingUnstake}
                      placeholder={
                        tk.stakeEntry!.parsed.amount.toNumber() > 1
                          ? Number(
                              getMintDecimalAmountFromNaturalV2(
                                tk.tokenListData!.decimals,
                                new BN(tk.stakeEntry!.parsed.amount.toNumber())
                              ).toFixed(2)
                            ).toString()
                          : ''
                      }
                      autoComplete="off"
                      type="checkbox"
                      className="hidden"
                      id={tk?.stakeEntry?.pubkey.toBase58()}
                      name={tk?.stakeEntry?.pubkey.toBase58()}
                      checked={isStakedTokenSelected(tk)}
                      onChange={() => {
                        if (isStakedTokenSelected(tk)) {
                          setStakedSelected(
                            stakedSelected.filter(
                              (data) =>
                                data.stakeEntry?.pubkey.toString() !==
                                tk.stakeEntry?.pubkey.toString()
                            )
                          )
                        } else {
                          setStakedSelected([...stakedSelected, tk])
                        }
                      }}
                    />
                  </label>
                </div>
              ))
            )}
          </div>
          <div className={styles.footer}>
            <button
              className={cn(styles.button, styles.button_red)}
              onClick={handleReleaseClick}
              disabled={loadingUnstake}
            >
              <span className="mr-1 inline-block">
                {loadingUnstake && <LoadingSpinner height="25px" />}
              </span>
              <span className="my-auto">release</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
Home.getLayout = function getLayout(page) {
  return <DefaultLayout className="bg-staking-pool">{page}</DefaultLayout>
}

export default Home
