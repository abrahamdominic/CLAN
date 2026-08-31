"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoImageProps {
  className?: string;
}

export function LogoImage({ className }: LogoImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setFailed(false);
    img.onerror = () => setFailed(true);
    img.src = "/images/clan.png";
  }, []);

  if (failed) {
    return (
      <span className={cn("font-display text-sm font-bold text-gold-400", className)}>
        CLAN
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/clan.png"
      alt="CLAN logo"
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
