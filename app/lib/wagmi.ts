import { http, createConfig } from 'wagmi'
import { walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { base } from 'viem/chains'

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  connectors: [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_ID!,
    }),
    coinbaseWallet({
      appName: "Monjeria",
      jsonRpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
    }),
  ],
})
