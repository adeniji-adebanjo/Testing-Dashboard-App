// src/app/public/layout.tsx
// Public layout without sidebar - clean read-only experience

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
