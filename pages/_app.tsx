import '../styles/globals.scss'
import 'antd/dist/antd.dark.css'
import type { AppProps } from 'next/app'
import { WalletProvider } from '@solana/wallet-adapter-react'
import { getWalletAdapters } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  EnvironmentProvider,
  getInitialProps,
} from 'providers/EnvironmentProvider'
import { WalletIdentityProvider } from '@cardinal/namespaces-components'
import { TokenAccountsProvider } from 'providers/TokenDataProvider'
import { StakedTokenDataProvider } from 'providers/StakedTokenDataProvider'
import { TokenListProvider } from 'providers/TokenListProvider'
import { UTCNowProvider } from 'providers/UTCNowProvider'
import { LeaderboardProvider } from 'providers/LeaderboardProvider'

require('@solana/wallet-adapter-react-ui/styles.css')

const App = ({
  Component,
  pageProps,
  cluster,
}: AppProps & { cluster: string }) => {
  const getLayout = Component.getLayout || ((page) => page)
  return (
    <UTCNowProvider>
      <EnvironmentProvider defaultCluster={cluster}>
        <WalletProvider wallets={getWalletAdapters()} autoConnect>
          <WalletIdentityProvider>
            <WalletModalProvider>
              <TokenListProvider>
                <TokenAccountsProvider>
                  <StakedTokenDataProvider>
                    <LeaderboardProvider>
                      {getLayout(<Component {...pageProps} />)}
                    </LeaderboardProvider>
                  </StakedTokenDataProvider>
                </TokenAccountsProvider>
              </TokenListProvider>
            </WalletModalProvider>
          </WalletIdentityProvider>
        </WalletProvider>
      </EnvironmentProvider>
    </UTCNowProvider>
  )
}

App.getInitialProps = getInitialProps

export default App
