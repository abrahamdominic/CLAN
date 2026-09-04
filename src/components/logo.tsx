import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoImage } from "@/components/logo-image";

interface LogoProps {
  className?: string;
  textClassName?: string;
  showText?: boolean;
}

export function Logo({ className, textClassName, showText = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5", className)}
      aria-label="CLAN, Christian Life Altar Network"
    >
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-navy-800">
        <LogoImage />
      </span>
      {showText && (
        <span className={cn("flex flex-col leading-tight", textClassName)}>
          <span className="font-display text-lg font-bold text-navy-900">
            Christian Life <span className="text-gold-600">Altar</span> Network
          </span>
          <span className="text-xs uppercase tracking-widest text-navy-500">
            The Rebirth of True Christianity
          </span>
        </span>
      )}
    </Link>
  );
}
