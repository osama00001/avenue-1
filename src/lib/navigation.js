/** Hide legacy utility links (store/shop finder, help) from storefront nav. */
export function isHiddenUtilityNavItem(item) {
  const label = String(item?.label || "").trim();
  return /(?:shop|store)\s*finder|^help(?:\s*&.*)?$/i.test(label);
}

export function filterUtilityMenu(items = []) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => !isHiddenUtilityNavItem(item));
}
