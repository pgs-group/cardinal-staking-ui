import { useEffect } from 'react'
import {
  createStakeEntryAndStakeMint,
  stake,
  unstake,
  claimRewards,
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
import { pubKeyUrl, secondstoDuration } from 'common/utils'
import {
  formatMintNaturalAmountAsDecimal,
  getMintDecimalAmountFromNatural,
  getMintDecimalAmountFromNaturalV2,
  getMintNaturalAmountFromDecimal,
} from 'common/units'
import { BN } from '@project-serum/anchor'
import { useStakedTokenDatas } from 'hooks/useStakedTokenDatas'
import { useRewardDistributorData } from 'hooks/useRewardDistributorData'
import { useRewards } from 'hooks/useRewards'
import { useRewardMintInfo } from 'hooks/useRewardMintInfo'
import { AllowedTokens } from 'components/AllowedTokens'
import { useStakePoolEntries } from 'hooks/useStakePoolEntries'
import { useStakePoolData } from 'hooks/useStakePoolData'
import { useStakePoolMaxStaked } from 'hooks/useStakePoolMaxStaked'
import { useAllowedTokenDatas } from 'hooks/useAllowedTokenDatas'
import { useStakePoolMetadata } from 'hooks/useStakePoolMetadata'
import { shortPubKey } from '@cardinal/namespaces-components'
import { useRewardDistributorTokenAccount } from 'hooks/useRewardDistributorTokenAccount'
import { useRewardEntries } from 'hooks/useRewardEntries'
import DefaultLayout from 'components/Layouts/Default'
import styles from './StakePoolId.module.scss'
import StopWatchIcon from 'components/StopWatchIcon'
import { useLeaderboard } from 'providers/LeaderboardProvider'
import Item from 'antd/lib/list/Item'
import { compileString } from 'sass'
import BasicImage from 'common/BasicImage'

function Home() {
  const { connection, environment } = useEnvironmentCtx()
  const wallet = useWallet()
  const userTokenAccounts = useUserTokenData()
  const { data: stakePool, loaded: stakePoolLoaded } = useStakePoolData()
  const stakedTokenDatas = useStakedTokenDatas()
  const rewardDistibutorData = useRewardDistributorData()
  const rewardMintInfo = useRewardMintInfo()
  const stakePoolEntries = useStakePoolEntries()
  const maxStaked = useStakePoolMaxStaked()
  const rewardEntries = useRewardEntries()
  const rewards = useRewards()

  const [unstakedSelected, setUnstakedSelected] = useState<TokenData[]>([])
  const [stakedSelected, setStakedSelected] = useState<TokenData[]>([])
  const [loadingStake, setLoadingStake] = useState(false)
  const [loadingUnstake, setLoadingUnstake] = useState(false)
  const [receiptType, setReceiptType] = useState<ReceiptType>(
    ReceiptType.Original
  )
  const [loadingClaimRewards, setLoadingClaimRewards] = useState(false)
  const [showFungibleTokens, setShowFungibleTokens] = useState(false)
  const [showAllowedTokens, setShowAllowedTokens] = useState<boolean>()
  const [totalPoints, setTotalPoints] = useState('')
  const { data: filteredTokens } = useAllowedTokenDatas(showFungibleTokens)
  const { data: stakePoolMetadata } = useStakePoolMetadata()
  const rewardDistributorTokenAccountData = useRewardDistributorTokenAccount()
  const { leaderboard } = useLeaderboard()

  useEffect(() => {
    if (Array.isArray(leaderboard)) {
      leaderboard.find((item) => {
        if (item.wallet == wallet?.publicKey?.toString()) {
          setTotalPoints(item.score)
        }
      })
    }
  }, [leaderboard])
  async function handleClaimRewards() {
    if (stakedSelected.length > 4) {
      notify({ message: `Limit of 4 tokens at a time reached`, type: 'error' })
      return
    }
    setLoadingClaimRewards(true)
    if (!wallet) {
      throw new Error('Wallet not connected')
    }
    if (!stakePool) {
      notify({ message: `No stake pool detected`, type: 'error' })
      return
    }

    for (let step = 0; step < stakedSelected.length; step++) {
      try {
        let token = stakedSelected[step]
        if (!token || !token.stakeEntry) {
          throw new Error('No stake entry for token')
        }
        console.log('Claiming rewards...')

        const transaction = await claimRewards(connection, wallet as Wallet, {
          stakePoolId: stakePool.pubkey,
          stakeEntryId: token.stakeEntry.pubkey,
        })
        await executeTransaction(connection, wallet as Wallet, transaction, {})
        notify({ message: `Successfully claimed rewards`, type: 'success' })
        console.log('Successfully claimed rewards')
      } catch (e) {
        notify({ message: `Transaction failed: ${e}`, type: 'error' })
        console.error(e)
      } finally {
        break
      }
    }

    rewardDistibutorData.refresh()
    rewardDistributorTokenAccountData.refresh()
    setLoadingClaimRewards(false)
  }

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
  return (
    <div className={`container mx-auto`}>
      {(maxStaked || rewardDistibutorData.data) && (
        <div
          className="mx-5 mb-4 flex flex-col items-center gap-4 rounded-md bg-white bg-opacity-5 p-10 text-gray-200 md:max-h-[100px] md:flex-row md:justify-between"
          style={{
            border: stakePoolMetadata?.colors?.accent
              ? `2px solid ${stakePoolMetadata?.colors?.accent}`
              : '',
          }}
        >
          {stakePoolEntries.data ? (
            <>
              <div className="inline-block text-lg">
                Total Staked: {stakePoolEntries.data?.length}
              </div>
              {maxStaked > 0 && (
                <div className="inline-block text-lg">
                  {/*TODO: Change how many total NFTs can possibly be staked for your collection (default 10000) */}
                  Percent Staked:{' '}
                  {stakePoolEntries.data?.length &&
                    Math.floor(
                      ((stakePoolEntries.data?.length * 100) / maxStaked) *
                        10000
                    ) / 10000}
                  %
                </div>
              )}
            </>
          ) : (
            <div className="relative flex h-8 w-full items-center justify-center">
              <span className="text-gray-500">Loading pool info...</span>
              <div className="absolute w-full animate-pulse items-center justify-center rounded-lg bg-white bg-opacity-10 p-5"></div>
            </div>
          )}
          {rewardDistibutorData.data && rewardMintInfo.data ? (
            <>
              <div className="inline-block text-lg">
                <span>Rewards Rate</span>:{' '}
                <span>
                  {(
                    (Number(
                      getMintDecimalAmountFromNatural(
                        rewardMintInfo.data.mintInfo,
                        new BN(rewardDistibutorData.data.parsed.rewardAmount)
                      )
                    ) /
                      rewardDistibutorData.data.parsed.rewardDurationSeconds.toNumber()) *
                    86400
                  ).toPrecision(4)}{' '}
                  <a
                    className="text-white underline"
                    target="_blank"
                    href={pubKeyUrl(
                      rewardDistibutorData.data.parsed.rewardMint,
                      environment.label
                    )}
                  >
                    {rewardMintInfo.data.tokenListData?.name}
                  </a>{' '}
                  / Day
                </span>
              </div>
              <div className="flex min-w-[200px] flex-col text-lg">
                {!rewardMintInfo || !rewards.data ? (
                  <div className="relative flex h-8 w-full items-center justify-center">
                    <span className="text-gray-500"></span>
                    <div className="absolute w-full animate-pulse items-center justify-center rounded-lg bg-white bg-opacity-10 p-5"></div>
                  </div>
                ) : (
                  <>
                    <div>
                      Earnings:{' '}
                      {formatMintNaturalAmountAsDecimal(
                        rewardMintInfo.data.mintInfo,
                        rewards.data.claimableRewards,
                        6
                      )}{' '}
                      {rewardMintInfo.data.tokenListData?.name ?? '???'}
                    </div>
                    <div className="text-xs text-gray-500">
                      <a
                        target={'_blank'}
                        href={pubKeyUrl(
                          rewardDistibutorData.data.pubkey,
                          environment.label
                        )}
                      >
                        {shortPubKey(rewardDistibutorData.data.pubkey)}
                      </a>{' '}
                      {rewardDistributorTokenAccountData.data
                        ? formatMintNaturalAmountAsDecimal(
                            rewardMintInfo.data.mintInfo,
                            rewardDistributorTokenAccountData.data.amount,
                            6
                          )
                        : ''}{' '}
                      Left
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="relative flex w-full items-center justify-center">
              <span className="text-gray-500">Loading rewards...</span>
              <div className="absolute w-full animate-pulse items-center justify-center rounded-lg bg-white bg-opacity-10 p-5"></div>
            </div>
          )}
        </div>
      )}
      <div className="my-2 mx-5 grid gap-10 lg:grid-cols-2">
        <div className={styles.wrapper}>
          <h3 className={styles.heading}>SELECT EGGS TO INCUBATE</h3>
          {showAllowedTokens && (
            <AllowedTokens stakePool={stakePool}></AllowedTokens>
          )}
          <div
            className={cn(styles.grid, 'custom-scrollbar', {
              'grid grid-cols-2 grid-rows-3 gap-1 md:grid-cols-2 md:gap-4 lg:grid-cols-3':
                userTokenAccounts.loaded &&
                filteredTokens &&
                filteredTokens.length != 0,
            })}
          >
            {!wallet.wallet && !wallet.connected && !wallet.connecting && (
              <p className="text-center text-2xl text-yellow-500">
                No connected wallet detected
              </p>
            )}
            {wallet.connected && !userTokenAccounts.loaded ? (
              <div className="align-center flex h-full w-full justify-center">
                <LoadingSpinner height="100px" />
              </div>
            ) : (filteredTokens || []).length == 0 && wallet.connected ? (
              <p className="text-center text-2xl text-green-500">
                No allowed tokens found in wallet.
              </p>
            ) : (
              (filteredTokens || []).map((tk, i) => (
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
                        fallbackSrc="https://bitsofco.de/content/images/2018/12/broken-1.png"
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
              Total Points: {totalPoints || '...'}
            </h3>
          </div>
          {showAllowedTokens && (
            <AllowedTokens stakePool={stakePool}></AllowedTokens>
          )}
          <div
            className={cn(styles.grid, 'custom-scrollbar', {
              'grid grid-cols-2 grid-rows-3 gap-1 md:grid-cols-2 md:gap-4 lg:grid-cols-3':
                stakedTokenDatas.loaded &&
                stakedTokenDatas.data &&
                stakedTokenDatas.data.length != 0,
            })}
          >
            {!stakedTokenDatas.loaded ? (
              <div className="align-center flex h-full w-full justify-center">
                <LoadingSpinner height="100px" />
              </div>
            ) : stakedTokenDatas.data?.length === 0 ? (
              <p className="text-center text-2xl text-green-500">
                No tokens currently staked.
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
                        fallbackSrc="https://bitsofco.de/content/images/2018/12/broken-1.png"
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
                            )}
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
              onClick={() => {
                if (stakedSelected.length === 0) {
                  notify({
                    message: `No tokens selected`,
                    type: 'error',
                  })
                }
                handleUnstake()
              }}
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
