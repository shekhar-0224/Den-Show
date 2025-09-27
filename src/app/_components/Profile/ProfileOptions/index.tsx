"use client";

import Image from "next/image";
import React, { useState } from "react";
import { cn } from "~/lib/utils";
import Clips from "./Clips";
import Memberships from "./Memberships";
import Settings from "./Settings";

enum Tabs {
  FAN_PASSES = "fan_passes",
  CLIPS = "clips",
  TRANSACTIONS = "transactions",
  SETTINGS = "settings",
}

const ProfileOptions = () => {
  const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.FAN_PASSES);

  return (
    <div className="flex-1 flex flex-col w-full md:w-auto">
      <div className="hidden md:flex items-center justify-between rounded bg-black w-full p-2.5 gap-4">
        <button
          type="button"
          className={cn(
            "text-white underline cursor-pointer rounded p-2.5 font-cream-medium text-sm flex-1 flex items-center justify-center gap-2 group",
            selectedTab === Tabs.FAN_PASSES
              ? "bg-white text-black"
              : "hover:bg-white hover:text-black",
          )}
          onClick={() => setSelectedTab(Tabs.FAN_PASSES)}
        >
          <Image
            priority
            src="/icons/memberships.svg"
            alt="Fan Passes"
            width={17}
            height={17}
            className={cn(
              selectedTab === Tabs.FAN_PASSES
                ? "block"
                : "hidden group-hover:block",
            )}
          />
          <Image
            priority
            src="/icons/memberships_inverted.svg"
            alt="Fan Passes"
            width={17}
            height={17}
            className={cn(
              selectedTab === Tabs.FAN_PASSES
                ? "hidden"
                : "block group-hover:hidden",
            )}
          />
          Fan Passes
        </button>
        <button
          type="button"
          className={cn(
            "text-white underline cursor-pointer rounded p-2.5 font-cream-medium text-sm flex-1 flex items-center justify-center gap-2 group",
            selectedTab === Tabs.CLIPS
              ? "bg-white text-black"
              : "hover:bg-white hover:text-black",
          )}
          onClick={() => setSelectedTab(Tabs.CLIPS)}
        >
          <Image
            priority
            src="/icons/collected_videos.svg"
            alt="Clips"
            width={15}
            height={15}
            className={cn(
              selectedTab === Tabs.CLIPS ? "block" : "hidden group-hover:block",
            )}
          />
          <Image
            priority
            src="/icons/collected_videos_inverted.svg"
            alt="Collected Videos"
            width={15}
            height={15}
            className={cn(
              selectedTab === Tabs.CLIPS
                ? "hidden"
                : "block group-hover:hidden",
            )}
          />
          Clips
        </button>
        <button
          type="button"
          className={cn(
            "text-white underline cursor-pointer rounded p-2.5 font-cream-medium text-sm flex-1 flex items-center justify-center gap-2 group",
            selectedTab === Tabs.TRANSACTIONS
              ? "bg-white text-black"
              : "hover:bg-white hover:text-black",
          )}
          onClick={() => setSelectedTab(Tabs.TRANSACTIONS)}
        >
          <Image
            priority
            src="/icons/transactions.svg"
            alt="Transactions"
            width={17}
            height={17}
            className={cn(
              selectedTab === Tabs.TRANSACTIONS
                ? "block"
                : "hidden group-hover:block",
            )}
          />
          <Image
            priority
            src="/icons/transactions_inverted.svg"
            alt="Transactions"
            width={17}
            height={17}
            className={cn(
              selectedTab === Tabs.TRANSACTIONS
                ? "hidden"
                : "block group-hover:hidden",
            )}
          />
          Transactions
        </button>
        <button
          type="button"
          className={cn(
            "text-white underline cursor-pointer rounded p-2.5 font-cream-medium text-sm flex-1 flex items-center justify-center gap-2 group",
            selectedTab === Tabs.SETTINGS
              ? "bg-white text-black"
              : "hover:bg-white hover:text-black",
          )}
          onClick={() => setSelectedTab(Tabs.SETTINGS)}
        >
          <Image
            priority
            src="/icons/settings.svg"
            alt="Settings"
            width={17}
            height={17}
            className={cn(
              selectedTab === Tabs.SETTINGS
                ? "block"
                : "hidden group-hover:block",
            )}
          />
          <Image
            priority
            src="/icons/settings_inverted.svg"
            alt="Settings"
            width={17}
            height={17}
            className={cn(
              selectedTab === Tabs.SETTINGS
                ? "hidden"
                : "block group-hover:hidden",
            )}
          />
          Settings
        </button>
      </div>
      <div className="flex md:hidden border-b border-black overflow-x-scroll no-scrollbar items-center min-w-full p-2.5 pb-0 gap-4">
        <button
          type="button"
          className={cn(
            "uppercase text-black text-sm whitespace-nowrap pb-1",
            selectedTab === Tabs.FAN_PASSES
              ? "font-bold border-b-2 border-black"
              : "font-medium",
          )}
          onClick={() => setSelectedTab(Tabs.FAN_PASSES)}
        >
          Fan Passes
        </button>
        <button
          type="button"
          className={cn(
            "uppercase text-black text-sm whitespace-nowrap pb-1",
            selectedTab === Tabs.CLIPS
              ? "font-bold border-b-2 border-black"
              : "font-medium",
          )}
          onClick={() => setSelectedTab(Tabs.CLIPS)}
        >
          Clips
        </button>

        <button
          type="button"
          className={cn(
            "uppercase text-black text-sm whitespace-nowrap pb-1",
            selectedTab === Tabs.TRANSACTIONS
              ? "font-bold border-b-2 border-black"
              : "font-medium",
          )}
          onClick={() => setSelectedTab(Tabs.TRANSACTIONS)}
        >
          Transactions
        </button>
        <button
          type="button"
          className={cn(
            "uppercase text-black text-sm whitespace-nowrap pb-1",
            selectedTab === Tabs.SETTINGS
              ? "font-bold border-b-2 border-black"
              : "font-medium",
          )}
          onClick={() => setSelectedTab(Tabs.SETTINGS)}
        >
          Settings
        </button>
      </div>
      <div className="flex-1 overflow-y-scroll">
        {selectedTab === Tabs.FAN_PASSES && <Memberships />}
        {selectedTab === Tabs.CLIPS && <Clips />}
        {selectedTab === Tabs.TRANSACTIONS && (
          <div className="text-center text-sm font-medium mt-4">
            Transactions
          </div>
        )}
        {selectedTab === Tabs.SETTINGS && <Settings />}
      </div>
    </div>
  );
};

export default ProfileOptions;
