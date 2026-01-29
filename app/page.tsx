export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Coaching Animator
        </h1>
        <p className="text-lg text-text-primary mb-8">
          Rugby Play Visualization Tool
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/app"
            className="px-6 py-3 bg-primary text-text-inverse font-medium hover:opacity-90 transition-opacity"
          >
            Open Editor
          </a>
          <a
            href="/gallery"
            className="px-6 py-3 border border-primary text-primary font-medium hover:bg-primary hover:text-text-inverse transition-colors"
          >
            Browse Gallery
          </a>
        </div>
      </div>
    </main>
  );
}
