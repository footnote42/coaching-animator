import { Play, Users, Share2, Download, Shield, Zap } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

export const dynamic = 'force-dynamic';

const FEATURES = [
  {
    icon: Play,
    title: 'Animate Plays',
    description: 'Create frame-by-frame animations of rugby tactics, skills, and game situations with our intuitive drag-and-drop editor.',
  },
  {
    icon: Users,
    title: 'Multiple Sports',
    description: 'Support for Rugby Union, Rugby League, and Touch Rugby with authentic field markings and dimensions.',
  },
  {
    icon: Share2,
    title: 'Share & Discover',
    description: 'Publish your animations to the community gallery and learn from plays shared by coaches worldwide.',
  },
  {
    icon: Download,
    title: 'Export as GIF',
    description: 'Download your animations as high-quality GIF files to share on social media or embed in presentations.',
  },
  {
    icon: Shield,
    title: 'Works Offline',
    description: 'Full offline support means you can create and edit animations anywhere, even without internet access.',
  },
  {
    icon: Zap,
    title: 'Free to Use',
    description: 'Create up to 50 animations for free. Guest users can try the tool instantly with no signup required.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-primary text-text-inverse">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              Visualise Rugby Plays Like Never Before
            </h1>
            <p className="text-lg md:text-xl text-text-inverse/80 mb-8 max-w-2xl">
              Create animated rugby tactics, share with your team, and explore plays from coaches around the world. Free, offline-capable, and built for coaches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/app"
                className="inline-flex items-center justify-center px-8 py-4 bg-accent-warm text-white font-semibold text-lg hover:bg-accent-warm/90 transition-colors"
              >
                Start Creating — It&apos;s Free
              </a>
              <a
                href="/gallery"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-text-inverse/30 text-text-inverse font-semibold text-lg hover:bg-text-inverse/10 transition-colors"
              >
                Browse Gallery
              </a>
            </div>
            <p className="mt-4 text-sm text-text-inverse/60">
              No signup required to try. Create your first animation in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-surface-warm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
              Everything You Need to Coach Better
            </h2>
            <p className="text-lg text-text-primary/70 max-w-2xl mx-auto">
              Built by coaches, for coaches. Our tools help you communicate complex plays simply and effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface border border-border p-6 hover:border-primary transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-primary/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
              Create Animations in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-text-inverse text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">Add Players</h3>
              <p className="text-sm text-text-primary/70">
                Drag and drop attack players, defenders, balls, and markers onto the pitch.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-text-inverse text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">Create Frames</h3>
              <p className="text-sm text-text-primary/70">
                Add frames and move players to show movement. Draw arrows to indicate passing or running lines.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-text-inverse text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">Share & Export</h3>
              <p className="text-sm text-text-primary/70">
                Export as GIF, share a link, or publish to the community gallery for others to learn from.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-text-inverse">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Transform Your Coaching?
          </h2>
          <p className="text-lg text-text-inverse/80 mb-8 max-w-2xl mx-auto">
            Join thousands of rugby coaches using Coaching Animator to create, share, and discover plays.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent-warm text-white font-semibold text-lg hover:bg-accent-warm/90 transition-colors"
            >
              Create Free Account
            </a>
            <a
              href="/app"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-text-inverse/30 text-text-inverse font-semibold text-lg hover:bg-text-inverse/10 transition-colors"
            >
              Try Without Signup
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏉</span>
              <span className="font-heading font-semibold text-text-primary">Coaching Animator</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-text-primary/70">
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
              <a href="/sitemap-page" className="hover:text-primary transition-colors">Site Map</a>
            </div>
            <p className="text-sm text-text-primary/50">
              © {new Date().getFullYear()} Coaching Animator
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
