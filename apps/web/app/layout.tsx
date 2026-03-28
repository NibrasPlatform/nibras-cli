import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nibras",
  description: "Hosted GitHub-linked CLI and dashboard for project workflows."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = window.localStorage.getItem("nibras.theme");
                  document.documentElement.setAttribute("data-theme", stored || "light");
                } catch (error) {
                  document.documentElement.setAttribute("data-theme", "light");
                }
              })();
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}
