import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "News Web App",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="text-text-primary bg-background">
          <Navbar />
          <main className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex-1">{children}</div>
          </main>

          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
