import Image from "next/image";
import type { ReactNode } from "react";

import logo from "../../../public/taj-band-logo.png";

/** Centered cream card on the cocoa background, used by sign-in and password reset. */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-cocoa-900 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-cream-50 p-7 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Image
            src={logo}
            alt="Taj Band"
            width={72}
            height={72}
            className="size-[72px] object-contain"
          />
          <h1 className="m-0 font-serif text-2xl text-cocoa-900">{title}</h1>
          <p className="m-0 text-sm text-ink-muted">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
