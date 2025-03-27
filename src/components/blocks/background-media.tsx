"use client";

import { cva } from "class-variance-authority";
import React, { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Icon } from "../ui/icon";

// Make sure this utility exists in your project for combining class names

// Define the type for the variant and type props
type OverlayVariant = "none" | "light" | "dark";
type MediaType = "image" | "video";

// Update the cva call with these types
const backgroundVariants = cva(
  "relative h-screen max-h-[1024px] w-full min-h-[500px] lg:min-h-[600px]",
  {
    variants: {
      overlay: {
        none: "",
        light:
          "before:absolute before:inset-0 before:bg-white before:opacity-30",
        dark: "before:absolute before:inset-0 before:bg-black before:opacity-30",
      },
      type: {
        image: "",
        video: "z-10",
      },
    },
    defaultVariants: {
      overlay: "none",
      type: "image",
    },
  }
);

interface BackgroundMediaProps {
  variant?: OverlayVariant;
  type?: MediaType;
  src: string;
  alt?: string;
  loop?: boolean;
}

export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  variant = "light",
  type = "image",
  src,
  alt = "",
  loop = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const mediaRef = useRef<HTMLVideoElement | null>(null);

  const toggleMediaPlay = () => {
    if (type === "video" && mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const mediaClasses = cn(
    backgroundVariants({ overlay: variant, type }),
    "overflow-hidden"
  );

  const renderMedia = () => {
    if (type === "video") {
      return (
        <video
          ref={mediaRef}
          aria-hidden="true"
          muted
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 pointer-events-none"
          autoPlay
          playsInline
          loop={loop}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className="absolute inset-0 h-full w-full object-cover rounded-br-[88px]"
          loading="eager"
        />
      );
    }
  };

  return (
    <div className={mediaClasses}>
      {renderMedia()}
      {type === "video" && (
        <button
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="absolute bottom-4 right-4 z-50 p-2 bg-gray-900 text-gray-100 text-xl focus:outline-none focus:ring focus:ring-gray-500/50 opacity-50 hover:opacity-100 transition-opacity duration-200 shadow-md shadow-slate-100/0 hover:shadow-slate-100/15"
          onClick={toggleMediaPlay}
        >
          {isPlaying ? (
            <Icon icon="ph:pause-duotone" />
          ) : (
            <Icon icon="ph:play-duotone" />
          )}
        </button>
      )}
    </div>
  );
};
