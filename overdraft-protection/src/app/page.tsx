import OverdraftDashboard from "@/components/overdraft-dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(69,99,255,0.18),_transparent_60%)]" />
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <OverdraftDashboard />
      </div>
    </div>
  );
}
