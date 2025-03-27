"use client";

import type { Globals } from "@/lib/api/types";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { useEffect } from "react";

export const Nav = ({ globals }: { globals: Globals }) => {
  return (
    <nav className="bg-black flex items-center justify-between px-8">
      <h1 className="text-2xl font-bold text-white">
        <Link href="/">{globals.title}</Link>
      </h1>
      <menu className="flex items-center justify-center gap-8 py-4 text-gray-100 uppercase">
        {globals.navigation.map((item) => (
          <li key={item.url}>
            <Link href={item.url}>{item.label}</Link>
          </li>
        ))}
      </menu>
    </nav>
  );
};

let clamp = (number: number, min: number, max: number) =>
  Math.min(Math.max(number, min), max);

function useBoundedScroll(threshold: number) {
  let { scrollY } = useScroll();
  let scrollYBounded = useMotionValue(0);
  let scrollYBoundedProgress = useTransform(
    scrollYBounded,
    [0, threshold],
    [0, 1]
  );

  useEffect(() => {
    return scrollY.on("change", (current) => {
      let previous = scrollY.getPrevious();
      let diff = current - (previous ?? 0);
      let newScrollYBounded = scrollYBounded.get() + diff;

      scrollYBounded.set(clamp(newScrollYBounded, 0, threshold));
    });
  }, [threshold, scrollY, scrollYBounded]);

  return { scrollYBounded, scrollYBoundedProgress };
}

export function Header({ globals }: { globals: Globals }) {
  let { scrollYBoundedProgress } = useBoundedScroll(400);
  let scrollYBoundedProgressDelayed = useTransform(
    scrollYBoundedProgress,
    [0, 0.75, 1],
    [0, 0, 1]
  );

  return (
    <section
      id="header"
      className="mx-auto flex w-full flex-1 overflow-hidden relative z-50"
    >
      <motion.header
        style={{
          height: useTransform(scrollYBoundedProgressDelayed, [0, 1], [80, 50]),
          backgroundColor: useMotionTemplate`rgb(0 0 0 / ${useTransform(
            scrollYBoundedProgressDelayed,
            [0, 1],
            [1, 0.5]
          )})`,
        }}
        className="fixed inset-x-0 flex h-20 shadow backdrop-blur-md"
      >
        <div className="mx-auto flex w-full items-center justify-between px-8">
          <motion.p
            style={{
              scale: useTransform(
                scrollYBoundedProgressDelayed,
                [0, 1],
                [1, 0.9]
              ),
            }}
            className="flex origin-left items-center text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white transition-transform ease-in-out duration-200"
          >
            <Link href="/">{globals.title}</Link>
          </motion.p>
          <motion.div
            style={{
              opacity: useTransform(
                scrollYBoundedProgressDelayed,
                [0, 1],
                [1, 0.5]
              ),
              scale: useTransform(
                scrollYBoundedProgressDelayed,
                [0, 1],
                [1, 0.9]
              ),
            }}
            className="flex items-center transition-all ease-in-out  duration-200 origin-center"
          >
            <menu className="hidden lg:flex items-center space-x-4 lg:space-x-8 uppercase font-medium text-slate-300">
              {globals.navigation.map((item) => (
                <Link key={item.url} href={item.url}>
                  {item.label}
                </Link>
              ))}
            </menu>
          </motion.div>
        </div>
      </motion.header>
    </section>
  );
}
