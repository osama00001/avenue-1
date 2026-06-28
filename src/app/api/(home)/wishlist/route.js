import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Book from "@/models/Book";
import User from "@/models/User";
import { getServerUser } from "@/lib/getServerUser";
import { getGuestWishlist, setGuestWishlist } from "@/lib/guestWishlist";

function enrichBook(book) {
  if (!book) return null;
  const recordRef = book.recordReference?.split("_")[0];
  return {
    ...book,
    image:
      book.coverImage ||
      (recordRef ? `/covers/${recordRef}.jpg` : null),
  };
}

function userWishlistIds(doc) {
  return doc?.wishlist?.length ? doc.wishlist : doc?.favorites || [];
}

async function buildResponse(bookIds) {
  const uniqueIds = [...new Set(bookIds.map(String))];
  if (!uniqueIds.length) {
    return { items: [], bookIds: [] };
  }

  const books = await Book.find({ _id: { $in: uniqueIds } }).lean();
  const map = {};
  books.forEach((b) => {
    map[String(b._id)] = enrichBook(b);
  });

  const items = uniqueIds
    .map((id) => map[id])
    .filter(Boolean)
    .map((book) => ({ book }));

  return {
    items,
    bookIds: items.map((i) => String(i.book._id)),
  };
}

export async function GET() {
  try {
    await connectDB();
    const user = await getServerUser();

    if (user) {
      const doc = await User.findById(user.id).populate("wishlist").lean();
      const books = userWishlistIds(doc).filter(Boolean);
      return NextResponse.json({
        items: books.map((book) => ({ book: enrichBook(book) })),
        bookIds: books.map((b) => String(b._id)),
      });
    }

    const guest = await getGuestWishlist();
    return NextResponse.json(await buildResponse(guest.bookIds));
  } catch (err) {
    console.error("[wishlist GET]", err);
    return NextResponse.json({ error: "Failed to load wishlist" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { bookId } = await req.json();

    if (!bookId) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    const book = await Book.findById(bookId).lean();
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const user = await getServerUser();

    if (user) {
      const doc = await User.findById(user.id);
      if (!doc) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (!doc.wishlist) doc.wishlist = [];

      const idStr = String(bookId);
      const exists = doc.wishlist.some((id) => String(id) === idStr);
      if (exists) {
        doc.wishlist = doc.wishlist.filter((id) => String(id) !== idStr);
      } else {
        doc.wishlist.push(bookId);
      }
      await doc.save();

      const updated = await User.findById(user.id).populate("wishlist").lean();
      const books = userWishlistIds(updated).filter(Boolean);
      return NextResponse.json({
        items: books.map((b) => ({ book: enrichBook(b) })),
        bookIds: books.map((b) => String(b._id)),
        added: !exists,
      });
    }

    const guest = await getGuestWishlist();
    const idStr = String(bookId);
    const exists = guest.bookIds.some((id) => String(id) === idStr);
    const bookIds = exists
      ? guest.bookIds.filter((id) => String(id) !== idStr)
      : [...guest.bookIds, idStr];

    await setGuestWishlist({ bookIds });
    const payload = await buildResponse(bookIds);
    return NextResponse.json({ ...payload, added: !exists });
  } catch (err) {
    console.error("[wishlist POST]", err);
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { bookId } = await req.json();

    if (!bookId) {
      return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
    }

    const user = await getServerUser();
    const idStr = String(bookId);

    if (user) {
      const doc = await User.findById(user.id);
      if (!doc) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (!doc.wishlist) doc.wishlist = [];
      doc.wishlist = doc.wishlist.filter((id) => String(id) !== idStr);
      await doc.save();

      const updated = await User.findById(user.id).populate("wishlist").lean();
      const books = userWishlistIds(updated).filter(Boolean);
      return NextResponse.json({
        items: books.map((b) => ({ book: enrichBook(b) })),
        bookIds: books.map((b) => String(b._id)),
      });
    }

    const guest = await getGuestWishlist();
    const bookIds = guest.bookIds.filter((id) => String(id) !== idStr);
    await setGuestWishlist({ bookIds });
    return NextResponse.json(await buildResponse(bookIds));
  } catch (err) {
    console.error("[wishlist DELETE]", err);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
