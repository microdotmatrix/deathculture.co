import { fetchGlobals, fetchPages } from "@/lib/api/ghost";
import Link from "next/link";

export const Nav = async () => {
  const pages = await fetchPages();
  const globals = await fetchGlobals();
  return (
    <nav className="bg-black flex items-center justify-between px-8">
      <h1 className="text-2xl font-bold text-white">
        <Link href="/">{globals.title}</Link>
      </h1>
      <menu className="flex items-center justify-center gap-8 py-4 text-gray-100 uppercase">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/blog">Blog</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </menu>
    </nav>
  );
};
