export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 16 }}>
        <h1>Employees</h1>
        {children}
      </body>
    </html>
  );
}


