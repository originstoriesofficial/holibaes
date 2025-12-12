import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export const Button = ({ variant = "primary", children, className, ...props }: ButtonProps) => {
  const base = "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200";
  const variants = {
    primary: "bg-[#D4AF37] text-[#1F3B2C] hover:bg-[#c5a22e] shadow-[0_2px_6px_rgba(0,0,0,0.2)]",
    secondary: "border border-[#9BBF83] text-[#1F3B2C] hover:bg-[#9BBF83]/20"
  };
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};
