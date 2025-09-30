import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const TestComp = () => {
  const gg = useQuery(api.user.getCurrentUser);

  console.log({ gg });

  return <div>TestComp</div>;
};
