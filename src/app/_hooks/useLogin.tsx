"use client";

import { usePrivy, useLogin as usePrivyLogin } from "@privy-io/react-auth";
import { useAction } from "convex/react";
import posthog from "posthog-js";
import { api } from "../../../convex/_generated/api";

export default function useLogin() {
  const setupUser = async () => {
    console.log("Dummy user setup");
    return { success: true };
  };
  const { logout } = usePrivy();

  const { login: privyLogin } = usePrivyLogin({
    onComplete: async ({
      isNewUser,
      loginMethod,
      loginAccount,
      wasAlreadyAuthenticated,
    }) => {
      console.log("------------------------------");
      console.log({
        isNewUser,
        loginMethod,
        loginAccount,
        wasAlreadyAuthenticated,
      });
      console.log("------------------------------");

      try {
        if (isNewUser)
          posthog.capture("sign-up", { loginMethod, loginAccount });
        else if (!wasAlreadyAuthenticated)
          posthog.capture("login", { loginMethod, ...loginAccount });

        if (!wasAlreadyAuthenticated) {
          const res = await setupUser();

          if (!res) {
            throw new Error("Failed to set up user");
          }
        }
      } catch (error) {
        console.error("Error setting up user:", error);
        void logout();
      }
    },

    onError: (error) => {
      console.error("Login error:", error);
      alert("Login error: ");
      posthog.capture("login-error", { error });
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
