export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black font-sans text-white">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-10 -top-10 h-96 w-96 rounded-full bg-purple-500/20 blur-[128px] animate-pulse-slow" />
        <div className="absolute -right-10 top-1/2 h-96 w-96 rounded-full bg-cyan-500/20 blur-[128px] animate-pulse-slow delay-1000" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-blue-600/20 blur-[100px] animate-pulse-slow delay-700" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md p-4">
        {children}
      </div>
    </div>
  );
}
