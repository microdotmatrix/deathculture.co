import { Questrial } from "next/font/google";
import localFont from "next/font/local";

export const questrial = Questrial({
  variable: "--font-questrial",
  subsets: ["latin"],
  weight: ["400"],
});

export const headline = localFont({
  src: "./headline-news/HeadlineNews.ttf",
  variable: "--font-headline",
  display: "swap",
});

export const lemonMilk = localFont({
  src: "./lemon-milk/LemonMilkLight.otf",
  variable: "--font-lemon-milk",
  display: "swap",
});
