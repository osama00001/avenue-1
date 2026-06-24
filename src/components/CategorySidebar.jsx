"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CATALOG_CATEGORIES,
  categoryBrowseUrl,
  isCatalogCategoryActive,
} from "@/lib/catalogCategories";

const CategorySidebar = () => {
  const pathname = usePathname();
  const categoryParam = pathname.split("/category/")[1]?.split("/")[0] || "";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden lg:block h-fit sticky top-24">
      <h3 className="text-xs font-black text-gray-400 tracking-[0.2em] mb-8 uppercase">
        Catalog
      </h3>
      <ul className="space-y-5">
        {CATALOG_CATEGORIES.map((cat) => {
          const isActive = isCatalogCategoryActive(cat, categoryParam);
          return (
            <li key={cat.slug}>
              <Link
                href={categoryBrowseUrl(cat.slug)}
                className={`block text-sm font-bold tracking-tight transition-all duration-200 hover:text-[#FF6A00] hover:translate-x-1
                ${isActive ? "text-[#FF6A00] border-l-2 border-[#FF6A00] pl-3 -ml-3" : "text-gray-900"}`}
              >
                {cat.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default CategorySidebar;
