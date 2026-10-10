export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Navigation and footer inherited from root layout */}

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {children}
      </main>
    </>
  );
}
