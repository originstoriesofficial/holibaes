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
    "rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 w-full";

  const variants = {
    primary:
      "bg-[var(--gold)] text-[var(--green)] hover:brightness-110 shadow hover:scale-105",
    secondary:
      "border border-[var(--sage)] text-[var(--green)] hover:bg-[var(--sage)]/20",
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
