'use client'
import { ReactNode, useMemo } from 'react'
import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit'
import {
  trustWallet,
  ledgerWallet,
  coin98Wallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

import { useTheme } from './ui.provider'
import walletConfig from '@/configs/wallet.config'
import { testnet } from '@/configs/rpc'

// Register your own project id here: https://cloud.walletconnect.com/app
const projectId = walletConfig.walletConnectId

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [testnet],
  [publicProvider()],
)

const connectors = connectorsForWallets([
  {
    groupName: 'Recommends',
    wallets: [
      metaMaskWallet({ projectId, chains }),
      coin98Wallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
  {
    groupName: 'Others',
    wallets: [
      trustWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
    ],
  },
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

/**
 * Provider
 */

export default function WalletProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme()

  const themeConfig = useMemo(
    () => (theme === 'light' ? lightTheme() : darkTheme()),
    [theme],
  )

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={themeConfig}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
