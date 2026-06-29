import Image from "next/image";
import { shouldUseNativeImage } from "@/lib/mediaUrl";

export default function CmsImage({
  src,
  alt = "",
  width = 1400,
  height = 200,
  className = "object-cover w-full",
  loading = "lazy",
  priority = false,
  sizes,
}) {
  if (!src) return null;

  if (shouldUseNativeImage(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      priority={priority}
      sizes={sizes}
    />
  );
}
