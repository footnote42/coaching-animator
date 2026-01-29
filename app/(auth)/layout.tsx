export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-primary">Coaching Animator</h1>
          </a>
          <p className="text-sm text-text-primary/70 mt-1">Rugby Play Visualization</p>
        </div>
        <div className="bg-surface border border-border p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
