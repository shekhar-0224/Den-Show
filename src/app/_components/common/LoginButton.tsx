"use client";

import { usePrivy } from "@privy-io/react-auth";
import useLogin from "~/app/_hooks/useLogin";
import { Button } from "~/components/ui/button";

const LoginButton = () => {
  const { ready } = usePrivy();

  const { login } = useLogin();

  if (!ready) return null;

  return <Button onClick={login}>Go Live</Button>;
};

export default LoginButton;
