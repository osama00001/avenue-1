import {
  DISPLAY_FORMATS,
  getBookDisplayFormatKey,
} from "@/lib/bookFormats";

function FormatPrice({ price, originalPrice, discountPercent, compact = false }) {
  const displayPrice =
    typeof price === "number" ? price.toFixed(2) : String(price);
  const displayOriginal =
    typeof originalPrice === "number"
      ? originalPrice.toFixed(2)
      : String(originalPrice ?? "");

  return (
    <span
      className={`block font-bold text-gray-900 ${compact ? "text-[10px] sm:text-xs mt-0.5" : "text-base mt-1"}`}
    >
      {Number(discountPercent) > 0 && (
        <span className="line-through text-gray-400 font-normal text-sm mr-1">
          £{displayOriginal}
        </span>
      )}
      £{displayPrice}
    </span>
  );
}

function FormatCard({
  format,
  isActive,
  interactive,
  price,
  originalPrice,
  discountPercent,
  compact = false,
}) {
  const baseClasses = compact
    ? "min-w-0 px-1 py-2 text-center border border-gray-200 transition-colors"
    : "min-w-[5.5rem] flex-1 px-3 py-3 text-center border border-gray-200 transition-colors";
  const activeClasses = compact
    ? "bg-gray-50 border-b-2 border-b-[#FF6A00]"
    : "bg-gray-50 border-b-4 border-b-[#FF6A00]";
  const inactiveClasses = compact
    ? "bg-white border-b-2 border-b-black opacity-60 cursor-not-allowed pointer-events-none"
    : "bg-white border-b-4 border-b-black opacity-60 cursor-not-allowed pointer-events-none";

  const className = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

  const content = compact ? (
    <>
      <span className="block text-[10px] sm:text-[11px] font-medium text-gray-600 leading-tight break-words">
        {format.label}
      </span>
      <FormatPrice
        price={price}
        originalPrice={originalPrice}
        discountPercent={discountPercent}
        compact
      />
    </>
  ) : (
    <>
      <span className="block text-sm font-medium text-gray-600">
        {format.label}
      </span>
      <FormatPrice
        price={price}
        originalPrice={originalPrice}
        discountPercent={discountPercent}
      />
    </>
  );

  if (isActive && interactive) {
    return (
      <button type="button" className={className} aria-pressed="true">
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

export default function BookFormatSection({
  book,
  price,
  originalPrice,
  discountPercent = 0,
  interactive = false,
  compact = false,
}) {
  const activeKey = getBookDisplayFormatKey(book);

  if (compact) {
    return (
      <div className="space-y-3 w-full max-w-full">
        <h3 className="text-sm font-semibold text-gray-900">Formats</h3>
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 w-full">
          {DISPLAY_FORMATS.map((format) => (
            <FormatCard
              key={format.key}
              format={format}
              isActive={format.key === activeKey}
              interactive={interactive}
              price={price}
              originalPrice={originalPrice}
              discountPercent={discountPercent}
              compact
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Formats</h3>
      </div>

      <div className="relative md:static">
        <div className="format-scroll overflow-x-scroll md:overflow-visible -mx-1 px-1 pb-2 md:mx-0 md:px-0 md:pb-0">
          <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap">
            {DISPLAY_FORMATS.map((format) => (
              <FormatCard
                key={format.key}
                format={format}
                isActive={format.key === activeKey}
                interactive={interactive}
                price={price}
                originalPrice={originalPrice}
                discountPercent={discountPercent}
              />
            ))}
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent md:hidden"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
