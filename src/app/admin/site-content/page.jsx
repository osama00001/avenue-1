"use client";

import { useEffect } from "react";

const adminPanelUrl =
  process.env.NEXT_PUBLIC_ADMIN_PANEL_URL || "http://localhost:3001";

export default function SiteContentRedirectPage() {
  useEffect(() => {
    window.location.href = `${adminPanelUrl.replace(/\/$/, "")}/site-content`;
  }, []);

  return (
    <div className="p-10 text-gray-600">
      Redirecting to Avenue Admin site content panel...
    </div>
  );
}
