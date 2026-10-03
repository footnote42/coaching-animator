import Link from 'next/link';

export default function ContactPage() {
  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-4">Contact Us</h1>
      <p className="text-text-primary/70 mb-4">
        Have a question or need help? Email{' '}
        <a href="mailto:hello@waynetellis.com" className="text-primary hover:underline">
          hello@waynetellis.com
        </a>
        .
      </p>
      <p className="text-text-primary/70">
        Found a bug or have an idea? Use the{' '}
        <Link href="/feedback" className="text-primary hover:underline">
          feedback form
        </Link>
        .
      </p>
    </div>
  );
}
