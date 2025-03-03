import type { Metadata } from 'next';
import Navigation from '../components/Navigation';

export const metadata: Metadata = {
  title: 'PoE Tools - Item Search & Currency Exchange',
  description: 'Check prices for Path of Exile items and currency exchange rates in the Phrecia league',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-[#0c0c0e]" style={{ 
        backgroundImage: 'linear-gradient(to bottom, #0c0c0e, #151515, #0c0c0e)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        fontFamily: '"Fontin SmallCaps", "Fontin-SmallCaps", Verdana, Arial, Helvetica, sans-serif'
      }}>

        <main>
          {children}
        </main>
        <footer className="mt-12 text-center text-[#7f7f7f] text-sm py-6 border-t border-[#3d3d3d]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>Data sourced from the official Path of Exile trade API</p>
            <p className="mt-1">
              Not affiliated with Grinding Gear Games
            </p>
            <p className="mt-1">
              &copy; {new Date().getFullYear()} PoE Tools
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
