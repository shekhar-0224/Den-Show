import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../../../convex/_generated/api";
import { Button } from "~/components/ui/button";

export const Logout = () => {
  const gg = useQuery(api.user.getCurrentUser);
  const { logout } = usePrivy();

  console.log({ gg });

  return (
    <Button
      onClick={logout}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
    >
      <Image
        src="/icons/logout.png"
        alt="Logout"
        width={19}
        height={19}
        className="text-gray-600"
      />
    </Button>
  );
};
