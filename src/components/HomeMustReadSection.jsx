"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import afterDiscountPrice from "@/lib/afterDiscountPrice";
import reverseName from "@/lib/reverseName";
import { shouldUseNativeImage } from "@/lib/mediaUrl";

function extractBookIdFromHref(href = "") {
  if (!href) return null;
  const trimmed = String(href).trim();
  if (/^[a-f0-9]{24}$/i.test(trimmed)) return trimmed;
  const match = trimmed.match(/\/([a-f0-9]{24})\/?$/i);
  return match?.[1] || null;
}

function formatAvailabilityDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return null;
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const date = new Date(`${year}-${month}-${day}`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function stripHtml(text = "") {
  return String(text).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function isLookingForLabel(label = "") {
  return /you may be looking for/i.test(String(label).trim());
}

function resolveSectionTitle(label) {
  if (!label || isLookingForLabel(label)) return null;
  return label;
}

export default function HomeMustReadSection({ featured }) {
  const [book, setBook] = useState(null);
  const bookId = extractBookIdFromHref(featured?.href);

  useEffect(() => {
    if (!bookId) return;

    let cancelled = false;

    const loadBook = async () => {
      try {
        const res = await fetch(`/api/books/${bookId}`);
        if (!res.ok) return;
        const payload = await res.json();
        const entry = Array.isArray(payload) ? payload[0] : payload;
        if (!cancelled && entry?._id) {
          setBook(entry);
        }
      } catch (err) {
        console.error("[home] failed to load must-read book", err);
      }
    };

    loadBook();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  if (!featured?.imageUrl && !book) return null;

  const sectionTitle = resolveSectionTitle(featured?.label);
  const href = featured?.href || (book?._id ? `/${book._id}` : null);

  if (book) {
    const title = book?.descriptiveDetail?.titles?.[0]?.text || "Untitled";
    const author = reverseName(
      book?.descriptiveDetail?.contributors?.find((c) => c.role === "A01")
        ?.nameInverted ||
        book?.descriptiveDetail?.contributors?.[0]?.nameInverted ||
        ""
    );
    const description =
      stripHtml(
        book?.collateralDetail?.textContents?.[1]?.text ||
          book?.collateralDetail?.textContents?.[0]?.text ||
          ""
      ) || "No description available.";
    const originalPrice = Number(book?.productSupply?.prices?.[0]?.amount || 0);
    const discountPercent = Number(
      book?.productSupply?.prices?.[0]?.discountPercent || 0
    );
    const price = afterDiscountPrice(originalPrice, discountPercent);
    const availableDate = formatAvailabilityDate(
      book?.publishingDetail?.publishingDate
    );
    const coverImage =
      book?.coverImage ||
      `/covers/${book?.recordReference?.split("_")[0] || ""}.jpg`;
    const isExternalImage =
      coverImage.startsWith("http://") || coverImage.startsWith("https://");

    const card = (
      <div className="bg-white flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-2/5 bg-[#c9a8a8] flex items-center justify-center p-8 min-h-[280px]">
          {isExternalImage ? (
            <img
              src={coverImage}
              alt={title}
              className="max-h-[320px] w-auto object-contain shadow-lg"
              loading="lazy"
            />
          ) : (
            <div className="relative h-[320px] w-[220px] shadow-lg">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-contain"
                sizes="220px"
                unoptimized
              />
            </div>
          )}
        </div>
        <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center text-left">
          <h3 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-3">
            {title}
          </h3>
          {author && (
            <p className="text-base text-black mb-4">
              by{" "}
              <span className="underline underline-offset-2">{author}</span>
            </p>
          )}
          <p className="text-sm text-gray-800 leading-relaxed mb-6 line-clamp-4">
            {description}
          </p>
          <p className="text-2xl font-bold text-black mb-2">£{price}</p>
          {availableDate && (
            <p className="text-sm text-gray-700">Available {availableDate}</p>
          )}
        </div>
      </div>
    );

    return (
      <section className="py-10 px-4 max-w-6xl mx-auto">
        {sectionTitle ? (
          <h2 className="text-xl font-bold text-black mb-6">{sectionTitle}</h2>
        ) : null}
        {href ? (
          <Link href={href} className="block no-underline text-inherit hover:opacity-95 transition">
            {card}
          </Link>
        ) : (
          card
        )}
      </section>
    );
  }

  if (!featured?.imageUrl) return null;

  const isExternalImage =
    featured.imageUrl.startsWith("http://") ||
    featured.imageUrl.startsWith("https://");

  const imageAlt = featured.alt || sectionTitle || featured.label || "Featured";

  const imageBlock =
    isExternalImage || shouldUseNativeImage(featured.imageUrl) ? (
      <img
        src={featured.imageUrl}
        alt={imageAlt}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    ) : (
      <Image
        src={featured.imageUrl}
        alt={imageAlt}
        width={1200}
        height={400}
        className="w-full h-auto object-cover"
      />
    );

  return (
    <section className="py-10 px-4 max-w-6xl mx-auto">
      {sectionTitle ? (
        <h2 className="text-xl font-bold text-black mb-6">{sectionTitle}</h2>
      ) : null}
      {href ? (
        <Link href={href} className="block overflow-hidden">
          {imageBlock}
        </Link>
      ) : (
        <div className="overflow-hidden">{imageBlock}</div>
      )}
    </section>
  );
}
