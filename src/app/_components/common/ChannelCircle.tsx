import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useMobile } from "~/app/_hooks/useMobile";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface ChannelCircleProps {
  handle: string;
  profileUrl: string | null;
  name: string;
  id: string;
}

const ChannelCircle = ({
  handle,
  profileUrl,
  name,
  id,
}: ChannelCircleProps) => {
  const arcId = `arc-${id}`;
  const router = useRouter();

  const { isMobile } = useMobile();

  return (
    <div
      key={id}
      onClick={() => router.push(`/${handle}`)}
      className={cn(
        "group relative rounded-full border border-black w-[90px] h-[90px] flex items-center justify-center overflow-hidden cursor-pointer",
        isMobile && "w-[60px] h-[60px]",
      )}
    >
      <motion.div
        whileHover={{ scale: 0.6 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 12,
          bounce: 0.1,
        }}
        className={cn("w-[88px] h-[88px]", isMobile && "w-[60px] h-[60px]")}
      >
        <Image
          src={profileUrl ?? "/images/default-channel-logo.png"}
          alt={name ?? ""}
          width={isMobile ? 61 : 122}
          height={isMobile ? 61 : 122}
          className="rounded-full"
        />
      </motion.div>
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 pointer-events-none bottom-20 invisible group-hover:visible"
      >
        <defs>
          <path id={arcId} d="M 10 64 A 40 40 0 0 0 110 64" />
        </defs>

        <text
          fontSize="12"
          className="fill-black tracking-wider font-cream-medium font-bold"
        >
          <textPath
            href={`#${arcId}`}
            startOffset="50%"
            textAnchor="middle"
            lengthAdjust="spacingAndGlyphs"
          >
            @{handle}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default ChannelCircle;

export const ChannelCircleSkeleton = () => {
  return (
    <div className="rounded-full border border-black w-[90px] h-[90px] flex items-center justify-center overflow-hidden cursor-pointer">
      <Skeleton className="w-[90px] h-[90px]" />
    </div>
  );
};
