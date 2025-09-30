"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "convex/react";
import useLogin from "~/app/_hooks/useLogin";
import { Button } from "~/components/ui/button";
import { api } from "../../../../convex/_generated/api";

const LoginButton = () => {
  const { ready } = usePrivy();

  const { login } = useLogin();

  const gUg = useQuery(api.user.getCurrentUser);

  console.log({ gUg });

  if (!ready) return null;

  return <Button onClick={login}>Go Live</Button>;
};

export default LoginButton;
