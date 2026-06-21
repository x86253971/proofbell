import Script from "next/script";

export const metadata = {
  title: "ProofBell live demo",
  description:
    "See the ProofBell social-proof widget running on a sample SaaS landing page.",
};

export default function DemoPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-24">
      <span className="mb-4 inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
        Acme Analytics — sample landing page
      </span>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Analytics your whole team actually uses.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Watch the corner of the screen — that little popup is ProofBell, showing
        real signups and subscriptions as social proof. It cycles every few
        seconds.
      </p>
      <p className="mt-8 text-sm text-muted-foreground">
        This is a live demo powered by ProofBell&apos;s public demo key.
      </p>
      <Script
        src="/embed.js"
        data-key="pk_demo_proofbell"
        strategy="afterInteractive"
      />
    </main>
  );
}
