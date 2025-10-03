"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { createConfig, WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useCallback, useMemo } from "react";
import { base } from "viem/chains";
import { http } from "wagmi";
import { env } from "~/env";

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

const useAuthFromPrivy = () => {
  const { ready, authenticated, getAccessToken } = usePrivy();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken: _ }: { forceRefreshToken: boolean }) => {
      return await getAccessToken();
    },

    [getAccessToken]
  );

  return useMemo(
    () => ({
      isLoading: !ready,
      isAuthenticated: authenticated,
      fetchAccessToken,
    }),
    [ready, authenticated, fetchAccessToken]
  );
};

const queryClient = new QueryClient();
const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
      clientId="client-WY6PdM9NtdPknzqvsTpgXDSTyrqs3XgyyHRxZhuMH5URR"
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
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromPrivy}>
        <OnchainKitProvider
          apiKey={env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
        >
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>{children}</WagmiProvider>
          </QueryClientProvider>
        </OnchainKitProvider>
      </ConvexProviderWithAuth>
    </PrivyProvider>
  );
}
