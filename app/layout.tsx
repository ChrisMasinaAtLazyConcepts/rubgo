// app/layout.tsx
export const metadata = {
  title: 'RubHub - Massages on the go',
  description: 'Massage on demand system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}