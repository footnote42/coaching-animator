export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] overflow-hidden bg-black flex items-center justify-center">
      {children}
    </div>
  );
}
