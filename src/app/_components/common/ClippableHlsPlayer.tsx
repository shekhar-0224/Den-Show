"use client";

import Hls from "hls.js";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "~/components/ui/button";

type Props = {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  showSpinner?: boolean;
  showTrimmer?: boolean;
  maxDuration?: number; // Maximum duration for selection in seconds
  onTrimSubmit?: (
    startTime: number,
    endTime: number,
    windowStartPosition: number, // Updated signature
    windowEndPosition: number, // Updated signature
  ) => void;
  streamId?: string; // Stream ID for API calls
};

export default function ClippableHlsPlayer({
  src,
  autoPlay = true,
  muted = true,
  controls = false,
  className,
  showSpinner = true,
  showTrimmer = false,
  maxDuration = 300, // Default 5 minutes
  onTrimSubmit,
  streamId,
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const trimmerRef = useRef<HTMLDivElement | null>(null);
  const [buffering, setBuffering] = useState(true);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(60); // Default 1 minute selection
  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track the stream position when the trimmer window was established (when clip button was clicked)
  const [clipButtonClickTime, setClipButtonClickTime] = useState<number | null>(
    null,
  );
  const [windowStartPosition, setWindowStartPosition] = useState(0);
  const [windowEndPosition, setWindowEndPosition] = useState(maxDuration);

  // Track if we need to seek to the clip window after video loads
  const [needsInitialSeek, setNeedsInitialSeek] = useState(false);
  const [targetSeekTime, setTargetSeekTime] = useState<number | null>(null);

  // Initialize the clipping window when trimmer is first shown
  useEffect(() => {
    if (showTrimmer && clipButtonClickTime === null) {
      // For a live stream, we want to capture the "current live position"
      // Since HLS.js auto-seeks to live edge, we'll use a reasonable estimate
      // and then adjust when the video actually loads
      const estimatedCurrentTime = maxDuration; // Assume we're at least maxDuration into the stream
      setClipButtonClickTime(estimatedCurrentTime);

      // Set window to show the last maxDuration seconds up to current time
      const windowStart = Math.max(0, estimatedCurrentTime - maxDuration);
      const windowEnd = estimatedCurrentTime;

      setWindowStartPosition(windowStart);
      setWindowEndPosition(windowEnd);

      // Set default selection to the last minute of the window
      const defaultDuration = 60; // 1 minute
      setStartTime(Math.max(0, maxDuration - defaultDuration));
      setEndTime(maxDuration);

      // Mark that we need to seek once the video is ready
      const targetTime =
        windowStart + Math.max(0, maxDuration - defaultDuration);
      setTargetSeekTime(targetTime);
      setNeedsInitialSeek(true);

      console.log("Initialized clipping window:", {
        estimatedCurrentTime,
        windowStart,
        windowEnd,
        targetSeekTime: targetTime,
      });
    }
  }, [showTrimmer, clipButtonClickTime, maxDuration]);

  // Handle seeking to the correct position after video loads
  useEffect(() => {
    const video = ref.current;
    if (video && needsInitialSeek && targetSeekTime !== null && !buffering) {
      // Wait a bit for the video to be fully ready
      const seekTimer = setTimeout(() => {
        if (video.readyState >= 2) {
          // HAVE_CURRENT_DATA or better
          console.log("Seeking to target time:", targetSeekTime);
          video.currentTime = targetSeekTime;
          setNeedsInitialSeek(false);
          setTargetSeekTime(null);

          // Update the actual clip button click time based on where we ended up
          const actualCurrentTime =
            video.seekable.length > 0
              ? video.seekable.end(video.seekable.length - 1)
              : targetSeekTime;

          setClipButtonClickTime(actualCurrentTime);

          // Recalculate window positions based on actual position
          const windowStart = Math.max(0, actualCurrentTime - maxDuration);
          setWindowStartPosition(windowStart);
          setWindowEndPosition(actualCurrentTime);

          console.log("Updated with actual times:", {
            actualCurrentTime,
            windowStart,
            windowEnd: actualCurrentTime,
          });
        }
      }, 500); // Give it a moment to load

      return () => clearTimeout(seekTimer);
    }
  }, [needsInitialSeek, targetSeekTime, buffering, maxDuration]);

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

    const onLoadedData = () => {
      if (!canceled) {
        setBuffering(false);
        // If this is for trimming and we need to seek to live position
        if (showTrimmer && needsInitialSeek) {
          // For HLS streams, try to get the actual live position
          const seekableEnd =
            video.seekable.length > 0
              ? video.seekable.end(video.seekable.length - 1)
              : null;

          if (seekableEnd) {
            console.log("Video loaded, seekable end:", seekableEnd);
            const actualCurrentTime = seekableEnd;

            // Update our clip window based on the actual live position
            const windowStart = Math.max(0, actualCurrentTime - maxDuration);
            setWindowStartPosition(windowStart);
            setWindowEndPosition(actualCurrentTime);
            setClipButtonClickTime(actualCurrentTime);

            // Seek to the start of our default selection
            const defaultDuration = 60;
            const seekTime =
              windowStart + Math.max(0, maxDuration - defaultDuration);
            video.currentTime = seekTime;

            setNeedsInitialSeek(false);
            setTargetSeekTime(null);

            console.log("Updated with live position:", {
              actualCurrentTime,
              windowStart,
              seekTime,
            });
          }
        }
      }
    };
    const onCanPlay = () => !canceled && setBuffering(false);
    const onPlaying = () => !canceled && setBuffering(false);

    const onTimeUpdate = () => {
      if (!canceled) {
        const currentVideoTime = video.currentTime;
        setCurrentTime(currentVideoTime);

        // If we're in trimming mode and playing, enforce the selected range
        if (showTrimmer && clipButtonClickTime !== null && !video.paused) {
          const absoluteStartTime = windowStartPosition + startTime;
          const absoluteEndTime = windowStartPosition + endTime;

          // If we reach the end of selection, loop back to start
          if (currentVideoTime >= absoluteEndTime) {
            video.currentTime = absoluteStartTime;
          }

          // If somehow we're before the start, seek to start
          if (currentVideoTime < absoluteStartTime) {
            video.currentTime = absoluteStartTime;
          }
        }
      }
    };

    const onPlay = () => !canceled && setIsPlaying(true);
    const onPause = () => !canceled && setIsPlaying(false);

    const onWaiting = () => !canceled && setBuffering(true);
    const onStalled = () => !canceled && setBuffering(true);
    const onSeeking = () => !canceled && setBuffering(true);

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      tryPlay();
      return () => {
        canceled = true;
        video.removeEventListener("loadeddata", onLoadedData);
        video.removeEventListener("canplay", onCanPlay);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("waiting", onWaiting);
        video.removeEventListener("stalled", onStalled);
        video.removeEventListener("seeking", onSeeking);
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.removeEventListener("play", onPlay);
        video.removeEventListener("pause", onPause);
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
        if (!canceled) {
          // Don't auto-play immediately if we're in trimming mode
          // We need to seek first
          if (!showTrimmer || !needsInitialSeek) {
            tryPlay();
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOADING, () => {
        if (!canceled) setBuffering(true);
      });
      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        if (!canceled && video.readyState >= 2) {
          setBuffering(false);

          // If we're in trimming mode and haven't sought yet, do it now
          if (showTrimmer && needsInitialSeek && video.seekable.length > 0) {
            const seekableEnd = video.seekable.end(video.seekable.length - 1);
            console.log("Fragment buffered, seekable end:", seekableEnd);

            const actualCurrentTime = seekableEnd;
            const windowStart = Math.max(0, actualCurrentTime - maxDuration);

            setWindowStartPosition(windowStart);
            setWindowEndPosition(actualCurrentTime);
            setClipButtonClickTime(actualCurrentTime);

            // Seek to our target position
            const defaultDuration = 60;
            const seekTime =
              windowStart + Math.max(0, maxDuration - defaultDuration);
            video.currentTime = seekTime;

            setNeedsInitialSeek(false);
            setTargetSeekTime(null);

            // Now we can play
            if (autoPlay) {
              video.play().catch(console.log);
            }
          }
        }
      });
    }

    return () => {
      canceled = true;
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      if (hls) {
        hls.destroy();
        hls = null;
      }
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [
    src,
    autoPlay,
    muted,
    showTrimmer,
    startTime,
    endTime,
    clipButtonClickTime,
    windowStartPosition,
  ]);

  // Effect to seek video when start time changes
  useEffect(() => {
    const video = ref.current;
    if (video && showTrimmer && clipButtonClickTime !== null) {
      // Calculate absolute stream positions for the selected range
      const absoluteStartTime = windowStartPosition + startTime;
      const absoluteEndTime = windowStartPosition + endTime;

      // Only seek if we're not currently dragging and current time is outside the selected range
      if (
        !isDragging &&
        (video.currentTime < absoluteStartTime ||
          video.currentTime > absoluteEndTime)
      ) {
        video.currentTime = absoluteStartTime;
      }
    }
  }, [
    startTime,
    showTrimmer,
    isDragging,
    endTime,
    windowStartPosition,
    clipButtonClickTime,
  ]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatAbsoluteTime = (relativeTime: number) => {
    const absoluteTime = windowStartPosition + relativeTime;
    return formatTime(absoluteTime);
  };

  const handleSubmit = async () => {
    if (onTrimSubmit && ref.current && clipButtonClickTime !== null) {
      setIsSubmitting(true);
      try {
        // Pass the window positions to the backend
        await onTrimSubmit(
          startTime,
          endTime,
          windowStartPosition,
          windowEndPosition,
        );
      } catch (error) {
        console.error("Error creating clip:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleMouseDown = useCallback(
    (type: "start" | "end") => (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(type);
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (
        !isDragging ||
        !trimmerRef.current ||
        maxDuration === 0 ||
        clipButtonClickTime === null
      )
        return;

      const rect = trimmerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const time = percentage * maxDuration;

      if (isDragging === "start") {
        const newStartTime = Math.max(0, Math.min(time, endTime - 1));
        setStartTime(newStartTime);
        // Immediately seek video to new absolute position
        if (ref.current) {
          ref.current.currentTime = windowStartPosition + newStartTime;
        }
      } else if (isDragging === "end") {
        const newEndTime = Math.min(maxDuration, Math.max(time, startTime + 1));
        setEndTime(newEndTime);
      }
    },
    [
      isDragging,
      maxDuration,
      startTime,
      endTime,
      windowStartPosition,
      clipButtonClickTime,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate percentages for the trimmer UI (relative to the window)
  const startPercentage = maxDuration > 0 ? (startTime / maxDuration) * 100 : 0;
  const endPercentage = maxDuration > 0 ? (endTime / maxDuration) * 100 : 100;

  // Current time indicator should show position within the trimmer window
  const relativeCurrentTime =
    clipButtonClickTime !== null
      ? Math.max(0, Math.min(currentTime - windowStartPosition, maxDuration))
      : 0;
  const currentPercentage =
    maxDuration > 0 ? (relativeCurrentTime / maxDuration) * 100 : 0;

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

      {showTrimmer && clipButtonClickTime !== null && (
        <div className="mt-4 px-4 py-3 rounded-lg border-2 border-border text-black">
          <div className="flex justify-between items-center mb-2 text-sm">
            <span>Start: {formatAbsoluteTime(startTime)}</span>
            <span className="text-xs">
              Duration: {formatTime(endTime - startTime)}
            </span>
            <span>End: {formatAbsoluteTime(endTime)}</span>
          </div>

          <div className="text-xs mb-2 text-gray-600">
            Showing last {formatTime(maxDuration)} of stream (up to{" "}
            {formatTime(clipButtonClickTime)})
          </div>

          <div
            ref={trimmerRef}
            className="relative h-10 bg-gray-600 rounded cursor-pointer select-none mb-4 border border-gray-500"
            style={{ touchAction: "none" }}
          >
            {/* Background timeline */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 rounded" />

            {/* Selected range */}
            <div
              className="absolute top-0 bottom-0 bg-blue-500 opacity-80 rounded"
              style={{
                left: `${startPercentage}%`,
                width: `${endPercentage - startPercentage}%`,
              }}
            />

            {/* Current time indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
              style={{
                left: `${Math.min(Math.max(currentPercentage, 0), 100)}%`,
              }}
            />

            {/* Start handle */}
            <div
              className="absolute top-0 bottom-0 w-4 bg-blue-600 cursor-ew-resize z-10 rounded-l flex items-center justify-center hover:bg-blue-700 transition-colors border-2 border-blue-400"
              style={{
                left: `${startPercentage}%`,
                transform: "translateX(-50%)",
              }}
              onMouseDown={handleMouseDown("start")}
            >
              <div className="w-1 h-6 bg-white rounded" />
            </div>

            {/* End handle */}
            <div
              className="absolute top-0 bottom-0 w-4 bg-blue-600 cursor-ew-resize z-10 rounded-r flex items-center justify-center hover:bg-blue-700 transition-colors border-2 border-blue-400"
              style={{
                left: `${endPercentage}%`,
                transform: "translateX(-50%)",
              }}
              onMouseDown={handleMouseDown("end")}
            >
              <div className="w-1 h-6 bg-white rounded" />
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-center">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                  Creating Clip...
                </div>
              ) : (
                `Create Clip (${formatTime(endTime - startTime)})`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
