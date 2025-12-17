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
    "w-full rounded-xl px-6 py-4 min-h-[56px] text-lg font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#0052FF] text-white shadow-md hover:bg-[#0046DD] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0052FF]/25 active:translate-y-0 focus-visible:ring-[#0052FF]",
    secondary:
      "border-2 border-[#8B92A0] text-[#1A1F36] bg-white hover:bg-[#E8EAED] hover:border-[#0052FF] focus-visible:ring-[#8B92A0]",
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