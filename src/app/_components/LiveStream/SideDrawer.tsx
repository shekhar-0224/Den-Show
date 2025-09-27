"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import React from "react";
import { useMobile } from "~/app/_hooks/useMobile";
import Chat from "./Chat";
import CreatorTokenStats from "./CreatorTokenStats";
import SwapWidget from "./SwapWidget";

interface SideDrawerProps {
  isSideDrawerOpen: boolean;
  setIsSideDrawerOpen: (isSideDrawerOpen: boolean) => void;
  streamId: string;
  creatorTokenSymbol: string;
  creatorTokenAddress: string;
  type: "live" | "vod" | "clip";
}

const SideDrawer = ({
  isSideDrawerOpen,
  setIsSideDrawerOpen,
  streamId,
  creatorTokenSymbol,
  creatorTokenAddress,
  type,
}: SideDrawerProps) => {
  const toggleChat = () => {
    setIsSideDrawerOpen(!isSideDrawerOpen);
  };

  const { isMobile } = useMobile();

  return (
    <>
      <AnimatePresence>
        {isSideDrawerOpen && (
          <motion.div
            className="h-full flex flex-col"
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: isMobile ? "100%" : "25%",
              opacity: 1,
            }}
            exit={{
              width: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            style={{ overflow: "hidden" }}
          >
            {!isMobile && (
              <div className="flex items-center gap-2 bg-black pb-4">
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={toggleChat}
                >
                  <motion.div
                    animate={{
                      rotate: isSideDrawerOpen ? 0 : 180,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                    }}
                  >
                    <Image
                      src="/icons/arrow-right.svg"
                      alt="Toggle Chat"
                      width={18}
                      height={14}
                    />
                  </motion.div>
                </button>
              </div>
            )}
            <div className="flex flex-col-reverse md:flex-col gap-4 flex-1">
              <SwapWidget
                streamId={streamId}
                creatorTokenSymbol={creatorTokenSymbol}
                creatorTokenAddress={creatorTokenAddress}
              />
              {/* {type !== "clip" && isMobile && (
                <CreatorTokenStats tokenAddress={creatorTokenAddress} />
              )} */}
              {type === "live" && <Chat />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSideDrawerOpen && (
        <motion.div
          className="flex items-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button type="button" className="cursor-pointer" onClick={toggleChat}>
            <motion.div
              animate={{
                rotate: isSideDrawerOpen ? 0 : 180,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/icons/arrow-right.svg"
                alt="Toggle Chat"
                width={18}
                height={14}
              />
            </motion.div>
          </button>
        </motion.div>
      )}
    </>
  );
};

export default SideDrawer;
