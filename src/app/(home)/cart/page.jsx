"use client";

import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
} from "@/store/cartSlice";
import { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import reverseName from "@/lib/reverseName";
import BookFormatSection from "@/components/BookFormatSection";
import { useRouter } from "next/navigation";
import { fetchUserDetails } from "@/store/userSlice";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import OrderSidebar from "@/components/checkout/OrderSidebar";


function CartQuantitySelector({ quantity, onUpdate }) {
  const [showCustom, setShowCustom] = useState(quantity > 10);
  const [draft, setDraft] = useState(
    quantity > 10 ? String(quantity) : ""
  );

  useEffect(() => {
    if (quantity > 10) {
      setShowCustom(true);
      setDraft(String(quantity));
    }
  }, [quantity]);

  const commitCustomQty = () => {
    const qty = parseInt(draft, 10);
    if (!qty || qty <= 10) {
      setShowCustom(false);
      setDraft("");
      if (qty >= 1 && qty <= 10) onUpdate(qty);
      return;
    }
    setDraft(String(qty));
    onUpdate(qty);
  };

  if (showCustom) {
    return (
      <input
        type="number"
        min={11}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitCustomQty}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        placeholder="Qty"
        autoFocus
        className="border border-gray-300 px-2 py-1 text-sm w-16 focus:outline-none focus:border-[#1a1a1a]"
      />
    );
  }

  return (
    <select
      value={quantity <= 10 ? quantity : "10+"}
      onChange={(e) => {
        if (e.target.value === "10+") {
          setShowCustom(true);
          setDraft("");
        } else {
          onUpdate(Number(e.target.value));
        }
      }}
      className="border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-[#1a1a1a] cursor-pointer"
    >
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
      <option value="10+">10+</option>
    </select>
  );
}

const DESKTOP_CART_SCROLL = "(min-width: 1024px)";
const CART_VISIBLE_ITEMS = 8;
const CART_PEEK_RATIO = 0.5;

