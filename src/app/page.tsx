import Link from "next/link";

const steps = [
  {
    n: "1",
    t: "Paste one snippet",
    d: "Drop a single <script> tag on your site. No build step, no npm install.",
  },
  {
    n: "2",
    t: "Connect Stripe",
    d: "Read-only. New subscriptions and purchases become live proof automatically.",
  },
  {
    n: "3",
    t: "Convert more visitors",
    d: "Real-time toasts — “Someone in Tokyo just subscribed” — build trust and FOMO.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-lg font-bold">ProofBell</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
          <Link href="/login">
            <span className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">
              Start free
            </span>
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
        <p className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Social proof built for SaaS — not Shopify
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Show real signups & subscriptions, live on your site
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          ProofBell turns your Stripe activity into live social-proof
          notifications. One snippet, connect Stripe, done. Pay once — no
          monthly fees.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/login">
            <span className="inline-flex h-10 items-center rounded-lg bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/80">
              Start free
            </span>
          </Link>
          <a
            href="#pricing"
            className="inline-flex h-10 items-center rounded-lg border border-border px-6 font-medium hover:bg-muted"
          >
            See pricing
          </a>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Free plan for one site · $49 lifetime for unlimited
        </p>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-border p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 font-bold text-white">
                {s.n}
              </div>
              <h3 className="font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">
          Simple, one-time pricing
        </h2>
        <div className="mx-auto mt-8 grid max-w-2xl gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-6">
            <h3 className="font-semibold">Free</h3>
            <p className="mt-1 text-3xl font-bold">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>1 site</li>
              <li>Stripe connection</li>
              <li>ProofBell badge</li>
            </ul>
            <Link href="/login">
              <span className="mt-6 inline-flex h-9 w-full items-center justify-center rounded-lg border border-border font-medium hover:bg-muted">
                Get started
              </span>
            </Link>
          </div>
          <div className="rounded-xl border-2 border-primary p-6">
            <h3 className="font-semibold">Lifetime</h3>
            <p className="mt-1 text-3xl font-bold">
              $49{" "}
              <span className="text-base font-normal text-muted-foreground">
                once
              </span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Unlimited sites</li>
              <li>Remove ProofBell badge</li>
              <li>No subscription, ever</li>
            </ul>
            <Link href="/login">
              <span className="mt-6 inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground hover:bg-primary/80">
                Go lifetime
              </span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl px-6 py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ProofBell · Pay once, embed forever
      </footer>
    </main>
  );
}
