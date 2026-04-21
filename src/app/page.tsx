import Link from "next/link";
import { Gavel, Shield, Zap, Scale } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <header className="px-6 lg:px-12 h-20 flex items-center border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            LAWYER DIARY
          </span>
        </Link>
        <nav className="ml-auto flex gap-6 mt-1">
          <Link href="/login" className="text-sm font-medium hover:text-indigo-400 transition-colors">
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-all transform hover:scale-105"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold tracking-widest uppercase">
            <Zap className="w-3 h-3 fill-current" />
            Backend First Legal Engine
          </div>
          
          <h1 className="text-5xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
            Your Digital Court Brain. <br /> Built for the Elite.
          </h1>
          
          <p className="text-zinc-400 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            The premium Lawyer Case Diary SaaS. Real-time updates, automated reminders, 
            and a developer-level dashboard for modern legal professionals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white font-bold text-lg hover:bg-white/10 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto pb-24">
          <FeatureCard 
            icon={<Gavel className="w-8 h-8 text-indigo-500" />}
            title="Case Management"
            description="Track every hearing, every document, and every judge with a premium visual timeline."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-indigo-500" />}
            title="Encryption First"
            description="Bank-grade security. Your client data is protected by JWT + HttpOnly protocols."
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-indigo-500" />}
            title="Real-time Engine"
            description="Integrated with the Optimizer Suite for instant UI revalidation without refreshing."
          />
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-zinc-500 text-sm">
        &copy; 2026 Lawyer Diary SaaS. Powering the future of law.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl hover:bg-zinc-900/80 transition-all group">
      <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
