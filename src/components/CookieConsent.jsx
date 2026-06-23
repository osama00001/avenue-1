"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LEGAL_LINKS } from "@/lib/legalLinks";

const COOKIE_CONSENT_SRC =
  "https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js";

const COOKIE_CONSENT_CONFIG = {
  notice_banner_type: "simple",
  consent_type: "express",
  palette: "light",
  language: "en",
  website_name: "Avenue Bookstore",
  open_preferences_center_selector: "#changePreferences",
  preferences_center_close_button_hide: false,
  page_load_consent_levels: ["strictly-necessary"],
  notice_banner_purposes_levels: [
    "strictly-necessary",
    "functionality",
    "tracking",
    "targeting",
  ],
};

function initCookieConsent() {
  if (typeof window === "undefined") return;
  if (typeof window.cookieconsent?.run !== "function") return;

  window.cookieconsent.run({
    ...COOKIE_CONSENT_CONFIG,
    website_privacy_policy_url: `${window.location.origin}${LEGAL_LINKS.privacy.href}`,
  });
}

function loadCookieConsentScript() {
  if (typeof window === "undefined") return;

  if (window.cookieconsent) {
    initCookieConsent();
    return;
  }

  const existing = document.querySelector(
    `script[src="${COOKIE_CONSENT_SRC}"]`
  );
  if (existing) {
    existing.addEventListener("load", initCookieConsent, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.src = COOKIE_CONSENT_SRC;
  script.charset = "UTF-8";
  script.async = true;
  script.onload = initCookieConsent;
  document.body.appendChild(script);
}

export default function CookieConsent() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (process.env.NEXT_PUBLIC_COOKIE_CONSENT_ENABLED === "false") return;

    loadCookieConsentScript();
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;
  if (process.env.NEXT_PUBLIC_COOKIE_CONSENT_ENABLED === "false") return null;

  return (
    <noscript>
      Free cookie consent management tool by{" "}
      <a href="https://www.termsfeed.com/">TermsFeed</a>
    </noscript>
  );
}
