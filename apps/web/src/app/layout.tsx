import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Poppins } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import Providers from "./Providers";

const poppins = Poppins({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], display: "swap", variable: "--font-poppins" });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={poppins.variable} suppressHydrationWarning>
      <body>
        <Script src="/env.js" strategy="beforeInteractive" />
        {/* enableCssLayer puts MUI's styles in a cascade layer, so the unlayered CSS of screens not yet migrated still wins. */}
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <NextIntlClientProvider>
            <Providers>
              {children}
            </Providers>
          </NextIntlClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
