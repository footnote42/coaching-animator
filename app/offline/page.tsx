export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-primary mb-4">
          You&apos;re Offline
        </h1>
        <p className="text-lg text-text-primary mb-6">
          The page you requested isn&apos;t available offline. 
          Your animations are still accessible locally.
        </p>
        <a
          href="/app"
          className="inline-block px-6 py-3 bg-primary text-text-inverse font-medium hover:opacity-90 transition-opacity"
        >
          Open Editor
        </a>
      </div>
    </main>
  );
}
