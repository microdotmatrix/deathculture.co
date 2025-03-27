"use client";

import { Globals } from "@/lib/api/types";
import {
  motion,
  MotionConfig,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useTransform,
  Variants,
} from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
    <div className="mx-auto flex w-full flex-1 overflow-hidden relative z-50">
      <div className="z-0 flex-1 overflow-y-scroll">
        <motion.header
          style={{
            height: useTransform(
              scrollYBoundedProgressDelayed,
              [0, 1],
              [80, 50]
            ),
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
              {globals.title}
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
              <MobileNav globals={globals} />
            </motion.div>
          </div>
        </motion.header>
      </div>
    </div>
  );
}

export const AnimatedHamburgerButton = ({ toggle }: { toggle: () => void }) => {
  const [active, setActive] = useState(false);
  return (
    <MotionConfig
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    >
      <motion.button
        initial={false}
        animate={active ? "open" : "closed"}
        onClick={() => setActive((pv) => !pv)}
        className="relative size-12 md:size-16 transition-colors -mr-4 lg:hidden cursor-pointer"
      >
        <motion.span
          variants={VARIANTS.top}
          className="absolute h-0.75 md:h-1 w-8 bg-white"
          style={{ y: "-50%", left: "50%", x: "-50%", top: "35%" }}
        />
        <motion.span
          variants={VARIANTS.middle}
          className="absolute h-0.75 md:h-1 w-8 bg-white"
          style={{ left: "50%", x: "-50%", top: "50%", y: "-50%" }}
        />
        <motion.span
          variants={VARIANTS.bottom}
          className="absolute h-0.75 md:h-1 w-3.5 bg-white"
          style={{
            x: "-50%",
            y: "50%",
            bottom: "35%",
            left: "calc(50% + 10px)",
          }}
        />
      </motion.button>
    </MotionConfig>
  );
};

const VARIANTS = {
  top: {
    open: {
      rotate: ["0deg", "0deg", "45deg"],
      top: ["35%", "50%", "50%"],
    },
    closed: {
      rotate: ["45deg", "0deg", "0deg"],
      top: ["50%", "50%", "35%"],
    },
  },
  middle: {
    open: {
      rotate: ["0deg", "0deg", "-45deg"],
    },
    closed: {
      rotate: ["-45deg", "0deg", "0deg"],
    },
  },
  bottom: {
    open: {
      rotate: ["0deg", "0deg", "45deg"],
      bottom: ["35%", "50%", "50%"],
      left: "50%",
    },
    closed: {
      rotate: ["45deg", "0deg", "0deg"],
      bottom: ["50%", "50%", "35%"],
      left: "calc(50% + 10px)",
    },
  },
};

const useDimensions = (ref: React.RefObject<HTMLDivElement | null>) => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      dimensions.current.width = ref.current.offsetWidth;
      dimensions.current.height = ref.current.offsetHeight;
    }
  }, [ref]);

  return dimensions.current;
};

const navVariants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const MobileNav = ({ globals }: { globals: Globals }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { height } = useDimensions(containerRef);
  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      custom={height}
      ref={containerRef}
      className="block lg:hidden"
    >
      <motion.div
        className="bg-black absolute top-0 right-0 bottom-0 w-[420px]"
        variants={sidebarVariants}
      />
      <motion.ul
        className="list-none p-[25px] m-0 absolute top-[80px] right-[40px] w-[230px]"
        variants={navVariants}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <MenuItem i={i} key={i} />
        ))}
      </motion.ul>
      <MenuToggle toggle={() => setIsOpen(!isOpen)} />
    </motion.nav>
  );
};

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

const colors = ["#FF008C", "#D309E1", "#9C1AFF", "#7700FF", "#4400FF"];

const MenuItem = ({ i }: { i: number }) => {
  const borderStyle = `2px solid ${colors[i]}`;

  return (
    <motion.li
      className="flex items-center justify-start p-0 m-0 list-none mb-[20px] cursor-pointer"
      variants={itemVariants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="w-[40px] h-[40px] rounded-full flex-[40px_0] mr-[20px]"
        style={{ border: borderStyle }}
      />
      <div
        className="rounded-[5px] w-[200px] h-[20px] flex-1"
        style={{ border: borderStyle }}
      />
    </motion.li>
  );
};

const sidebarVariants = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at calc(100% - 40px) 40px)`,
    transition: {
      type: "spring",
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: "circle(30px at calc(100% - 40px) 40px)",
    transition: {
      delay: 0.2,
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

interface PathProps {
  d?: string;
  variants: Variants;
  transition?: { duration: number };
}

const Path = (props: PathProps) => (
  <motion.path
    fill="transparent"
    strokeWidth="3"
    stroke="hsl(100, 100%, 100%)"
    strokeLinecap="round"
    {...props}
  />
);

const MenuToggle = ({ toggle }: { toggle: () => void }) => (
  <button
    className="outline-none border-none select-none cursor-pointer absolute top-[18px] right-0.5 w-[50px] h-[50px] rounded-full bg-transparent"
    onClick={toggle}
  >
    <svg width="23" height="23" viewBox="0 0 23 23">
      <Path
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open: { d: "M 3 16.5 L 17 2.5" },
        }}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 },
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open: { d: "M 3 2.5 L 17 16.346" },
        }}
      />
    </svg>
  </button>
);
