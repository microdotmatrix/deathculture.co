import { unstable_cache } from "next/cache";
import { cache as reactCache } from "react";

export const cache = <Inputs extends unknown[], Output>(
  callback: (...args: Inputs) => Promise<Output>,
  key: string[],
  options: { revalidate: number }
) => reactCache(unstable_cache(callback, key, options));
