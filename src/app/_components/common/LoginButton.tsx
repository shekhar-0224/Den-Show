"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "~/components/ui/button";

import useLogin from "~/app/_hooks/useLogin";

const LoginButton = () => {
  const { ready, logout: privyLogout } = usePrivy();

  const { login } = useLogin();

  if (!ready) return null;

  return <Button onClick={login}>Go Live</Button>;
};

export default LoginButton;
