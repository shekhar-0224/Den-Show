"use client";

import Hls from "hls.js";
import React, { useEffect, useRef, useState } from "react";

type EditorPlayerProps = {
  src: string;
  onSubmit?: (start: number, end: number) => void;
};

export default function EditorPlayer({ src, onSubmit }: EditorPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(0);

  // --- HLS setup ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
    }

    video.onloadedmetadata = () => {
      const d = video.duration || 0;
      setDuration(d);
      setClipEnd(d); // default: whole video
    };

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", updateTime);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [src]);

  // --- Utils ---
  const timeToPercent = (t: number) => (duration ? (t / duration) * 100 : 0);
  const percentToTime = (p: number) => (duration * p) / 100;

  // --- Dragging markers & playhead ---
  const handleDrag = (
    e: React.MouseEvent,
    type: "start" | "end" | "playhead",
  ) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = Math.min(
      Math.max((e.clientX - rect.left) / rect.width, 0),
      1,
    );
    const time = percentToTime(percent * 100);

    if (type === "start") setClipStart(Math.min(time, clipEnd - 1));
    if (type === "end") setClipEnd(Math.max(time, clipStart + 1));
    if (type === "playhead" && videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // --- Submit ---
  const handleSubmit = () => {
    onSubmit?.(clipStart, clipEnd);
    console.log("Selected:", clipStart, "→", clipEnd);
  };

  return (
    <div className="space-y-6">
      {/* Video */}
      {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
      <video
        ref={videoRef}
        controls
        className="w-full rounded-lg bg-black"
        playsInline
      />

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative h-12 bg-gray-200 rounded-md cursor-pointer"
        onClick={(e) => handleDrag(e, "playhead")}
      >
        {/* Highlighted clip range */}
        <div
          className="absolute top-0 h-full bg-blue-200"
          style={{
            left: `${timeToPercent(clipStart)}%`,
            width: `${timeToPercent(clipEnd) - timeToPercent(clipStart)}%`,
          }}
        />

        {/* Start marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-green-500 cursor-ew-resize"
          style={{ left: `${timeToPercent(clipStart)}%` }}
          onMouseDown={(e) => {
            e.preventDefault();
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const move = (ev: MouseEvent) => handleDrag(ev as any, "start");
            const up = () => {
              document.removeEventListener("mousemove", move);
              document.removeEventListener("mouseup", up);
            };
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
          }}
        />

        {/* End marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-red-500 cursor-ew-resize"
          style={{ left: `${timeToPercent(clipEnd)}%` }}
          onMouseDown={(e) => {
            e.preventDefault();
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const move = (ev: MouseEvent) => handleDrag(ev as any, "end");
            const up = () => {
              document.removeEventListener("mousemove", move);
              document.removeEventListener("mouseup", up);
            };
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
          }}
        />

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-black cursor-pointer"
          style={{ left: `${timeToPercent(currentTime)}%` }}
          onMouseDown={(e) => {
            e.preventDefault();
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const move = (ev: MouseEvent) => handleDrag(ev as any, "playhead");
            const up = () => {
              document.removeEventListener("mousemove", move);
              document.removeEventListener("mouseup", up);
            };
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
          }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-700">
        <span>Start: {clipStart.toFixed(1)}s</span>
        <span>End: {clipEnd.toFixed(1)}s</span>
        <span>Current: {currentTime.toFixed(1)}s</span>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        Save Clip
      </button>
    </div>
  );
}
