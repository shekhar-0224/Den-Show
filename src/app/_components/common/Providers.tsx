"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { PrivyProvider } from "@privy-io/react-auth";
import { createConfig } from "@privy-io/wagmi";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base } from "viem/chains";
import { http } from "wagmi";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <PrivyProvider
        appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
        config={{
          defaultChain: base,
          supportedChains: [base],
          embeddedWallets: {
            ethereum: {
              createOnLogin: "all-users",
            },
          },
        }}
      >
        <OnchainKitProvider
          apiKey={env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
        >
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>{children}</WagmiProvider>
          </QueryClientProvider>
        </OnchainKitProvider>
      </PrivyProvider>
    </TRPCReactProvider>
  );
}
