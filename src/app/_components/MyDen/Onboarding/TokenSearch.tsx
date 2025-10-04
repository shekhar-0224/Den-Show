"use client";

import { type GetTokensResponse, getTokens } from "@coinbase/onchainkit/api";
import type { Token } from "@coinbase/onchainkit/token";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { cn } from "~/lib/utils";

interface TokenSearchProps {
  onTokenSelect: (token: Token) => void;
}

const TokenSearch = ({ onTokenSelect }: TokenSearchProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [debouncedSearch] = useDebounceValue(search, 500);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["tokens", debouncedSearch],
    queryFn: () => getTokens({ search: debouncedSearch, limit: "10" }),
    enabled: debouncedSearch.length > 0,
  });

  const isTokenArray = (data: GetTokensResponse): data is Token[] => {
    return (
      Array.isArray(data) &&
      data.length > 0 &&
      !!data[0] &&
      "address" in data[0] &&
      "name" in data[0]
    );
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    onTokenSelect(token);
    setOpen(false);
    setSearch("");
  };

  const tokens =
    searchResults && isTokenArray(searchResults) ? searchResults : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <div className="flex relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full cursor-pointer md:max-w-[300px] h-10 px-3 bg-white border-2 border-border shadow-small rounded-md flex items-center justify-between text-sm "
      >
        {selectedToken ? (
          <span className="truncate">${selectedToken.symbol}</span>
        ) : (
          <span className="text-gray-500">Select token</span>
        )}
      </button>
      {open && (
        <div
          className="absolute top-full left-0 w-full mt-1 bg-white border-2 border-border rounded-md shadow-lg z-50"
          style={{ minWidth: "300px" }}
        >
          <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: "300px",
              overflowY: "scroll",
            }}
          >
            {isLoading ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Searching...
              </div>
            ) : search.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Start typing to search tokens...
              </div>
            ) : tokens.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                No tokens found.
              </div>
            ) : (
              <div className="p-1">
                {tokens.map((token) => (
                  <div
                    key={token.address}
                    onClick={() => handleTokenSelect(token)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded hover:bg-gray-100 transition-colors",
                      selectedToken?.address === token.address && "bg-blue-50"
                    )}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="font-semibold">
                        ${token.symbol} - {token.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {token.address}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSearch;
