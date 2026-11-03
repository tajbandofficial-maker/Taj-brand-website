import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-cocoa-900 text-cream-50 hover:bg-cocoa-800",
  secondary: "border border-sand-300 bg-white text-ink hover:border-gold-500",
  danger: "border border-[#e7b4ae] bg-white text-[#b3261e] hover:bg-[#fdecea]",
  ghost: "text-ink-muted hover:bg-cream-100 hover:text-ink",
};
const sizes: Record<Size, string> = { sm: "min-h-9 px-3 text-sm", md: "min-h-11 px-4 text-[15px]" };

export function adminButtonClasses(variant: Variant = "secondary", size: Size = "md") {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
  );
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & { variant?: Variant; size?: Size };

export function AdminButton({ variant, size, className, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={cn(adminButtonClasses(variant, size), className)} {...rest} />
  );
}

type LinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  external?: boolean;
};

export function AdminLinkButton({ href, variant, size, className, children, external }: LinkProps) {
  const classes = cn(adminButtonClasses(variant, size), className);
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {children}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
