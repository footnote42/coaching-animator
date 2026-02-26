export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden bg-black">{children}</div>
  );
}
