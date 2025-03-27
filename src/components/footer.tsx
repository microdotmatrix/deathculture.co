import type { Globals } from "@/lib/api/types";
import Link from "next/link";
import { Button } from "./ui/button";
import { Icon } from "./ui/icon";
import { Input } from "./ui/input";

export const Footer = ({ globals }: { globals: Globals }) => {
  return (
    <footer className="bg-black">
      <div className="bg-primary py-6">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
            <div className="mb-3 text-center md:mb-0 md:text-left">
              <span className="font-bold uppercase tracking-widest text-gray-100">
                Newsletter
              </span>
              <p className="text-gray-200">Subscribe to our newsletter</p>
            </div>

            <form className="flex w-full items-center gap-2 md:max-w-md">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-none bg-white/50 border-border"
              />

              <Button
                type="submit"
                variant="secondary"
                className="rounded-none"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="pt-12 lg:pt-16">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="mb-16 grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-6 lg:gap-8">
            <div className="col-span-full lg:col-span-2 flex flex-col justify-between">
              <div className="mb-4 lg:-mt-2 space-y-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-xl font-bold text-slate-100 md:text-2xl"
                  aria-label="logo"
                >
                  <Icon icon="simple-icons:ghost" className="size-8" />
                  DeathCulture.co
                </Link>

                <p className="text-gray-500 sm:pr-8">{globals.description}</p>
              </div>

              <div className="flex gap-4">
                <a
                  href="#"
                  target="_blank"
                  className="text-gray-400 transition duration-100 hover:text-gray-500 active:text-gray-600"
                >
                  <Icon icon="simple-icons:instagram" className="size-8" />
                </a>

                <a
                  href="#"
                  target="_blank"
                  className="text-gray-400 transition duration-100 hover:text-gray-500 active:text-gray-600"
                >
                  <Icon icon="simple-icons:x" className="size-8" />
                </a>

                <a
                  href="#"
                  target="_blank"
                  className="text-gray-400 transition duration-100 hover:text-gray-500 active:text-gray-600"
                >
                  <Icon icon="simple-icons:linkedin" className="size-8" />
                </a>

                <a
                  href="#"
                  target="_blank"
                  className="text-gray-400 transition duration-100 hover:text-gray-500 active:text-gray-600"
                >
                  <Icon icon="simple-icons:youtube" className="size-8" />
                </a>
              </div>
            </div>
            <div> </div>
            <div>
              <div className="mb-4 font-bold uppercase tracking-widest text-gray-800">
                Company
              </div>

              <nav className="flex flex-col gap-4">
                <div>
                  <Link
                    href="/about"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    About
                  </Link>
                </div>

                <div>
                  <Link
                    href="/posts"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Blog
                  </Link>
                </div>

                <div>
                  <Link
                    href="/partners"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Partners
                  </Link>
                </div>
              </nav>
            </div>
            <div>
              <div className="mb-4 font-bold uppercase tracking-widest text-gray-800">
                Support
              </div>

              <nav className="flex flex-col gap-4">
                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Contact
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Newsletter
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    Topics
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600"
                  >
                    FAQ
                  </a>
                </div>
              </nav>
            </div>
            <div>
              <div className="mb-4 font-bold uppercase tracking-widest text-gray-800">
                Legal
              </div>

              <nav className="flex flex-col gap-4">
                {globals.secondary_navigation.map((item) => (
                  <div key={item.url}>
                    <Link
                      href={item.url}
                      className="text-gray-500 transition duration-100 hover:text-primary active:text-primary"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          <div className="border-t py-8 text-center text-sm text-gray-400 flex items-center justify-center">
            <Icon icon="mdi:copyright" className="mr-2" />
            {new Date().getFullYear()} DeathCulture.co. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
