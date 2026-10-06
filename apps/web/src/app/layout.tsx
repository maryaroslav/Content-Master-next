import "./globals.css";
import Script from "next/script";
import Providers from "./Providers";
import AuthGuard from "./(auth)/components/AuthGuard";

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <body>
        <Script src="/env.js" strategy="beforeInteractive" />
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
