import { cn } from "@/lib/cn";

type Props = { items: string[]; className?: string };

/** Gold-ticked list used inside package cards (on dark backgrounds). */
export function CheckList({ items, className }: Props) {
  return (
    <ul className={cn("m-0 flex list-none flex-col gap-2.5 p-0", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-[15px] leading-[1.45]">
          <span aria-hidden="true" className="text-gold-300">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
