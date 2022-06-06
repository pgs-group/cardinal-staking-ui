import StopWatchIcon from 'honeyland/components/StopWatchIcon'
import { getStakedDaysAgo } from 'honeyland/utils'
import { useLeaderboard } from 'honeyland/providers/LeaderboardProvider'
import {
  createStakeEntryAndStakeMint,
  stake,
  unstake,
  claimRewards,
} from '@cardinal/staking'
import { ReceiptType } from '@cardinal/staking/dist/cjs/programs/stakePool'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Signer, Transaction } from '@solana/web3.js'
// #honeyland: import header from honeyland
import { Header } from 'honeyland/common/Header'
import Head from 'next/head'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { useState, useEffect } from 'react'
import { Wallet } from '@metaplex/js'
import { LoadingSpinner } from 'common/LoadingSpinner'
import { notify } from 'common/Notification'
import { pubKeyUrl, secondstoDuration } from 'common/utils'
import {
  formatAmountAsDecimal,
  formatMintNaturalAmountAsDecimal,
  getMintDecimalAmountFromNatural,
  getMintDecimalAmountFromNaturalV2,
  parseMintNaturalAmountFromDecimal,
} from 'common/units'
import { BN } from '@project-serum/anchor'
import {
  StakeEntryTokenData,
  useStakedTokenDatas,
} from 'hooks/useStakedTokenDatas'
import { useRewardDistributorData } from 'hooks/useRewardDistributorData'
import { useRewards } from 'hooks/useRewards'
import { useRewardMintInfo } from 'hooks/useRewardMintInfo'
import { AllowedTokens } from 'components/AllowedTokens'
import { useStakePoolEntries } from 'hooks/useStakePoolEntries'
import { useStakePoolData } from 'hooks/useStakePoolData'
import { useStakePoolMaxStaked } from 'hooks/useStakePoolMaxStaked'
import {
  AllowedTokenData,
  useAllowedTokenDatas,
} from 'hooks/useAllowedTokenDatas'
import { useStakePoolMetadata } from 'hooks/useStakePoolMetadata'
import { defaultSecondaryColor } from 'api/mapping'
import { Footer } from 'common/Footer'
import { DisplayAddress, shortPubKey } from '@cardinal/namespaces-components'
import { useRewardDistributorTokenAccount } from 'hooks/useRewardDistributorTokenAccount'
import { useRewardEntries } from 'hooks/useRewardEntries'
import { Switch } from '@headlessui/react'
import { FaInfoCircle } from 'react-icons/fa'
import { MouseoverTooltip } from 'common/Tooltip'
import { useUTCNow } from 'providers/UTCNowProvider'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { executeAllTransactions } from 'api/utils'
import { RewardDistributorKind } from '@cardinal/staking/dist/cjs/programs/rewardDistributor'
import { useRouter } from 'next/router'

