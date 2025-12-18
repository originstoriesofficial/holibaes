// app/fonts.ts
import localFont from "next/font/local";

export const moontime = localFont({
  src: "./fonts/MoonTime.ttf", // 👈 relative to this file
  weight: "400",
  style: "normal",
});
