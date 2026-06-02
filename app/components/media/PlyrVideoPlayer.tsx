"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { PlyrOptions, PlyrSource } from "plyr-react";

type PlyrVideoPlayerProps = {
  src: string;
  title?: string;
  poster?: string;
  mimeType?: string;
  className?: string;
};

const PLYR_CONTROLS: PlyrOptions["controls"] = [
  "play-large",
  "play",
  "progress",
  "current-time",
  "duration",
  "mute",
  "volume",
  "settings",
  "pip",
  "airplay",
  "fullscreen",
];

const PLYR_OPTIONS: PlyrOptions = {
  autoplay: true,
  muted: true,
  controls: PLYR_CONTROLS,
  ratio: "16:9",
};

const PlyrPlayer = dynamic(() => import("plyr-react").then((mod) => mod.Plyr), {
  ssr: false,
});

export default function PlyrVideoPlayer({
  src,
  title,
  poster,
  mimeType,
  className = "",
}: PlyrVideoPlayerProps) {
  const source = useMemo<PlyrSource>(
    () => ({
      type: "video",
      title,
      poster,
      sources: [
        {
          src,
          type: mimeType,
        },
      ],
    }),
    [mimeType, poster, src, title]
  );

  return (
    <div className={`overflow-hidden rounded-lg bg-black ${className}`}>
      <PlyrPlayer
        source={source}
        options={PLYR_OPTIONS}
        autoPlay
        muted
        playsInline
        preload="metadata"
      />
    </div>
  );
}
