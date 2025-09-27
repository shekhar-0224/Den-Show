import { useWallets } from "@privy-io/react-auth";

export default function useAddress() {
  const { wallets } = useWallets();

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy",
  );

  return { address: embeddedWallet?.address };
}
