export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏉</span>
            <span className="font-heading font-bold text-lg text-primary">Coaching Animator</span>
          </a>
          <a
            href="/app"
            className="px-4 py-2 bg-primary text-text-inverse text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Open Editor
          </a>
        </div>
      </nav>

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
    </div>
  );
}
