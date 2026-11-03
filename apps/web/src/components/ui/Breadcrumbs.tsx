import Link from "next/link";

type Crumb = { label: string; href?: string };

/** Breadcrumb trail for dark heroes; the last crumb is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-sand-400">
      <ol className="m-0 flex list-none flex-wrap gap-2 p-0">
        {items.map((item, i) => (
          <li key={item.label} className="flex gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="-my-3 py-3 text-sand-200 hover:text-gold-300">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-gold-300">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
