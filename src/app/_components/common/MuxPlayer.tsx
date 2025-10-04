"use client";

import MuxPlayer from "@mux/mux-player-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface MuxPlayerProps {
  playbackId: string;
  streamId: string;
  title: string;
  className?: string;
  isMyStream: boolean;
  rtmpUrl: string;
  streamKey: string;
}

const MuxPlayerComponent = ({
  playbackId,
  streamId,
  title,
  className = "w-full h-full",
  isMyStream = false,
  rtmpUrl,
  streamKey,
}: MuxPlayerProps) => {
  const [showSetupPopup, setShowSetupPopup] = useState(isMyStream);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  return (
    <div className={className}>
      <MuxPlayer
        playbackId={playbackId}
        metadata={{
          video_title: title,
          video_id: streamId,
        }}
        autoPlay
        muted={false}
        className="w-full h-full rounded-lg"
        style={{
          aspectRatio: "16/9",
        }}
        onError={(e) => {
          console.error("Mux Player Error:", e);
        }}
      />

      {isMyStream && showSetupPopup && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border-2 border-black p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold text-black mb-4">
              Setup Stream with Studio Software
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Add RTMP & Stream Key into the software directly to start the
              stream. Keep the page open while setup.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-black mb-2">RTMP</label>
                <div className="flex items-center border border-black rounded bg-white">
                  <input
                    type="text"
                    disabled
                    value={rtmpUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border-none outline-none bg-transparent text-black"
                  />
                  <button
                    onClick={() => copyToClipboard(rtmpUrl, "RTMP URL")}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Image
                      src="/icons/copy.svg"
                      alt="copy"
                      width={16}
                      height={16}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-black mb-2">
                  STREAM KEY
                </label>
                <div className="flex items-center border border-black rounded bg-white">
                  <input
                    type="text"
                    disabled
                    value={streamKey}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border-none outline-none bg-transparent text-black"
                  />
                  <button
                    onClick={() => copyToClipboard(streamKey, "Stream Key")}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Image
                      src="/icons/copy.svg"
                      alt="copy"
                      width={16}
                      height={16}
                    />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSetupPopup(false)}
              className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuxPlayerComponent;
