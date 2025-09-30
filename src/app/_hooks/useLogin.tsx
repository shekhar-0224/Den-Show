import { usePrivy, useLogin as usePrivyLogin } from "@privy-io/react-auth";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function useLogin() {
  const setupUser = useAction(api.user.setupUser);
  const { logout } = usePrivy();

  const { login: privyLogin } = usePrivyLogin({
    onComplete: async () => {
      try {
        const res = await setupUser();

        console.log({ res });

        if (!res) {
          throw new Error("Failed to set up user");
        }
      } catch (error) {
        console.error("Error setting up user:", error);
        void logout();
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
