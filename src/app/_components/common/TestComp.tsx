import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const TestComp = () => {
  const gg = useQuery(api.user.getCurrentUser);
  const { logout } = usePrivy();

  console.log({ gg });

  return <div onClick={logout}>TestComp</div>;
};
