"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "@/store/wishlistSlice";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items = [], loading } = useSelector((s) => s.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const products = items.map((i) => i.book).filter(Boolean);

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-black">
            My Wishlist
          </h1>
          <Link
            href="/"
            className="text-sm text-black hover:text-[#FF6A00] hover:underline whitespace-nowrap"
          >
            Continue shopping
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading wishlist…</div>
        ) : products.length === 0 ? (
          <div className="border border-gray-200 bg-white p-10 sm:p-12 text-center">
            <img
              src="/img/heart.webp"
              alt=""
              className="w-10 h-10 mx-auto mb-4 [filter:brightness(0)_saturate(100%)]"
            />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Tap the heart on any book to save it to your wishlist.
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-6 py-3 font-semibold hover:bg-[#FF6A00] transition"
            >
              Browse books
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-6">
              {products.length} item{products.length === 1 ? "" : "s"} in your wishlist
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
