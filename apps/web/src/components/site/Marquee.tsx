/** Gold ticker strip; content is duplicated so the CSS loop is seamless. */
export function Marquee({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-t-gold-300 border-b-gold-700 bg-gold-500 text-cocoa-900">
      <p className="sr-only">{items.join(", ")}</p>
      <div
        aria-hidden="true"
        className="flex w-max animate-marquee py-3.5 font-serif text-[clamp(18px,2.2vw,24px)] whitespace-nowrap"
      >
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-7 pr-7">
            {item}
            <span className="text-sm text-cocoa-800">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
