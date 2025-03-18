import { Globals } from "@/lib/api/types";
import Link from "next/link";

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
