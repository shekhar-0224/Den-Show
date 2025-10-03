import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { Button } from "~/components/ui/button";

export const Logout = () => {
  const { logout } = usePrivy();

  return (
    <Button
      onClick={logout}
      variant="primary"
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
