"use client";

import Hls from "hls.js";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  showSpinner?: boolean;
  absStart?: number;
  absEnd?: number;
};

export default function HlsPlayer({
  src,
  autoPlay = true,
  muted = true,
  controls = false,
  className,
  showSpinner = true,
  absStart,
  absEnd,
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [buffering, setBuffering] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    setBuffering(true);

    video.muted = muted;
    video.playsInline = true;

    let hls: Hls | null = null;
    let canceled = false;

    const tryPlay = () => {
      if (!autoPlay) return;
      video.play().catch(() => {
        console.log("autoplay rejected");
      });
    };

    const onLoadedData = () => !canceled && setBuffering(false);
    const onCanPlay = () => !canceled && setBuffering(false);
    const onPlaying = () => !canceled && setBuffering(false);

    const onWaiting = () => !canceled && setBuffering(true);
    const onStalled = () => !canceled && setBuffering(true);
    const onSeeking = () => !canceled && setBuffering(true);

    const enforceRange = () => {
      if (!absStart || !absEnd) return;

      if (video.currentTime < absStart) {
        video.currentTime = absStart;
      }
      if (video.currentTime >= absEnd) {
        video.currentTime = absStart;
        video.play(); // optional: auto-loop
      }
    };

    video.addEventListener("timeupdate", enforceRange);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("seeking", onSeeking);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      tryPlay();
      return () => {
        canceled = true;
        video.removeEventListener("timeupdate", enforceRange);
        video.removeEventListener("loadeddata", onLoadedData);
        video.removeEventListener("canplay", onCanPlay);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("waiting", onWaiting);
        video.removeEventListener("stalled", onStalled);
        video.removeEventListener("seeking", onSeeking);
        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 0,
      });
      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (!canceled) hls?.loadSource(src);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!canceled) tryPlay();
      });

      hls.on(Hls.Events.FRAG_LOADING, () => {
        if (!canceled) setBuffering(true);
      });
      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        if (!canceled && video.readyState >= 2) setBuffering(false);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Seek to clip start after metadata is ready
        if (absStart) video.currentTime = absStart;
      });
    }

    return () => {
      canceled = true;
      video.removeEventListener("timeupdate", enforceRange);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("seeking", onSeeking);
      if (hls) {
        hls.destroy();
        hls = null;
      }
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, autoPlay, muted, absStart, absEnd]);

  return (
    <div className={`relative w-full h-full ${className ?? ""}`}>
      <video
        ref={ref}
        controls={controls}
        muted={muted}
        playsInline
        preload="metadata"
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          borderRadius: 12,
          objectFit: "cover",
        }}
      />
      {showSpinner && buffering && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
