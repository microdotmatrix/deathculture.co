import "@/styles/global.css";
import "@/styles/vendor.css";

import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
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
        <header>
          <Nav />
        </header>
        {children}
        <Footer />
      </body>
    </html>
  );
}
