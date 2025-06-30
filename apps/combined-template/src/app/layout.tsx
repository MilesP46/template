import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../providers/ThemeProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/app.scss';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Combined Template - Doctor Dok',
  description: 'Unified template with advanced theming capabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0d6efd" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider defaultTheme="auto">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}