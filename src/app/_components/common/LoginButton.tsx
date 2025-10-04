"use client";

import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import useLogin from "~/app/_hooks/useLogin";
import { Button } from "~/components/ui/button";

const LoginButton = () => {
  const { ready } = usePrivy();

  const { login } = useLogin();

  if (!ready) return null;

  return (
    <Button onClick={login}>
      <Image
        src="/icons/create.svg"
        alt="Create"
        width={14}
        height={14}
        className="mr-0.5"
      />
      Login
    </Button>
  );
};

export default LoginButton;