export default function CartPage() {
  const dispatch = useDispatch();
  const { items = [] } = useSelector((state) => state.cart);
  const router = useRouter();
  const [imgError, setImgError] = useState(new Array(items.length).fill(false));
  const listRef = useRef(null);
  const nextBtnRef = useRef(null);
  const [listMaxHeight, setListMaxHeight] = useState(undefined);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const updateListHeight = useCallback(() => {
    const container = listRef.current;
    const isDesktop = window.matchMedia(DESKTOP_CART_SCROLL).matches;

    if (!container || items.length <= CART_VISIBLE_ITEMS || !isDesktop) {
      setListMaxHeight(undefined);
      setShowScrollHint(false);
      setScrolledToBottom(false);
      return;
    }

    const itemEls = Array.from(container.children);
    if (itemEls.length <= CART_VISIBLE_ITEMS) {
      setListMaxHeight(undefined);
      setShowScrollHint(false);
      return;
    }

    let visibleHeight = 0;
    for (let i = 0; i < CART_VISIBLE_ITEMS; i++) {
      visibleHeight += itemEls[i].getBoundingClientRect().height;
    }
    const peekEl = itemEls[CART_VISIBLE_ITEMS];
    const peek = peekEl.getBoundingClientRect().height * CART_PEEK_RATIO;
    const idealHeight = visibleHeight + peek;

    setListMaxHeight(idealHeight);
    setShowScrollHint(true);
    setScrolledToBottom(false);
  }, [items]);

  useLayoutEffect(() => {
    updateListHeight();
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(updateListHeight);
    });
    return () => cancelAnimationFrame(frame);
  }, [updateListHeight]);

  useEffect(() => {
    window.addEventListener("resize", updateListHeight);
    return () => window.removeEventListener("resize", updateListHeight);
  }, [updateListHeight]);

  useEffect(() => {
    const container = listRef.current;
    if (!container || items.length <= CART_VISIBLE_ITEMS) return;

    const mq = window.matchMedia(DESKTOP_CART_SCROLL);
    const onBreakpointChange = () => updateListHeight();
    mq.addEventListener("change", onBreakpointChange);

    const observer = new ResizeObserver(() => updateListHeight());
    observer.observe(container);
    if (nextBtnRef.current) observer.observe(nextBtnRef.current);

    return () => {
      mq.removeEventListener("change", onBreakpointChange);
      observer.disconnect();
    };
  }, [updateListHeight, items.length]);

  const handleListScroll = (e) => {
    const el = e.currentTarget;
    setScrolledToBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 8);
  };

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchUserDetails());
  }, [dispatch]);

  /* ---------------- HELPERS ---------------- */
  const getTitle = (book) =>
    book?.descriptiveDetail?.titles?.[0]?.text || "Untitled";

  const getAuthor = (book) =>
    reverseName(book?.descriptiveDetail?.contributors?.[0]?.nameInverted) ||
    "Unknown";

  const getOriginalPrice = (book) =>
    book?.productSupply?.prices?.[0]?.amount || 0;

  const getDiscountPercent = (book) =>
    book?.productSupply?.prices?.[0]?.discountPercent || 0;

  const getFinalPrice = (book) => {
    const price = getOriginalPrice(book);
    const discount = getDiscountPercent(book);
    return discount ? price - (price * discount) / 100 : price;
  };

  /* ---------------- TOTALS ---------------- */
  const subtotal = items.reduce((sum, item) => {
    if (!item.book) return sum;
    return sum + getFinalPrice(item.book) * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const shippingCost = subtotal > 25 ? 0 : 2.99;
  const total = subtotal + shippingCost;

  const handleNext = () => {
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 py-6 w-full">
        {/* TOP CHROME */}
        <div className="flex items-center justify-between text-sm mb-5">
          <Link href="/" className="text-[#000000] hover:underline">
            &lt; Back to shopping
          </Link>
        </div>

        {/* STEP BAR */}
        <CheckoutSteps current="basket" />

        {items.length === 0 ? (
          <div className="bg-white p-12 text-center border border-gray-200 mt-6">
            <h2 className="text-2xl font-bold mb-4">Your basket is empty</h2>
            <Link
              href="/"
              className="bg-black text-white px-6 py-3 inline-block hover:bg-[#FF6A00] transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 mt-6">
            {/* ITEMS */}
            <div className="flex-1">
              <div className="border border-gray-200">
                <div className="relative">
                  <div
                    ref={listRef}
                    onScroll={handleListScroll}
                    className={
                      items.length > CART_VISIBLE_ITEMS && listMaxHeight
                        ? "lg:overflow-y-auto lg:cart-items-scroll"
                        : ""
                    }
                    style={
                      listMaxHeight ? { maxHeight: `${listMaxHeight}px` } : undefined
                    }
                  >
                    {items.map((item) => {
                  const book = item.book;
                  if (!book) return null;

                  const title = getTitle(book);
                  const author = getAuthor(book);
                  const original = getOriginalPrice(book);
                  const discountPercent = getDiscountPercent(book);
                  const price = getFinalPrice(book);
                  const formatOriginalPrice = Number(original).toFixed(2);
                  const formatDiscountPercent = Number(discountPercent).toFixed(2);
                  const formatPrice = price.toFixed(2);

                  return (
                    <div
                      key={book._id}
                      className="border-b border-gray-200 p-4 lg:p-5 last:border-b-0"
                    >
                      {/* Mobile + tablet: stacked card */}
                      <div className="lg:hidden space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="relative w-20 h-28 shrink-0 bg-gray-50 flex items-center justify-center">
                            {book.coverImage || (book.recordReference && !imgError[items.indexOf(item)]) ? (
                              <Image
                                src={
                                  book.coverImage ||
                                  `/covers/${book.recordReference.split("_")[0]}.jpg`
                                }
                                alt={title}
                                fill
                                className="object-contain"
                                sizes="80px"
                                unoptimized={true}
                                onError={() => setImgError((prev) => {
                                  const newErrors = [...prev];
                                  newErrors[items.indexOf(item)] = true;
                                  return newErrors;
                                })}
                              />
                            ) : (
                              <span className="text-gray-400 text-[8px] text-center px-1">
                                {title}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <Link href={`/${book._id}`}>
                              <h3 className="font-semibold leading-snug hover:underline">
                                {title}
                              </h3>
                            </Link>
                            <div className="text-sm mt-0.5">{author}</div>
                          </div>

                          <div className="shrink-0 flex flex-col items-end gap-2">
                            <CartQuantitySelector
                              quantity={item.quantity}
                              onUpdate={(qty) =>
                                dispatch(
                                  updateCartQuantity({
                                    bookId: book._id,
                                    quantity: qty,
                                  })
                                )
                              }
                            />
                            <span className="font-semibold whitespace-nowrap text-sm">
                              £{(price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <BookFormatSection
                          compact
                          book={book}
                          price={formatPrice}
                          originalPrice={formatOriginalPrice}
                          discountPercent={formatDiscountPercent}
                        />

                        <button
                          onClick={async () => {
                            const response = await dispatch(
                              removeFromCart({ bookId: book._id })
                            );
                            if (response?.type === "cart/remove/fulfilled") {
                              toast.success("Item removed from basket");
                            }
                          }}
                          className="text-[#1a1a1a] text-sm underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Desktop: horizontal row */}
                      <div className="hidden lg:flex gap-4">
                        <div className="relative w-16 h-24 shrink-0 bg-gray-50 flex items-center justify-center">
                          {book.coverImage || (book.recordReference && !imgError[items.indexOf(item)]) ? (
                            <Image
                              src={
                                book.coverImage ||
                                `/covers/${book.recordReference.split("_")[0]}.jpg`
                              }
                              alt={title}
                              fill
                              className="object-contain"
                              sizes="64px"
                              unoptimized={true}
                              onError={() => setImgError((prev) => {
                                const newErrors = [...prev];
                                newErrors[items.indexOf(item)] = true;
                                return newErrors;
                              })}
                            />
                          ) : (
                            <span className="text-gray-400 text-[8px] text-center px-1">
                              {title}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link href={`/${book._id}`}>
                            <h3 className="font-semibold leading-snug hover:underline">
                              {title}
                            </h3>
                          </Link>
                          <div className="text-sm">{author}</div>

                          <div className="mt-3">
                            <BookFormatSection
                              compact
                              book={book}
                              price={formatPrice}
                              originalPrice={formatOriginalPrice}
                              discountPercent={formatDiscountPercent}
                            />
                          </div>

                          <button
                            onClick={async () => {
                              const response = await dispatch(
                                removeFromCart({ bookId: book._id })
                              );
                              if (response?.type === "cart/remove/fulfilled") {
                                toast.success("Item removed from basket");
                              }
                            }}
                            className="text-[#1a1a1a] text-sm underline mt-4 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <CartQuantitySelector
                            quantity={item.quantity}
                            onUpdate={(qty) =>
                              dispatch(
                                updateCartQuantity({
                                  bookId: book._id,
                                  quantity: qty,
                                })
                              )
                            }
                          />
                          <span className="font-semibold whitespace-nowrap">
                            £{(price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                  </div>

                  {showScrollHint && !scrolledToBottom && (
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent hidden lg:block"
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* NEXT BUTTON */}
                <div ref={nextBtnRef} className="flex justify-end p-5 bg-gray-50">
                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto bg-black text-white px-8 py-3 font-semibold cursor-pointer hover:bg-[#FF6A00] transition"
                  >
                    NEXT: DELIVERY
                  </button>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <OrderSidebar
              step="basket"
              itemCount={itemCount}
              subtotal={subtotal}
              deliveryCost={shippingCost}
              deliveryLabel="Delivery"
              total={total}
            />
          </div>
        )}
      </div>
    </div>
  );
}
