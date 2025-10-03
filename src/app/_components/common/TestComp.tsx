import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "convex/react";
import { Button } from "~/components/ui/button";
import { api } from "../../../../convex/_generated/api";

export const Logout = () => {
  const gg = useQuery(api.user.getCurrentUser);
  const { logout } = usePrivy();

  console.log({ gg });

  return (
    <Button
      onClick={logout}
      variant="neutral"
      size="sm"
      className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-600"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16,17 21,12 16,7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </Button>
  );
};
