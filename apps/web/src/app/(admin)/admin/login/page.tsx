import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/LoginForm";

import logo from "../../../../../public/taj-band-logo.png";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
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
          <h1 className="m-0 font-serif text-2xl text-cocoa-900">Admin sign in</h1>
          <p className="m-0 text-sm text-ink-muted">Manage the Taj Band website.</p>
        </div>
        {/* LoginForm reads ?next= (useSearchParams), which needs a Suspense boundary. */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
