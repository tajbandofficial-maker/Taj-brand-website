import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant =
  "gold" | "dark" | "whatsapp" | "whatsappOutline" | "outlineGold" | "outlineLight";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  gold: "bg-gold-500 text-cocoa-900 font-bold hover:bg-gold-300 hover:text-cocoa-900",
  dark: "bg-cocoa-900 text-cream-50 font-bold hover:bg-cocoa-800 hover:text-cream-50",
  whatsapp: "bg-whatsapp text-whatsapp-ink font-bold hover:brightness-105 hover:text-whatsapp-ink",
  whatsappOutline:
    "border-[1.5px] border-whatsapp text-cream-50 font-semibold hover:bg-whatsapp/10 hover:text-cream-50",
  outlineGold:
    "border-[1.5px] border-gold-500 text-cream-50 font-bold hover:bg-gold-500/15 hover:text-cream-50",
  outlineLight:
    "border-[1.5px] border-sand-200/40 text-cream-50 font-semibold hover:border-sand-200 hover:text-cream-50",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-[18px] text-sm",
  md: "min-h-12 px-6 text-[15px]",
  lg: "min-h-[52px] px-[26px] text-base",
};

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean };

export function buttonClasses({
  variant = "gold",
  size = "md",
  fullWidth = false,
}: StyleProps = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full text-center transition-[background-color,color,border-color,filter] disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
  );
}

type ButtonLinkProps = StyleProps &
  Omit<ComponentPropsWithoutRef<"a">, "href"> & { href: string; children: ReactNode };

/** Link styled as a button. Internal paths use next/link; tel:/wa.me/https use <a>. */
export function ButtonLink({
  href,
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = cn(buttonClasses({ variant, size, fullWidth }), className);
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}

type ButtonProps = StyleProps & ComponentPropsWithoutRef<"button">;

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, fullWidth }), "cursor-pointer", className)}
      {...rest}
    />
  );
}
