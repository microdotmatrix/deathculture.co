import "@/styles/global.css";
import "@/styles/vendor.css";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { TailwindIndicator } from "@/components/ui/tailwind";
import { fetchGlobals } from "@/lib/api/ghost";
import { headline, lemonMilk, questrial } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const globals = await fetchGlobals();
  return {
    title: globals.title,
    description: globals.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globals = await fetchGlobals();
  return (
    <html lang="en">
      <body
        className={cn(
          questrial.variable,
          lemonMilk.variable,
          headline.variable,
          "antialiased"
        )}
      >
        <Header globals={globals} />
        {children}
        <Footer globals={globals} />
        {process.env.NODE_ENV === "development" && <TailwindIndicator />}
      </body>
    </html>
  );
}
