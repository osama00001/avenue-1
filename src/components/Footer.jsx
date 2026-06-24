"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchCMSPages } from "@/store/cmsSlice";
import {
  COOKIE_PREFERENCES_SELECTOR,
  isManageCookiesLink,
} from "@/lib/legalLinks";
import { DEFAULT_SOCIAL_LINKS } from "@/lib/defaultSocialLinks";
import {
  FaXTwitter,
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa6";

/**
 * Map icon string from DB → react-icons component
 */
const ICON_MAP = {
  faXTwitter: FaXTwitter,
  faSquareFacebook: FaFacebook,
  faFacebook: FaFacebook,
  faInstagram: FaInstagram,
  faTiktok: FaTiktok,
  faYoutube: FaYoutube,
  faLinkedin: FaLinkedin,
};

const pickFirstString = (obj, exclude = []) => {
  if (!obj) return null;
  for (const [key, value] of Object.entries(obj)) {
    if (exclude.includes(key)) continue;
    if (typeof value === "string" && value.trim().length) {
      return value.trim();
    }
  }
  return null;
};

const resolveFooterHref = (href) => {
  if (!href) return "#";
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  if (href.startsWith("/cms/")) return href;
  const normalized = href.startsWith("/") ? href : `/${href}`;
  return `/cms${normalized}`;
};

export default function Footer() {
  const dispatch = useDispatch();
  const [footerConfig, setFooterConfig] = useState(null);

  const { list: pages, loading } = useSelector((s) => s.cms);

  /**
   * ================= LOAD DATA
   */
  useEffect(() => {
    if (!pages.length) {
      dispatch(fetchCMSPages());
    }

    const loadFooter = async () => {
      try {
        const res = await fetch("/api/strapi/footer");
        if (!res.ok) return;
        const payload = await res.json();
        const entry = payload?.data;
        const attributes = entry?.attributes ?? entry;
        if (attributes) {
          setFooterConfig({ id: entry?.id, ...attributes });
        }
      } catch (err) {
        console.error("[footer] failed to load footer config", err);
      }
    };

    loadFooter();
  }, [dispatch]);

  /**
   * ================= CMS GROUP
   */
  const group = (lvl) => pages.filter((p) => Number(p.level || 0) === lvl);

  const columns = [
    { title: "SHOPPING WITH US", level: 1 },
    { title: "LEGAL", level: 2 },
    { title: "ABOUT AVENUE", level: 3 },
  ];

  const footerColumns =
    footerConfig?.columns && footerConfig.columns.length
      ? footerConfig.columns
      : columns;
  const useFooterConfig = footerColumns === footerConfig?.columns;


  

  /**
   * ================= SOCIALS (icons only — links added later)
   */
  const displaySocials = [...DEFAULT_SOCIAL_LINKS]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <footer className="bg-[#e8e8e8] text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-16">
        {/* CMS COLUMNS */}
        {footerColumns.map((col, colIndex) => {
          const items = useFooterConfig ? col.links || [] : group(col.level);
          const columnTitle =
            col.title || pickFirstString(col, ["id", "links"]);
          const columnKey =
            col.id ?? columnTitle ?? col.level ?? `col-${colIndex}`;

          return (
            <div key={columnKey}>
              <h4 className="text-sm font-semibold tracking-widest mb-4 text-black">
                {columnTitle || col.level || "Links"}
              </h4>

              <ul className="space-y-2 text-sm">
                {loading && <li className="text-gray-600">Loading...</li>}

                {!loading && items.length === 0 && (
                  <li className="text-gray-600">
                    {useFooterConfig ? "No links" : "No pages"}
                  </li>
                )}

                {useFooterConfig
                  ? items.map((link, index) => {
                      const linkLabel =
                        link.label || pickFirstString(link, ["id", "href"]);
                      const rawHref = link.href || link.url || "#";
                      const linkHref = resolveFooterHref(rawHref);
                      const linkKey =
                        link.id ??
                        linkLabel ??
                        linkHref ??
                        `link-${colIndex}-${index}`;
                      if (!linkLabel) return null;
                      const manageCookies = isManageCookiesLink(
                        linkHref,
                        linkLabel
                      );
                      return (
                        <li key={linkKey}>
                          <Link
                            href={manageCookies ? "#" : linkHref}
                            id={
                              manageCookies
                                ? COOKIE_PREFERENCES_SELECTOR.slice(1)
                                : undefined
                            }
                            onClick={
                              manageCookies
                                ? (e) => {
                                    e.preventDefault();
                                    window.cookieconsent?.openPreferencesCenter?.();
                                  }
                                : undefined
                            }
                            target={link.openInNewTab ? "_blank" : undefined}
                            rel={link.openInNewTab ? "noreferrer" : undefined}
                            className="hover:underline text-gray-800 hover:text-black"
                          >
                            {linkLabel}
                          </Link>
                        </li>
                      );
                    })
                  : items.map((page, index) => {
                      const pageHref = `/cms/${page.slug}`;
                      const manageCookies = isManageCookiesLink(
                        pageHref,
                        page.title
                      );
                      return (
                        <li key={page.id ?? page.slug ?? `page-${index}`}>
                          <Link
                            href={manageCookies ? "#" : pageHref}
                            id={
                              manageCookies
                                ? COOKIE_PREFERENCES_SELECTOR.slice(1)
                                : undefined
                            }
                            onClick={
                              manageCookies
                                ? (e) => {
                                    e.preventDefault();
                                    window.cookieconsent?.openPreferencesCenter?.();
                                  }
                                : undefined
                            }
                            className="hover:underline text-gray-800 hover:text-black"
                          >
                            {page.title}
                          </Link>
                        </li>
                      );
                    })}
              </ul>
            </div>
          );
        })}

        {/* SOCIAL */}
        <div>
          <h4 className="text-sm font-semibold tracking-widest mb-4 text-black">
            FOLLOW US
          </h4>

          <ul className="space-y-3 text-sm">
            {displaySocials.map((social, i) => {
              const Icon = ICON_MAP[social.icon];
              return (
                <li key={social.id ?? social.label ?? `social-${i}`}>
                  <span className="flex items-center gap-3 text-gray-900">
                    {Icon ? (
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full bg-gray-400" />
                    )}
                    <span>{social.label}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Legal / company info */}
      <div className="border-t border-gray-400 px-6 py-5">
        <div className="max-w-7xl mx-auto text-center text-xs text-gray-800 leading-relaxed space-y-1">
          <p className="font-medium text-black">© Avenue, 2026.</p>
          <p>
            Avenue Retail Online Limited. Registered in England and Wales. Company
            Number 16339200. Registered Office 128 City Road London EC1V 2NX
          </p>
        </div>
      </div>
    </footer>
  );
}
