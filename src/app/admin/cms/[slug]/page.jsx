"use client";

import { useEffect } from "react";

const adminPanelUrl =
  process.env.NEXT_PUBLIC_ADMIN_PANEL_URL || "http://localhost:3001";

export default function CmsSlugRedirectPage() {
  useEffect(() => {
    window.location.href = `${adminPanelUrl.replace(/\/$/, "")}/site-content/pages`;
  }, []);

  return (
    <div className="p-10 text-gray-600">
      Redirecting to Avenue Admin CMS pages...
    </div>
  );
}
