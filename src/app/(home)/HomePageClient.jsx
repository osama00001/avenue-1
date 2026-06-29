"use client";

import { useState, useEffect } from "react";
import BannerSlider from "@/components/BannerSlider";
import SaleHighlights from "@/components/SaleHighlights";
import HomeMustReadSection from "@/components/HomeMustReadSection";
import ProductSlider from "@/components/ProductSlider";
import {
  categorySeeMoreUrl,
  resolveHomeBannerHref,
  resolveSaleHighlightHref,
  resolveStoredHomeHref,
} from "@/lib/homeCategoryLinks";
import Link from "next/link";
import BlogSection from "@/components/BlogSection";
import CmsImage from "@/components/CmsImage";
import { useDispatch, useSelector } from "react-redux";
import { fetchBooksForHome } from "@/store/bookSlice";
import reverseName from "@/lib/reverseName";
import { fetchUserDetails } from "@/store/userSlice";
import { fetchCart } from "@/store/cartSlice";
import { fetchCategories } from "@/store/categorySlice";
import { fetchBlogCategories, fetchBlogs } from "@/store/blogSlice";
import { useSession } from "next-auth/react";
import { resolveMediaUrl } from "@/lib/mediaUrl";

export default function HomePage() {
  const {
    loading,
    error,
    books,
    catalog,
    bestsellers,
    popular,
    new_books,
    highlights: highlightsBooks,
    special_editions,
    coming_soon,
    fiction,
    non_fiction,
    recently_reviewed,
    paperback_books,
    children_books,
    language,
    games,
    adult_books,
    gift_books,
  } = useSelector((state) => state.book);

  const { user } = useSelector((state) => state.user);
  const { list: blogList, categories: blogCategories, loading: blogLoading, categoryLoading } = useSelector(
    (s) => s.blog
  );

  const dispatch = useDispatch();

  const [row1, setRow1] = useState([]);
  const [row2, setRow2] = useState([]);
  const [row3, setRow3] = useState([]);
  const [row4, setRow4] = useState([]);
  const [row5, setRow5] = useState([]);
  const [row6, setRow6] = useState([]);
  const [row7, setRow7] = useState([]);
  const [row8, setRow8] = useState([]);
  const [row9, setRow9] = useState([]);
  const [row10, setRow10] = useState([]);
  const [row11, setRow11] = useState([]);
  const [row12, setRow12] = useState([]);
  const [row13, setRow13] = useState([]);
  const [row14, setRow14] = useState([]);
  const [bannerSlides, setBannerSlides] = useState([]);
  const [promoSlides, setPromoSlides] = useState([]);
  const [stripBanner, setStripBanner] = useState(null);
  const [bottomBanner, setBottomBanner] = useState(null);
  const [middleBanner, setMiddleBanner] = useState(null);
  const [mainBanner, setMainBanner] = useState(null);
  const [quickLinks, setQuickLinks] = useState([]);
  const [contentLoading, setContentLoading] = useState(true);


  const { status: sessionStatus } = useSession();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (contentLoading) return;

    dispatch(
      fetchBooksForHome({ category: "bestsellers", limit: 10, page: 1 })
    );
    dispatch(fetchBooksForHome({ category: "popular", limit: 10, page: 2 }));
    dispatch(
      fetchBooksForHome({ category: "new_books", limit: 10, page: 3 })
    );
    dispatch(
      fetchBooksForHome({ category: "highlights", limit: 10, page: 4 })
    );
    dispatch(
      fetchBooksForHome({ category: "special_editions", limit: 10, page: 5 })
    );
    dispatch(
      fetchBooksForHome({ category: "coming_soon", limit: 10, page: 6 })
    );
    dispatch(fetchBooksForHome({ category: "fiction", limit: 10, page: 7 }));
    dispatch(
      fetchBooksForHome({ category: "non_fiction", limit: 10, page: 8 })
    );
    dispatch(
      fetchBooksForHome({ category: "recently_reviewed", limit: 10, page: 9 })
    );
    dispatch(
      fetchBooksForHome({ category: "paperback_books", limit: 10, page: 10 })
    );
    dispatch(
      fetchBooksForHome({ category: "children_books", limit: 10, page: 11 })
    );
    dispatch(
      fetchBooksForHome({ category: "language", limit: 10, page: 12 })
    );
    dispatch(
      fetchBooksForHome({ category: "games", limit: 10, page: 13 })
    );
    dispatch(
      fetchBooksForHome({ category: "adult_books", limit: 10, page: 14 })
    );
    dispatch(
      fetchBooksForHome({ category: "gift_books", limit: 10, page: 15 })
    );
    dispatch(fetchCategories({ page: 1, limit: 50 }));
    dispatch(fetchBlogs());
    dispatch(fetchBlogCategories());
  }, [contentLoading, dispatch]);

  useEffect(() => {
    let cancelled = false;

    const loadBannerSlides = async () => {
      try {
        const res = await fetch("/api/content/home-banner");
        if (!res.ok) return;
        const payload = await res.json();
        const entry = payload?.data;
        const attributes = entry?.attributes ?? entry;
        const slides = attributes?.slides || [];

        const resolved = slides
          .map((slide, index) => {
            const image =
              slide.imageUrl ||
              slide.image?.url ||
              slide.image?.data?.attributes?.url ||
              slide.image?.data?.url;
            const imageUrl = resolveMediaUrl(image);
            if (!imageUrl) return null;
            const slideData = {
              id: slide.id ?? index,
              imageUrl,
              alt: slide.alt || slide.title || "Banner",
              order: slide.order ?? index,
              href: slide.href,
            };
            return {
              ...slideData,
              href: resolveStoredHomeHref(slide.href, "carousel", slideData),
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.order - b.order);

        if (resolved.length) {
          setBannerSlides(resolved);
        }
      } catch (err) {
        console.error("[home] failed to load banner slides", err);
      }
    };

    const loadPromoSlides = async () => {
      try {
        const res = await fetch("/api/content/home-promo");
        if (!res.ok) return;
        const payload = await res.json();
        const entry = payload?.data;
        const attributes = entry?.attributes ?? entry;
        const slides = attributes?.slides || [];
        const resolved = slides
          .map((slide, index) => {
            const image =
              slide.imageUrl ||
              slide.image?.url ||
              slide.image?.data?.attributes?.url ||
              slide.image?.data?.url;
            const imageUrl = resolveMediaUrl(image);
            if (!imageUrl) return null;
            const slideData = {
              id: slide.id ?? index,
              title: slide.title || "Promo",
              image: imageUrl,
              order: slide.order ?? index,
              href: slide.href,
            };
            return {
              ...slideData,
              link: resolveStoredHomeHref(slide.href, "promo", slideData),
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.order - b.order);

        if (resolved.length) {
          setPromoSlides(resolved);
        }
      } catch (err) {
        console.error("[home] failed to load promo slides", err);
      }
    };

    const loadStripBanner = async () => {
      try {
        const res = await fetch("/api/content/home-strip");
        if (!res.ok) return;
        const payload = await res.json();
        const entry = payload?.data;
        if (entry?.imageUrl) {
          setStripBanner(entry);
        }
      } catch (err) {
        console.error("[home] failed to load strip banner", err);
      }
    };

    const loadBottomBanner = async () => {
      try {
        const res = await fetch("/api/content/home-bottom-banner");
        if (!res.ok) return;
        const payload = await res.json();
        const entry = payload?.data;
        if (entry?.imageUrl) {
          setBottomBanner(entry);
        }
      } catch (err) {
        console.error("[home] failed to load bottom banner", err);
      }
    };

    const loadMiddleBanner = async () => {
      try {
        const res = await fetch("/api/content/home-middle-banner");
        if (!res.ok) return;
        const payload = await res.json();
        const entry = payload?.data;
        if (entry?.imageUrl) {
          setMiddleBanner(entry);
        }
      } catch (err) {
        console.error("[home] failed to load middle banner", err);
      }
    };

    const loadMainBanner = async () => {
      try {
        const res = await fetch("/api/content/home-main-banner");
        if (!res.ok) return;
        const payload = await res.json();
        const entry = payload?.data;
        if (entry?.imageUrl) {
          setMainBanner(entry);
        }
      } catch (err) {
        console.error("[home] failed to load main banner", err);
      }
    };

    const loadQuickLinks = async () => {
      try {
        const res = await fetch("/api/content/home-quick-links");
        if (!res.ok) return;
        const payload = await res.json();
        const entry = payload?.data;
        const attributes = entry?.attributes ?? entry;
        const items = (attributes?.items || [])
          .filter((item) => {
            if (typeof item.enabled === "boolean") return item.enabled;
            return !/^\[inactive\]\s*/i.test(String(item.label || ""));
          })
          .map((item, index) => {
            const image =
              item.imageUrl ||
              item.image?.url ||
              item.image?.data?.attributes?.url ||
              item.image?.data?.url;
            const imageUrl = image ? resolveMediaUrl(image) : null;
            const label = String(item.label || "")
              .replace(/^\[inactive\]\s*/i, "")
              .trim();
            const isFeatured =
              item.isFeatured === true || /must-read/i.test(label);
            return {
              id: item.id ?? index,
              label,
              alt: item.alt,
              iconSrc: imageUrl,
              imageUrl,
              href: resolveSaleHighlightHref(item.href, label) || item.href,
              order: item.order ?? index,
              isFeatured,
            };
          })
          .filter((item) => item.isFeatured || item.imageUrl || item.href)
          .sort((a, b) => a.order - b.order);

        if (items.length) {
          setQuickLinks(items);
        }
      } catch (err) {
        console.error("[home] failed to load quick links", err);
      }
    };

    const loadHomeContent = async () => {
      await Promise.all([
        loadBannerSlides(),
        loadPromoSlides(),
        loadStripBanner(),
        loadBottomBanner(),
        loadMiddleBanner(),
        loadMainBanner(),
        loadQuickLinks(),
      ]);

      if (!cancelled) {
        setContentLoading(false);
      }
    };

    loadHomeContent();

    return () => {
      cancelled = true;
    };
  }, []);

  // Only fetch user when a session is confirmed Ã¢â‚¬â€ avoids 401 noise for guests
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      dispatch(fetchUserDetails());
    }
  }, [sessionStatus, dispatch]);

  //   useEffect(() => {
  //   dispatch(fetchCategories({ page: 1, limit: 50 }));
  // }, [dispatch]);

  // console.log("User Data on Home Page:", user);

  // Stable per-book placeholder: XOR-fold the full _id string so every
  // character contributes â†’ even distribution across all 82 placeholder images.
  const placeholderIdx = (id = "") => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h ^ id.charCodeAt(i)) & 0xff;
    return (h % 82) + 1;
  };

  useEffect(() => {
    if (bestsellers) {
      const row = bestsellers.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow1(row);
    }
    if (popular) {
      const row = popular.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow2(row);
    }
    if (new_books) {
      const row = new_books.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow3(row);
    }
    if (highlightsBooks) {
      const row = highlightsBooks.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow4(row);
    }
    if (special_editions) {
      const row = special_editions.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow5(row);
    }
    if (coming_soon) {
      const row = coming_soon.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: true,
      }));
      setRow6(row);
    }
    if (fiction) {
      const row = fiction.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow7(row);
    }
    if (non_fiction) {
      const row = non_fiction.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow8(row);
    }
    if (recently_reviewed) {
      const row = recently_reviewed.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow9(row);
    }
    if (paperback_books) {
      const row = paperback_books.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0]|| ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow10(row);
    }
    if (children_books) {
      const row = children_books.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow11(row);
    }
    if (language) {
      const row = language.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow12(row);
    }
    if (games) {
      const row = games.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow13(row);
    }
    if (adult_books) {
      const row = adult_books.map((item, index) => ({
        ...item,
        author: reverseName(
          item.descriptiveDetail?.contributors?.find(c => c.role === "A01")?.nameInverted
          || item.descriptiveDetail?.contributors?.[0]?.nameInverted
          || ""
        ),
        image: item.coverImage || `/covers/${item.recordReference.split("_")[0] || ""}.jpg`,
        format: "Paperback",
        preorder: false,
      }));
      setRow14(row);
    }
  }, [
    books,
    bestsellers,
    popular,
    new_books,
    highlightsBooks,
    special_editions,
    coming_soon,
    fiction,
    non_fiction,
    recently_reviewed,
    paperback_books,
    children_books,
    language,
    games,
    adult_books,
    gift_books,
  ]);

  if (contentLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FF6A00] border-t-transparent" />
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-600">
          Loading...
        </p>
      </div>
    );
  }

  const highlights2 = [
    {
      id: 1,
      label: "Bestsellers",
      iconSrc: "/img/icons/bestseller1.webp",
      href: categorySeeMoreUrl("bestsellers"),
    },
    {
      id: 2,
      label: "Fiction",
      iconSrc: "/img/icons/fictionreb1.webp",
      href: categorySeeMoreUrl("fiction"),
    },
    {
      id: 3,
      label: "Non-Fiction",
      iconSrc: "/img/icons/non-fiction1.webp",
      href: categorySeeMoreUrl("non_fiction"),
    },
    {
      id: 4,
      label: "Children's",
      iconSrc: "/img/icons/childrens1.webp",
      href: categorySeeMoreUrl("children_books"),
    },
  ];

  const isLookingForLabel = (label = "") =>
    /you may be looking for/i.test(String(label).trim());

  const featuredQuickLink =
    quickLinks.find((item) => item.isFeatured) ??
    quickLinks.find((item) => /must-read/i.test(item.label || "")) ??
    quickLinks.find(
      (item) =>
        item.href &&
        !item.imageUrl &&
        !isLookingForLabel(item.label)
    ) ??
    null;
  const featuredId = featuredQuickLink?.id;
  const quickLinkGrid = quickLinks.filter(
    (item) =>
      item.id !== featuredId &&
      !item.isFeatured &&
      !isLookingForLabel(item.label) &&
      item.imageUrl
  );
  const quickLinkGridResolved = quickLinkGrid.length ? quickLinkGrid : highlights2;

  const highlights = [
    {
      id: 1,
      label: "Bestsellers",
      iconSrc: "/img/icons/bestseller1.webp",
      href: categorySeeMoreUrl("bestsellers"),
    },
    {
      id: 2,
      label: "Fiction",
      iconSrc: "/img/icons/fictionreb1.webp",
      href: categorySeeMoreUrl("fiction"),
    },
    {
      id: 3,
      label: "Non-Fiction",
      iconSrc: "/img/icons/non-fiction1.webp",
      href: categorySeeMoreUrl("non_fiction"),
    },
    {
      id: 4,
      label: "Children's",
      iconSrc: "/img/icons/childrens1.webp",
      href: categorySeeMoreUrl("children_books"),
    },
    {
      id: 5,
      label: "Stationery",
      iconSrc: "/img/icons/stationary1.webp",
      href: categorySeeMoreUrl("stationery"),
    },
    {
      id: 6,
      label: "Calendars & Diaries",
      iconSrc: "/img/icons/calenderdiary1.webp",
      href: categorySeeMoreUrl("calendars_diaries"),
    },
  ];

  const products = [
    {
      id: "1",
      slug: "let-them-theory",
      title: "The Let Them Theory",
      author: "Mel Robbins",
      image: "/img/whenthecreanes.webp",
      price: 18.99,
      originalPrice: 22.99,
      format: "Paperback",
      preorder: true,
    },
    {
      id: "2",
      slug: "hamnet",
      title: "Hamnet",
      author: "Maggie O'Farrell",
      image: "/img/housemaidbook.jpg",
      price: 8.99,
      originalPrice: 10.99,
      format: "Paperback",
      preorder: false,
    },
    {
      id: "3",
      slug: "hamnet",
      title: "Hamnet",
      author: "Maggie O'Farrell",
      image: "/img/whenthecreanes.webp",
      price: 8.99,
      originalPrice: 10.99,
      format: "Paperback",
      preorder: false,
    },
    {
      id: "4",
      slug: "hamnet",
      title: "Hamnet",
      author: "Maggie O'Farrell",
      image: "/img/whenthecreanes.webp",
      price: 8.99,
      originalPrice: 10.99,
      format: "Paperback",
      preorder: false,
    },
    {
      id: "5",
      slug: "hamnet",
      title: "Hamnet",
      author: "Maggie O'Farrell",
      image: "/img/murderatmountfuji.jpg",
      price: 8.99,
      originalPrice: 10.99,
      format: "Paperback",
      preorder: false,
    },
    {
      id: "6",
      slug: "hamnet",
      title: "Hamnet",
      author: "Maggie O'Farrell",
      image: "/img/housemaidbook.jpg",
      price: 8.99,
      originalPrice: 10.99,
      format: "Paperback",
      preorder: false,
    },
    {
      id: "7",
      slug: "hamnet",
      title: "Hamnet",
      author: "Maggie O'Farrell",
      image: "/img/murderatmountfuji.jpg",
      price: 8.99,
      originalPrice: 10.99,
      format: "Paperback",
      preorder: false,
    },
    {
      id: "8",
      slug: "hamnet",
      title: "Hamnet",
      author: "Maggie O'Farrell",
      image: "/img/murderatmountfuji.jpg",
      price: 8.99,
      originalPrice: 10.99,
      format: "Paperback",
      preorder: false,
    },
  ];

  const products2 = [...products];

  const fallbackPromoSlides = [
    {
      title: "PROTEIN in 15",
      subtitle: "Protein packed meals from the Body Coach",
      image: "/img/sprinkbanner/joewiocl.webp",
    },
    {
      title: "DONUT SQUAD",
      subtitle: "Another sprinkling of madness with the Donut Squad",
      image: "/img/sprinkbanner/speinklink.webp",
    },
    {
      title: "NEW BOOKS!",
      subtitle: "The Biggest and Best Publishing Out Now",
      image: "/img/sprinkbanner/newbboks.webp",
    },
    {
      title: "NEW BOOKS!",
      subtitle: "The Biggest and Best Publishing Out Now",
      image: "/img/sprinkbanner/speinklink.webp",
    },
  ].map((slide) => ({
    ...slide,
    link: resolveHomeBannerHref("promo", slide),
  }));
  const promoSlidesResolved = promoSlides.length
    ? promoSlides
    : fallbackPromoSlides;
  const promoBanner = promoSlidesResolved[0];

  const fallbackBanners = [
    {
      id: 1,
      imageUrl: "/banner/1.png",
      alt: "Winter Sale - Up to 50% off",
    },
    {
      id: 2,
      imageUrl: "/banner/2.png",
      alt: "New Releases Available Now",
    },
    {
      id: 3,
      imageUrl: "/banner/3.jpg",
      alt: "Join Avenue Plus for exclusive perks",
    },
    {
      id: 4,
      imageUrl: "/banner/banner4.webp",
      alt: "Join Avenue Plus for exclusive perks",
    },
    {
      id: 5,
      imageUrl: "/banner/banner5.webp",
      alt: "Join Avenue Plus for exclusive perks",
    },
  ].map((slide) => ({
    ...slide,
    href: resolveHomeBannerHref("carousel", slide),
  }));
  const banners = bannerSlides.length ? bannerSlides : fallbackBanners;

  return (
    <div className="bg-white">
      <BannerSlider
        slides={banners}
        showArrows={false}
        autoSlide
        interval={5000}
      />

      <SaleHighlights
        saletitle="Discover Our Sale Highlights"
        highlights={highlights}
        variant="icons"
      />

      <ProductSlider
        title="Our Bestsellers"
        seeMoreUrl={categorySeeMoreUrl("bestsellers")}
        products={row1}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <div className="page-width">
        <Link
          href={resolveStoredHomeHref(promoBanner?.href, "promo", promoBanner || {})}
          className="min-w-full block relative"
        >
          <CmsImage
            src={promoBanner?.image || "/img/sprinkbanner/joewiocl.webp"}
            alt={promoBanner?.title || "Promo"}
            width={1400}
            height={200}
            className="object-cover w-full"
          />
        </Link>
      </div>

      <ProductSlider
        title="Everyone's Talking About..."
        seeMoreUrl={categorySeeMoreUrl("popular")}
        products={row2}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <ProductSlider
        title="New Books"
        seeMoreUrl={categorySeeMoreUrl("new_books")}
        products={row3}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <ProductSlider
        title="Highlights"
        seeMoreUrl={categorySeeMoreUrl("highlights")}
        products={row4}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <ProductSlider
        title="Signed & Special Editions"
        seeMoreUrl={categorySeeMoreUrl("special_editions")}
        products={row5}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <ProductSlider
        title="Coming Soon - The Biggest Books Coming in 2026"
        seeMoreUrl={categorySeeMoreUrl("coming_soon")}
        products={row6}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <div className="page-width">
        <Link
          href={resolveStoredHomeHref(stripBanner?.href, "strip", stripBanner || {})}
          className="min-w-full block relative"
        >
          <CmsImage
            src={stripBanner?.imageUrl || "/img/image_slider.webp"}
            alt={stripBanner?.alt || stripBanner?.title || "image_slider"}
            width={1400}
            height={200}
            className="object-cover w-full"
          />
        </Link>
      </div>

      <ProductSlider
        title="Our Best Fiction Books"
        seeMoreUrl={categorySeeMoreUrl("fiction")}
        products={row7}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <ProductSlider
        title="Our Best Non-Fiction Books"
        seeMoreUrl={categorySeeMoreUrl("non_fiction")}
        products={row8}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <div className="page-width">
        <Link
          href={resolveStoredHomeHref(mainBanner?.href, "main", mainBanner || {})}
          className="min-w-full block relative"
        >
          <CmsImage
            src={mainBanner?.imageUrl || "/img/main_bannerbottom.jpeg"}
            alt={mainBanner?.alt || mainBanner?.title || "image_slider"}
            width={1400}
            height={200}
            className="object-cover w-full"
          />
        </Link>
      </div>

      <ProductSlider
        title="Recently Reviewed"
        seeMoreUrl={categorySeeMoreUrl("recently_reviewed")}
        products={row9}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <ProductSlider
        title="Our Bestselling Paperbacks"
        seeMoreUrl={categorySeeMoreUrl("paperback_books")}
        products={row10}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      {featuredQuickLink ? (
        <HomeMustReadSection featured={featuredQuickLink} />
      ) : null}

      {!featuredQuickLink ? (
        <SaleHighlights highlights={quickLinkGridResolved} />
      ) : quickLinkGrid.length ? (
        <SaleHighlights highlights={quickLinkGrid} />
      ) : null}

      <ProductSlider
        title="Our Best Children's Books"
        seeMoreUrl={categorySeeMoreUrl("children_books")}
        products={row11}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <div className="page-width">
        <Link
          href={resolveStoredHomeHref(middleBanner?.href, "middle", middleBanner || {})}
          className="min-w-full block relative"
        >
          <CmsImage
            src={middleBanner?.imageUrl || "/img/bottom-2banner.jpeg"}
            alt={middleBanner?.alt || middleBanner?.title || "image_slider"}
            width={1400}
            height={200}
            className="object-cover w-full"
          />
        </Link>
      </div>

      <ProductSlider
        title="Language Learning"
        seeMoreUrl={categorySeeMoreUrl("language")}
        products={row12}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <ProductSlider
        title="Games & Puzzles"
        seeMoreUrl={categorySeeMoreUrl("games")}
        products={row13}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <ProductSlider
        title="Our Best Young Adult Books"
        seeMoreUrl={categorySeeMoreUrl("adult_books")}
        products={row14}
        slidesPerView={5}
        autoplayDelay={2500}
        showArrows
        showDots={false}
        loop
      />

      <div className="page-width">
        <Link
          href={resolveStoredHomeHref(bottomBanner?.href, "bottom", bottomBanner || {})}
          className="min-w-full block relative"
        >
          <CmsImage
            src={bottomBanner?.imageUrl || "/img/bottom-3banner.jpeg"}
            alt={bottomBanner?.alt || bottomBanner?.title || "image_slider"}
            width={1400}
            height={200}
            className="object-cover w-full"
          />
        </Link>
      </div>

      <BlogSection />
    </div>
  );
}

