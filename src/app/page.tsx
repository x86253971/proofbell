export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        {"ProofBell"}
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">{"Social proof and live-activity widget for indie SaaS founders. Connect Stripe to show recent signups, subscribes, and live user counts. Pay once, embed forever."}</p>
      <a
        href="#pricing"
        className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground"
      >
        Get started
      </a>
    </main>
  );
}
