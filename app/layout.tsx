import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Youth Empowerment Dashboard | Dunamis",
  description: "Analytics dashboard for Dunamis International Gospel Centre Youth Empowerment Program",
};

// Injected before React hydrates — prevents flash of wrong theme
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('ye-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="page-bg">
        <div className="page-content">
          {children}
        </div>
      </body>
    </html>
  );
}
