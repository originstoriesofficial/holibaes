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
    "rounded-2xl px-5 py-3 text-base font-semibold transition-all duration-200 w-full";

  const variants = {
    primary:
      "bg-[var(--gold)] text-black hover:brightness-105 shadow-md hover:scale-[1.03]",
    secondary:
      "border border-[var(--sage)] text-[var(--green)] hover:bg-[var(--sage)]/10",
  };

  return (
    <button
      className={clsx(base, v
