import Image from "next/image";
import { toast } from "sonner";

interface ChannelDetailsProps {
  channel: {
    name: string;
    profileUrl: string | null;
    handle: string;
    bio: string | null;
    id: string;
    _creationTime: number;
    creatorTokenSymbol: string;
    creatorTokenAddress: string;
  };
  isLive?: boolean;
  streamTitle?: string;
}

const ChannelDetails = ({ channel, isLive = false, streamTitle }: ChannelDetailsProps) => {
  return (
    <div className="mt-4 flex items-center justify-between">
      {/* Left side - CC icon with LIVE badge and stream info */}
      <div className="flex items-center gap-4">
        {/* Channel Profile Picture with LIVE badge */}
        <div className="relative">
          {channel.profileUrl ? (
            <Image
              src={channel.profileUrl}
              alt={channel.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">CC</span>
            </div>
          )}
          {/* LIVE badge - only show when streamer is live */}
          {isLive && (
            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              LIVE
            </div>
          )}
        </div>

        {/* Stream title and channel info */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-serif">
              {streamTitle || "Arcathlon #6 full run (10 NES games back-to-back for fun)"}
            </h2>
            <Image
              src="/icons/arrow-right.svg"
              alt="Share"
              width={16}
              height={16}
              className="text-white"
            />
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <span className="text-white text-sm underline decoration-dotted font-cream-regular">
              @{channel.handle}
            </span>
            <div className="w-px h-4 bg-white border-dashed border-l"></div>
            <div className="flex items-center gap-1">
              <span className="text-white text-sm font-instrument-sans">Fans</span>
              <span className="text-white text-sm font-cream-medium">121</span>
            </div>
            <div className="w-px h-4 bg-white border-dashed border-l"></div>
            <div className="flex items-center gap-2">
              <div 
                className="text-black px-3 py-1 rounded text-sm font-instrument-sans font-semibold"
                style={{ backgroundColor: '#B3D4DC' }}
              >
                {channel.name}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://den.show/${channel.handle}`);
                  toast.success("Channel link copied to clipboard");
                }}
                className="w-4 h-4 flex items-center justify-center"
              >
                <Image
                  src="/icons/copy.svg"
                  alt="Copy Channel Link"
                  width={12}
                  height={12}
                  className="text-white"
                />
              </button>
            </div>
            <div className="w-px h-4 bg-white border-dashed border-l"></div>
            <div className="flex items-center gap-1">
              <span className="text-white text-sm font-instrument-sans">Mcap</span>
              <span className="text-white text-sm font-cream-medium">$13.7M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 border border-white text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors">
          <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">$</span>
          </div>
          Tip
        </button>
        
        <button className="flex items-center gap-2 border border-white text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors">
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-orange-500 text-lg">🔥</span>
          </div>
          Boost
        </button>
        
        <button className="flex items-center gap-2 border border-white text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors">
          <Image
            src="/icons/scissors.svg"
            alt="Clip"
            width={16}
            height={16}
            className="text-white"
          />
          Clip
        </button>
      </div>
    </div>
  );
};

export default ChannelDetails;
