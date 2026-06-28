import { cookies } from "next/headers";

const WISHLIST_COOKIE = "guest_wishlist";

export async function getGuestWishlist() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(WISHLIST_COOKIE);

  if (!cookie) return { bookIds: [] };

  try {
    const parsed = JSON.parse(cookie.value);
    return { bookIds: Array.isArray(parsed.bookIds) ? parsed.bookIds : [] };
  } catch {
    return { bookIds: [] };
  }
}

export async function setGuestWishlist(data) {
  const cookieStore = await cookies();

  cookieStore.set(WISHLIST_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}
