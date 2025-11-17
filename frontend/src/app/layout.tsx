import "./globals.css";
import Providers from "./Providers";
import AuthGuard from "./(auth)/components/AuthGuard";

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
