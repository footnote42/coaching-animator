import { Navigation } from '@/components/Navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="simple" />
      <div className="flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-sm text-text-primary/70">Rugby Play Visualisation</p>
          </div>
          <div className="bg-surface border border-border p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
