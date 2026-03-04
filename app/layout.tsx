// Root layout — the html/body are rendered in [locale]/layout.tsx
// This is intentional for next-intl locale-aware HTML lang attribute.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
