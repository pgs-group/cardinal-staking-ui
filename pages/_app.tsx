import './styles.css'

// #honeyland: import styles
import './../honeyland/styles/index.scss'

import 'antd/dist/antd.dark.css'
import '@cardinal/namespaces-components/dist/esm/styles.css'
import type { AppProps } from 'next/app'
import { WalletProvider } from '@solana/wallet-adapter-react'
import { getWalletAdapters } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  EnvironmentProvider,
  getInitialProps,
} from 'providers/EnvironmentProvider'
import { WalletIdentityProvider } from '@cardinal/namespaces-components'
import { UTCNowProvider } from 'providers/UTCNowProvider'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

// #honeyland: import leaderboard provider
import { LeaderboardProvider } from 'honeyland/providers/LeaderboardProvider'

require('@solana/wallet-adapter-react-ui/styles.css')

export const queryClient = new QueryClient()

export const DEBUG = false

const App = ({
  Component,
  pageProps,
  cluster,
}: AppProps & { cluster: string }) => (
  <EnvironmentProvider defaultCluster={cluster}>
    <UTCNowProvider>
      <WalletProvider autoConnect wallets={getWalletAdapters()}>
        <WalletIdentityProvider>
          <WalletModalProvider>
            <QueryClientProvider client={queryClient}>
              { /* #honeyland: use leaderboard provider */ }
              <LeaderboardProvider>
                <>
                  <Component {...pageProps} />
                  {DEBUG && <ReactQueryDevtools initialIsOpen={false} />}
                </>
              </LeaderboardProvider>
            </QueryClientProvider>
          </WalletModalProvider>
        </WalletIdentityProvider>
      </WalletProvider>
    </UTCNowProvider>
  </EnvironmentProvider>
)

App.getInitialProps = getInitialProps

export default App
