import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export const Button = ({
  variant = "primary",
  children,
  className,
  ...props
}: ButtonProps) => {
  const base =
    "w-full rounded-2xl px-5 py-3 text-base font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variants = {
    primary:
      "bg-[var(--gold)] text-[#ce19e6] shadow-md hover:brightness-105 hover:scale-[1.03] focus-visible:ring-[var(--gold)]",
    secondary:
      "border border-[var(--sage)] text-[var(--green)] hover:bg-[var(--sage)]/10 focus-visible:ring-[var(--sage)]",
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};
