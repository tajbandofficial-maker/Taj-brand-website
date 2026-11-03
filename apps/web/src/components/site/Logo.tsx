import Image from "next/image";
import Link from "next/link";

import logo from "../../../public/taj-band-logo.png";

type Props = { businessName: string; tagline: string };

/** Shield logo + wordmark used in the header. */
export function Logo({ businessName, tagline }: Props) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${businessName} — home`}>
      <Image src={logo} alt="" width={48} height={48} priority className="size-12 object-contain" />
      <span className="flex flex-col leading-[1.1]">
        <span className="font-serif text-xl text-cream-50">{businessName}</span>
        <span className="text-[10px] font-bold tracking-[0.18em] text-sun-400 uppercase">
          {tagline}
        </span>
      </span>
    </Link>
  );
}
