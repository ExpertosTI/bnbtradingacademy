import Image from "next/image";

export function BrandMark({
  size = 40,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/logo.png"
      alt="B&B Trading Academy"
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={`rounded-full object-cover shadow-[0_10px_28px_rgba(0,0,0,0.45)] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
