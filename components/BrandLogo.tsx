import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  size?: number;
  showText?: boolean;
  suffix?: string;
};

export function BrandLogo({ className, imageClassName, size = 32, showText = true, suffix }: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/itsura_logo.jpg"
        alt="IT.SURA logo"
        width={size}
        height={size}
        className={cn("shrink-0 rounded-sm object-cover", imageClassName)}
      />
      {showText && (
        <span className="min-w-0 truncate text-sm font-semibold tracking-tight">
          IT.SURA{suffix ? ` ${suffix}` : ""}
        </span>
      )}
    </div>
  );
}