function Home() {
  const router = useRouter()
  const { connection, environment } = useEnvironmentCtx()
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const { data: stakePool, isFetched: stakePoolLoaded } = useStakePoolData()
  const stakedTokenDatas = useStakedTokenDatas()
  const rewardDistributorData = useRewardDistributorData()
  const rewardMintInfo = useRewardMintInfo()
  const stakePoolEntries = useStakePoolEntries()
  const maxStaked = useStakePoolMaxStaked()
  const rewardEntries = useRewardEntries()
  const rewards = useRewards()

  const [unstakedSelected, setUnstakedSelected] = useState<AllowedTokenData[]>(
    []
  )
  const [stakedSelected, setStakedSelected] = useState<StakeEntryTokenData[]>(
    []
  )
  const [loadingStake, setLoadingStake] = useState(false)
  const [loadingUnstake, setLoadingUnstake] = useState(false)
  const [receiptType, setReceiptType] = useState<ReceiptType>(
    ReceiptType.Original
  )
  const [loadingClaimRewards, setLoadingClaimRewards] = useState(false)
  const [showFungibleTokens, setShowFungibleTokens] = useState(false)
  const [showAllowedTokens, setShowAllowedTokens] = useState<boolean>()
  const allowedTokenDatas = useAllowedTokenDatas(showFungibleTokens)
  const { data: stakePoolMetadata } = useStakePoolMetadata()
  const rewardDistributorTokenAccountData = useRewardDistributorTokenAccount()
  const { UTCNow } = useUTCNow()

  const [totalPoints, setTotalPoints] = useState(null)
  const { leaderboard, fetchLeaderboard } = useLeaderboard()

  if (stakePoolMetadata?.redirect) {
    router.push(stakePoolMetadata?.redirect)
    return
  }

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

    const txs: (Transaction | null)[] = await Promise.all(
      stakedSelected.map(async (token) => {
        try {
          if (!token || !token.stakeEntry) {
            throw new Error('No stake entry for token')
          }
          return claimRewards(connection, wallet as Wallet, {
            stakePoolId: stakePool.pubkey,
            stakeEntryId: token.stakeEntry.pubkey,
          })
        } catch (e) {
          notify({
            message: `${e}`,
            description: `Failed to claim rewards for token ${token?.stakeEntry?.pubkey.toString()}`,
            type: 'error',
          })
          return null
        }
      })
    )

    try {
      await executeAllTransactions(
        connection,
        wallet as Wallet,
        txs.filter((tx): tx is Transaction => tx !== null),
        {
          notificationConfig: {
            message: 'Successfully claimed rewards',
            description: 'These rewards are now available in your wallet',
          },
        }
      )
    } catch (e) {}

    rewardDistributorData.remove()
    rewardDistributorTokenAccountData.remove()
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

    const txs: (Transaction | null)[] = await Promise.all(
      stakedSelected.map(async (token) => {
        try {
          if (!token || !token.stakeEntry) {
            throw new Error('No stake entry for token')
          }
          if (
            stakePool.parsed.cooldownSeconds &&
            !token.stakeEntry?.parsed.cooldownStartSeconds
          ) {
            notify({
              message: `Cooldown period will be initiated for ${token.metaplexData?.data.data.name}`,
              type: 'info',
            })
          }
          return unstake(connection, wallet as Wallet, {
            stakePoolId: stakePool?.pubkey,
            originalMintId: token.stakeEntry.parsed.originalMint,
          })
        } catch (e) {
          notify({
            message: `${e}`,
            description: `Failed to unstake token ${token?.stakeEntry?.pubkey.toString()}`,
            type: 'error',
          })
          return null
        }
      })
    )

    try {
      await executeAllTransactions(
        connection,
        wallet as Wallet,
        txs.filter((tx): tx is Transaction => tx !== null),
        {
          notificationConfig: {
            message: 'Successfully unstaked',
            description: 'These tokens are now available in your wallet',
          },
        }
      )
    } catch (e) {}

    await Promise.all([
      stakedTokenDatas.remove(),
      allowedTokenDatas.remove(),
      stakePoolEntries.remove(),
    ]).then(() =>
      setTimeout(() => {
        stakedTokenDatas.refetch()
        allowedTokenDatas.refetch()
        stakePoolEntries.refetch()
      }, 2000)
    )
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

    const initTxs: { tx: Transaction; signers: Signer[] }[] = []
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
          throw new Error('Invalid amount chosen for token')
        }

        if (token.stakeEntry && token.stakeEntry.parsed.amount.toNumber() > 0) {
          throw new Error(
            'Fungible tokens already staked in the pool. Staked tokens need to be unstaked and then restaked together with the new tokens.'
          )
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
            initTxs.push({
              tx: initTx,
              signers: stakeMintKeypair ? [stakeMintKeypair] : [],
            })
          }
        }
      } catch (e) {
        notify({
          message: `Failed to unstake token ${unstakedSelected[
            step
          ]?.stakeEntry?.pubkey.toString()}`,
          description: `${e}`,
          type: 'error',
        })
      }
    }

    if (initTxs.length > 0) {
      try {
        await executeAllTransactions(
          connection,
          wallet as Wallet,
          initTxs.map(({ tx }) => tx),
          {
            signers: initTxs.map(({ signers }) => signers),
            notificationConfig: {
              message: `Successfully staked`,
              description: 'Stake progress will now dynamically update',
            },
          }
        )
      } catch (e) {}
    }

    const txs: (Transaction | null)[] = await Promise.all(
      unstakedSelected.map(async (token) => {
        try {
          if (!token || !token.tokenAccount) {
            throw new Error('Token account not set')
          }

          if (
            token.tokenAccount?.account.data.parsed.info.tokenAmount.amount >
              1 &&
            !token.amountToStake
          ) {
            throw new Error('Invalid amount chosen for token')
          }

          if (
            token.stakeEntry &&
            token.stakeEntry.parsed.amount.toNumber() > 0
          ) {
            throw new Error(
              'Fungible tokens already staked in the pool. Staked tokens need to be unstaked and then restaked together with the new tokens.'
            )
          }

          const amount = token?.amountToStake
            ? new BN(
                token?.amountToStake && token.tokenListData
                  ? parseMintNaturalAmountFromDecimal(
                      token?.amountToStake,
                      token.tokenListData.decimals
                    ).toString()
                  : 1
              )
            : undefined
          // stake
          return stake(connection, wallet as Wallet, {
            stakePoolId: stakePool?.pubkey,
            receiptType:
              !amount || (amount && amount.eq(new BN(1)))
                ? receiptType
                : undefined,
            originalMintId: new PublicKey(
              token.tokenAccount.account.data.parsed.info.mint
            ),
            userOriginalMintTokenAccountId: token.tokenAccount?.pubkey,
            amount: amount,
          })
        } catch (e) {
          notify({
            message: `Failed to unstake token ${token?.stakeEntry?.pubkey.toString()}`,
            description: `${e}`,
            type: 'error',
          })
          return null
        }
      })
    )

    try {
      await executeAllTransactions(
        connection,
        wallet as Wallet,
        txs.filter((tx): tx is Transaction => tx !== null),
        {
          notificationConfig: {
            message: `Successfully staked`,
            description: 'Stake progress will now dynamically update',
          },
        }
      )
    } catch (e) {}

    await Promise.all([
      stakedTokenDatas.remove(),
      allowedTokenDatas.remove(),
      stakePoolEntries.remove(),
    ]).then(() =>
      setTimeout(() => {
        stakedTokenDatas.refetch()
        allowedTokenDatas.refetch()
        stakePoolEntries.refetch()
      }, 2000)
    )
    setStakedSelected([])
    setUnstakedSelected([])
    setLoadingStake(false)
  }

  const isUnstakedTokenSelected = (tk: AllowedTokenData) =>
    unstakedSelected.some(
      (utk) =>
        utk.tokenAccount?.account.data.parsed.info.mint.toString() ===
        tk.tokenAccount?.account.data.parsed.info.mint.toString()
    )
  const isStakedTokenSelected = (tk: StakeEntryTokenData) =>
    stakedSelected.some(
      (stk) =>
        stk.stakeEntry?.parsed.originalMint.toString() ===
        tk.stakeEntry?.parsed.originalMint.toString()
    )
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
  return (
    <div>
      {/* #honeyland: remove main div styles  */}
      <Head>
        <title>Cardinal Staking UI</title>
        <meta name="description" content="Generated by Cardinal Staking UI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <div className={`container mx-auto w-full`}>
        {(!stakePool && stakePoolLoaded) || stakePoolMetadata?.notFound ? (
          <div className="mx-5 mb-5 rounded-md border-[1px] border-yellow-500 bg-yellow-500 bg-opacity-40 p-4 text-center text-lg font-semibold">
            Stake pool not found
          </div>
        ) : (
          !wallet.connected && (
            <div
              className="mx-5 mb-5 cursor-pointer rounded-md border-[1px] border-yellow-500 bg-yellow-500 bg-opacity-40 p-4 text-center text-lg font-semibold"
              onClick={() => walletModal.setVisible(true)}
            >
              Connect wallet to continue
            </div>
          )
        )}
        {/* #honeyland remove reward section */}
        <div className="my-2 mx-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            className={`flex-col rounded-md p-3 text-gray-200`}
            style={{
              border: stakePoolMetadata?.colors?.accent
                ? `2px solid ${stakePoolMetadata?.colors?.accent}`
                : '',
            }}
          >
            {/* #honeyland remove pool header */}

            {showAllowedTokens && (
              <AllowedTokens stakePool={stakePool}></AllowedTokens>
            )}
            <div className="honey-pool my-3 flex-auto overflow-auto">
              <div className="relative my-auto mb-4 h-[60vh] overflow-x-hidden overflow-y-hidden rounded-md bg-white bg-opacity-5 p-5">
                <h4 className="honey-pool__heading">SELECT EGGS TO INCUBATE</h4>
                {!allowedTokenDatas.isFetched ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="h-[200px] animate-pulse rounded-lg bg-white bg-opacity-5 p-10"></div>
                    <div className="h-[200px] animate-pulse rounded-lg bg-white bg-opacity-5 p-10"></div>
                    <div className="h-[200px] animate-pulse rounded-lg bg-white bg-opacity-5 p-10"></div>
                  </div>
                ) : (allowedTokenDatas.data || []).length == 0 ? (
                  <p className="text-gray-400">
                    No allowed tokens found in wallet.
                  </p>
                ) : (
                  <div
                    className={
                      'honey-pool__grid grid grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-3'
                    }
                  >
                    {(
                      (!stakePoolMetadata?.notFound &&
                        allowedTokenDatas.data) ||
                      []
                    ).map((tk) => (
                      <div key={tk.tokenAccount?.pubkey.toString()}>
                        <div
                          className={`honey-card ${
                            isUnstakedTokenSelected(tk) ? 'selected' : ''
                          } relative w-44 md:w-auto 2xl:w-48`}
                        >
                          <label
                            htmlFor={tk?.tokenAccount?.pubkey.toBase58()}
                            className="honey-card__inner relative"
                          >
                            <div className="relative">
                              <div>
                                <div className="relative">
                                  {loadingStake && isUnstakedTokenSelected(tk) && (
                                    <div>
                                      <div className="absolute top-0 left-0 z-10 flex h-full w-full justify-center rounded-xl bg-black bg-opacity-80  align-middle">
                                        <div className="my-auto flex">
                                          <span className="mr-2">
                                            <LoadingSpinner height="25px" />
                                          </span>
                                          Staking token...
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <img
                                    className="mx-auto mt-4 mb-2 rounded-xl bg-white bg-opacity-5 object-contain md:h-40 md:w-40 2xl:h-48 2xl:w-48"
                                    src={
                                      tk.metadata?.data.image ||
                                      tk.tokenListData?.logoURI
                                    }
                                    alt={
                                      tk.metadata?.data.name ||
                                      tk.tokenListData?.name
                                    }
                                  />
                                </div>
                                {tk.tokenListData && (
                                  <div className="absolute bottom-2 left-2">
                                    {Number(
                                      (
                                        tk.tokenAccount?.account.data.parsed
                                          .info.tokenAmount.amount /
                                        10 ** tk.tokenListData.decimals
                                      ).toFixed(2)
                                    )}{' '}
                                    {tk.tokenListData.symbol}
                                  </div>
                                )}
                              </div>

                              <input
                                disabled={loadingStake || loadingUnstake}
                                placeholder={
                                  tk.tokenAccount?.account.data.parsed.info
                                    .tokenAmount.amount > 1
                                    ? '1'
                                    : ''
                                }
                                autoComplete="off"
                                type={
                                  tk.tokenAccount?.account.data.parsed.info
                                    .tokenAmount.amount > 1
                                    ? 'text'
                                    : 'checkbox'
                                }
                                className={`absolute h-4 ${
                                  tk.tokenAccount?.account.data.parsed.info
                                    .tokenAmount.amount > 1
                                    ? `w-20 py-3 px-2 text-right`
                                    : 'w-4'
                                } top-2 right-2 rounded-sm font-medium text-black focus:outline-none`}
                                id={tk?.tokenAccount?.pubkey.toBase58()}
                                name={tk?.tokenAccount?.pubkey.toBase58()}
                                checked={isUnstakedTokenSelected(tk)}
                                value={
                                  isUnstakedTokenSelected(tk)
                                    ? tk.amountToStake || 0
                                    : 0
                                }
                                onChange={(e) => {
                                  const amount = Number(e.target.value)
                                  if (
                                    tk.tokenAccount?.account.data.parsed.info
                                      .tokenAmount.amount > 1
                                  ) {
                                    let newUnstakedSelected =
                                      unstakedSelected.filter(
                                        (data) =>
                                          data.tokenAccount?.account.data.parsed.info.mint.toString() !==
                                          tk.tokenAccount?.account.data.parsed.info.mint.toString()
                                      )
                                    if (
                                      !amount &&
                                      e.target.value.length != 0 &&
                                      amount !== 0
                                    ) {
                                      notify({
                                        message: 'Please enter a valid amount',
                                        type: 'error',
                                      })
                                    } else {
                                      tk.amountToStake =
                                        e.target.value.toString()
                                      newUnstakedSelected = [
                                        ...newUnstakedSelected,
                                        tk,
                                      ]
                                    }
                                    setUnstakedSelected(newUnstakedSelected)
                                  } else {
                                    if (isUnstakedTokenSelected(tk)) {
                                      setUnstakedSelected(
                                        unstakedSelected.filter(
                                          (data) =>
                                            data.tokenAccount?.account.data.parsed.info.mint.toString() !==
                                            tk.tokenAccount?.account.data.parsed.info.mint.toString()
                                        )
                                      )
                                    } else {
                                      setUnstakedSelected([
                                        ...unstakedSelected,
                                        tk,
                                      ])
                                    }
                                  }
                                }}
                              />
                            </div>
                            <h4
                              className="honey-card__title"
                              title={tk.metadata?.data.name}
                            >
                              {tk.metadata?.data.name}
                            </h4>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                style={{
                  background:
                    stakePoolMetadata?.colors?.secondary ||
                    defaultSecondaryColor,
                  color: stakePoolMetadata?.colors?.fontColor,
                }}
                className="honey-pool__button my-auto flex rounded-md px-4 py-2 hover:scale-[1.03]"
              >
                <span className="mr-1 inline-block">
                  {loadingStake && <LoadingSpinner height="25px" />}
                </span>
                <span className="my-auto">INCUBATE</span>
              </button>
            </div>
            {/* #honeyland remove pool footer */}
          </div>
          <div
            className="rounded-md bg-opacity-5 p-3 text-gray-200"
            style={{
              border: stakePoolMetadata?.colors?.accent
                ? `2px solid ${stakePoolMetadata?.colors?.accent}`
                : '',
            }}
          >
            {/* #honeyland remove pool header */}

            <div className="honey-pool honey-pool--release my-3 flex-auto overflow-auto">
              <div className="relative my-auto mb-4 h-[60vh] overflow-x-hidden overflow-y-hidden rounded-md bg-white bg-opacity-5 p-5">
                <h4 className="honey-pool__heading">
                  YOUR INCUBATED EGGS &nbsp; &nbsp; &nbsp; Total Points :{' '}
                  {totalPoints || totalPoints == 0 ? totalPoints : '...'}{' '}
                </h4>
                {!stakedTokenDatas.isFetched ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="h-[200px] animate-pulse rounded-lg bg-white bg-opacity-5 p-10"></div>
                    <div className="h-[200px] animate-pulse rounded-lg bg-white bg-opacity-5 p-10"></div>
                    <div className="h-[200px] animate-pulse rounded-lg bg-white bg-opacity-5 p-10"></div>
                  </div>
                ) : stakedTokenDatas.data?.length === 0 ? (
                  <p className="text-gray-400">No tokens currently staked.</p>
                ) : (
                  <div
                    className={
                      'honey-pool__grid grid grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-3'
                    }
                  >
                    {!stakePoolMetadata?.notFound &&
                      stakedTokenDatas.data &&
                      stakedTokenDatas.data.map((tk) => (
                        <div key={tk?.stakeEntry?.pubkey.toBase58()}>
                          <div
                            className={`honey-card ${
                              isStakedTokenSelected(tk) ? 'selected' : ''
                            } relative w-44 md:w-auto 2xl:w-48`}
                          >
                            <label
                              htmlFor={tk?.stakeEntry?.pubkey.toBase58()}
                              className="honey-card__inner relative"
                            >
                              <div className="relative">
                                <div>
                                  <div className="relative">
                                    {(loadingUnstake || loadingClaimRewards) &&
                                      isStakedTokenSelected(tk) && (
                                        <div>
                                          <div className="absolute top-0 left-0 z-10 flex h-full w-full justify-center rounded-lg bg-black bg-opacity-80  align-middle">
                                            <div className="mx-auto flex items-center justify-center">
                                              <span className="mr-2">
                                                <LoadingSpinner height="25px" />
                                              </span>
                                              {loadingUnstake
                                                ? 'Unstaking token...'
                                                : 'Claim rewards...'}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    {tk.stakeEntry?.parsed.lastStaker.toString() !==
                                      wallet.publicKey?.toString() && (
                                      <div>
                                        <div className="absolute top-0 left-0 z-10 flex h-full w-full justify-center rounded-lg bg-black bg-opacity-80  align-middle">
                                          <div className="mx-auto flex flex-col items-center justify-center">
                                            <div>Owned by</div>
                                            <DisplayAddress
                                              dark
                                              connection={connection}
                                              address={
                                                tk.stakeEntry?.parsed.lastStaker
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <img
                                      className="mx-auto mt-4 mb-2 rounded-xl bg-white bg-opacity-5 object-contain md:h-40 md:w-40 2xl:h-48 2xl:w-48"
                                      src={
                                        tk.metadata?.data.image ||
                                        tk.tokenListData?.logoURI
                                      }
                                      alt={
                                        tk.metadata?.data.name ||
                                        tk.tokenListData?.name
                                      }
                                    />
                                  </div>
                                  {tk.tokenListData && (
                                    <div className="absolute bottom-2 left-2">
                                      {Number(
                                        getMintDecimalAmountFromNaturalV2(
                                          tk.tokenListData!.decimals,
                                          new BN(
                                            tk.stakeEntry!.parsed.amount.toNumber()
                                          )
                                        ).toFixed(2)
                                      )}{' '}
                                      {tk.tokenListData.symbol}
                                    </div>
                                  )}
                                </div>

                                <input
                                  disabled={loadingStake || loadingUnstake}
                                  placeholder={
                                    tk.stakeEntry!.parsed.amount.toNumber() > 1
                                      ? Number(
                                          getMintDecimalAmountFromNaturalV2(
                                            tk.tokenListData!.decimals,
                                            new BN(
                                              tk.stakeEntry!.parsed.amount.toNumber()
                                            )
                                          ).toFixed(2)
                                        ).toString()
                                      : ''
                                  }
                                  autoComplete="off"
                                  type="checkbox"
                                  className={`absolute top-2 right-2 h-4 w-4 rounded-sm font-medium text-black focus:outline-none`}
                                  id={tk?.stakeEntry?.pubkey.toBase58()}
                                  name={tk?.stakeEntry?.pubkey.toBase58()}
                                  checked={isStakedTokenSelected(tk)}
                                  onChange={() => {
                                    if (
                                      tk.stakeEntry?.parsed.lastStaker.toString() !==
                                      wallet.publicKey?.toString()
                                    ) {
                                      return
                                    }
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
                                {tk.stakeEntry?.pubkey &&
                                  rewardEntries.data &&
                                  rewardEntries.data.find((entry) =>
                                    entry.parsed.stakeEntry.equals(
                                      tk.stakeEntry?.pubkey!
                                    )
                                  )?.parsed.multiplier &&
                                  !rewardEntries.data
                                    .find((entry) =>
                                      entry.parsed.stakeEntry.equals(
                                        tk.stakeEntry?.pubkey!
                                      )
                                    )
                                    ?.parsed.multiplier.eq(new BN(0)) &&
                                  !rewardEntries.data
                                    .find((entry) =>
                                      entry.parsed.stakeEntry.equals(
                                        tk.stakeEntry?.pubkey!
                                      )
                                    )
                                    ?.parsed.multiplier.eq(new BN(1)) && (
                                    <div
                                      className="absolute top-1 left-1 flex items-center justify-center rounded-full bg-[#9945ff] px-1 py-1 text-[8px]"
                                      style={{
                                        color:
                                          stakePoolMetadata?.colors?.secondary,
                                        background:
                                          stakePoolMetadata?.colors?.primary,
                                      }}
                                    >
                                      {rewardDistributorData.data?.parsed
                                        .multiplierDecimals !== undefined &&
                                        formatAmountAsDecimal(
                                          rewardDistributorData.data?.parsed
                                            .multiplierDecimals,
                                          rewardEntries.data.find((entry) =>
                                            entry.parsed.stakeEntry.equals(
                                              tk.stakeEntry?.pubkey!
                                            )
                                          )?.parsed.multiplier!,
                                          rewardDistributorData.data.parsed
                                            .multiplierDecimals
                                        ).toString()}
                                      x
                                    </div>
                                  )}
                              </div>
                              {rewards.data &&
                                rewards.data.rewardMap[
                                  tk.stakeEntry?.pubkey.toString() || ''
                                ] &&
                                rewardDistributorData.data?.parsed.rewardDurationSeconds.gte(
                                  new BN(60)
                                ) && (
                                  <div className="mt-1 flex items-center justify-center text-xs">
                                    {secondstoDuration(
                                      rewards.data.rewardMap[
                                        tk.stakeEntry?.pubkey.toString() || ''
                                      ]?.nextRewardsIn.toNumber() || 0
                                    )}{' '}
                                  </div>
                                )}
                              {tk.stakeEntry?.parsed.cooldownStartSeconds &&
                              stakePool?.parsed.cooldownSeconds ? (
                                <div
                                  className="mt-1 flex items-center justify-center text-xs"
                                  style={{
                                    color: 'white',
                                    background:
                                      stakePoolMetadata?.colors?.primary,
                                  }}
                                >
                                  {tk.stakeEntry?.parsed.cooldownStartSeconds.toNumber() +
                                    stakePool.parsed.cooldownSeconds -
                                    UTCNow >
                                  0
                                    ? 'Cooldown: ' +
                                      secondstoDuration(
                                        tk.stakeEntry?.parsed.cooldownStartSeconds.toNumber() +
                                          stakePool.parsed.cooldownSeconds -
                                          UTCNow
                                      )
                                    : 'Cooldown finished!'}
                                </div>
                              ) : (
                                ''
                              )}
                              {stakePool?.parsed.minStakeSeconds &&
                              tk.stakeEntry?.parsed.lastStakedAt ? (
                                <div
                                  className="mt-1 flex items-center justify-center text-xs"
                                  style={{
                                    color: 'white',
                                    background:
                                      stakePoolMetadata?.colors?.primary,
                                  }}
                                >
                                  {tk.stakeEntry?.parsed.lastStakedAt.toNumber() +
                                    stakePool.parsed.minStakeSeconds -
                                    UTCNow >
                                  0
                                    ? 'Able to unstake in: ' +
                                      secondstoDuration(
                                        tk.stakeEntry?.parsed.lastStakedAt.toNumber() +
                                          stakePool.parsed.minStakeSeconds -
                                          UTCNow
                                      )
                                    : 'Min Staked Time Satisfied!'}
                                </div>
                              ) : (
                                ''
                              )}
                              <h4 className="honey-card__detail">
                                <span title={tk.metadata?.data.name}>
                                  {tk.metadata?.data.name}
                                </span>
                                <span
                                  className={`${
                                    isStakedTokenSelected(tk) ? 'selected' : ''
                                  }`}
                                ></span>
                                <span>
                                  <StopWatchIcon />
                                  <span>
                                    27
                                    {getStakedDaysAgo(
                                      tk.stakeEntry.parsed.lastStakedAt
                                    )}{' '}
                                    days
                                  </span>
                                </span>
                              </h4>
                            </label>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (stakedSelected.length === 0) {
                    notify({
                      message: `No tokens selected`,
                      type: 'error',
                    })
                  }
                  handleUnstake()
                }}
                style={{
                  background:
                    stakePoolMetadata?.colors?.secondary ||
                    defaultSecondaryColor,
                  color: stakePoolMetadata?.colors?.fontColor,
                }}
                className="honey-pool__button my-auto flex rounded-md px-4 py-2 hover:scale-[1.03]"
              >
                <span className="mr-1 inline-block">
                  {loadingUnstake ? <LoadingSpinner height="25px" /> : ''}
                </span>
                <span className="my-auto">Release</span>
              </button>
            </div>
            {/* #honeyland remove pool footer */}
          </div>
        </div>
      </div>
      {/* #honeyland: remove footer  */}
    </div>
  )
}

export default Home
