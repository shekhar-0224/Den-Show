"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { Card } from "~/components/ui/card";
// import { api } from "~/trpc/react";

const GlobalSearch = () => {
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const [debouncedSearch] = useDebounceValue(search, 500);

  // Dummy data for search results
  const searchResults = debouncedSearch.length > 0 ? [
    {
      id: "search1",
      name: "TechGuru",
      handle: "techguru",
      profileUrl: "/images/default-channel-logo.png"
    },
    {
      id: "search2", 
      name: "ChefMaster",
      handle: "chefmaster",
      profileUrl: "/images/default-channel-logo.png"
    }
  ] : [];
  const isPending = false;
  const isLoading = false;

  //clear search on route change
  useEffect(() => {
    setSearch("");
  }, [pathname]);

  return (
    <div className="hidden md:flex items-center gap-2 border-2 border-border rounded-md px-3 py-2 relative">
      <input
        className="w-[307px] outline-none text-sm"
        type="text"
        placeholder="Search here"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Image src="/icons/search.svg" alt="Search" width={20} height={20} />
      {search.length > 0 && (
        <Card className="bg-white absolute top-10 left-0 w-full rounded-md p-2 max-h-40 overflow-y-auto z-10">
          {isPending || isLoading ? (
            <div className="text-sm p-2">Searching...</div>
          ) : searchResults && searchResults.length > 0 ? (
            searchResults.map((channel) => (
              <Link href={`/${channel.handle}`} key={channel.id}>
                <div
                  className="w-full hover:bg-primary cursor-pointer flex items-center justify-between gap-2 p-1 rounded-md hover:border-black border-2 border-transparent"
                  key={channel.id}
                >
                  <Image
                    src={
                      channel.profileUrl ?? "/images/default-channel-logo.png"
                    }
                    alt={channel.name}
                    width={40}
                    height={40}
                  />
                  <div className="flex-1 flex flex-col">
                    <div className="font-cream-medium text-sm">
                      {channel.name}
                    </div>
                    <div>@{channel.handle}</div>
                  </div>
                  {/* <div className="text-sm">{channel.creatorTokenSymbol}</div> */}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-sm p-2">No results found</div>
          )}
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;
