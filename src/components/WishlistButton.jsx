"use client";

import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "@/store/wishlistSlice";
import toast from "react-hot-toast";

export default function WishlistButton({
  bookId,
  className = "",
  size = "md",
  title,
}) {
  const dispatch = useDispatch();
  const { bookIds, syncing } = useSelector((s) => s.wishlist);
  const inWishlist = bookIds.includes(String(bookId));

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const result = await dispatch(toggleWishlist({ bookId })).unwrap();
      if (result.added) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  const heartBlack = "[filter:brightness(0)_saturate(100%)]";
  const heartActive =
    "[filter:brightness(0)_saturate(100%)_invert(48%)_sepia(90%)_saturate(1800%)_hue-rotate(360deg)_brightness(100%)_contrast(101%)]";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={syncing}
      title={title || (inWishlist ? "Remove from wishlist" : "Add to wishlist")}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={inWishlist}
      className={`group inline-flex items-center justify-center shrink-0 cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <img
        src="/img/heart.webp"
        alt=""
        className={`${sizeClasses[size] || sizeClasses.md} transition-all duration-200 ${
          inWishlist ? heartActive : heartBlack
        } ${inWishlist ? "opacity-100 scale-110" : "opacity-100"}`}
      />
    </button>
  );
}
