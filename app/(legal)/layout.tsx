export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Navigation inherited from root layout */}

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-text-primary/70">
            <a href="/" className="hover:text-primary">← Back to Home</a>
            <div className="flex items-center gap-4">
              <a href="/terms" className="hover:text-primary">Terms</a>
              <a href="/privacy" className="hover:text-primary">Privacy</a>
              <a href="/contact" className="hover:text-primary">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
