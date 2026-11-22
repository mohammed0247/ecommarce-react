import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/context/shop-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "FreshCart | Good food. Good mood.", template: "%s | FreshCart" },
  description: "Thoughtful finds for your home, closet and everything in between, delivered fresh by FreshCart.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <ShopProvider>
          <Header />
          <div className="site-content">{children}</div>
          <Footer />
        </ShopProvider>
      </body>
    </html>
  );
}
