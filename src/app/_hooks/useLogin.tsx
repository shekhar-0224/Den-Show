import { usePrivy, useLogin as usePrivyLogin } from "@privy-io/react-auth";
import { TRPCError } from "@trpc/server";
import { toast } from "sonner";
import { loginWithEmail, loginWithSocialAccount } from "../_actions";

export default function useLogin() {
  const { logout: privyLogout } = usePrivy();
  const { login: privyLogin } = usePrivyLogin({
    onComplete: ({ user, loginMethod }) => {
      if (loginMethod === "email" && user.email && user.wallet) {
        loginWithEmail({
          email: user.email.address,
          address: user.wallet.address,
        })
          .then(() => {
            toast.success("Logged in successfully!");
          })
          .catch((err) => {
            console.error(err);
            toast.error(
              err instanceof TRPCError ? err.message : "Something went wrong",
            );
            privyLogout();
          });
      } else if (
        loginMethod === "farcaster" &&
        user.farcaster?.fid &&
        user.farcaster.username &&
        user.wallet
      ) {
        loginWithSocialAccount({
          type: "farcaster",
          id: user.farcaster.fid.toString(),
          username: user.farcaster.username,
          address: user.wallet.address,
        })
          .then(() => {
            toast.success("Logged in successfully!");
          })
          .catch((err) => {
            console.error(err);
            toast.error(
              err instanceof TRPCError ? err.message : "Something went wrong",
            );
            privyLogout();
          });
      } else if (
        loginMethod === "twitter" &&
        user.twitter?.subject &&
        user.twitter.username &&
        user.wallet
      ) {
        loginWithSocialAccount({
          type: "twitter",
          id: user.twitter.subject,
          username: user.twitter.username,
          address: user.wallet.address,
        })
          .then(() => {
            toast.success("Logged in successfully!");
          })
          .catch((err) => {
            console.error(err);
            toast.error(
              err instanceof TRPCError ? err.message : "Something went wrong",
            );
            privyLogout();
          });
      }
    },
  });

  const login = () =>
    privyLogin({
      loginMethods: [
        "email",
        "farcaster",
        "twitter",
        // 'wallet'
      ],
    });

  return {
    login,
  };
}
