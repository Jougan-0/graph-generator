import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen w-screen flex items-center justify-center bg-gray-900">
        {children}
      </body>
    </html>
  );
}
