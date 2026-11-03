/** "What's included" tiles: white cards with a dark round check. */
export function InclusionGrid({ items }: { items: string[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3 p-0">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 rounded-[14px] border border-line bg-white px-[18px] py-4"
        >
          <span
            aria-hidden="true"
            className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-cocoa-900 text-[13px] text-gold-300"
          >
            ✓
          </span>
          <span className="text-[15px] leading-normal">{item}</span>
        </li>
      ))}
    </ul>
  );
}
