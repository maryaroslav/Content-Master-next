import "./globals.css";
import Script from "next/script";
import Providers from "./Providers";

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <body>
        <Script src="/env.js" strategy="beforeInteractive" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
