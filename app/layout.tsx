import type { Metadata } from "next";
import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ThemeProvider } from "./components/ThemeWrapper";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Civintel",
  description: "Community-driven discovery of hidden gems",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={` antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation session={session} />
          <main>{children}</main>
          <Footer />
          <Toaster/>
        </ThemeProvider>
      </body>
    </html>
  );
}
