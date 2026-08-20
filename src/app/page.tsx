import Link from "next/link";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <header className="border-b border-white/15">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="KaneGuard home">
            <span className="flex size-8 items-center justify-center border border-white text-sm font-bold">K</span>
            <span className="font-semibold tracking-tight">KaneGuard</span>
          </Link>
          <Link href="/checkout" className="group flex items-center gap-2 text-sm font-medium text-neutral-300 transition-colors hover:text-white">
            Demo checkout
            <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span>
          </Link>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="relative z-10 animate-[fade-up_700ms_ease-out_both]">
            <div className="mb-7 inline-flex items-center gap-2 border border-white/20 px-3 py-1.5 text-xs text-neutral-300">
              <span className="size-1.5 rounded-full bg-white" />
              Built for AI-assisted development
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-7xl lg:text-[5.5rem]">
              Confidence before <span className="text-neutral-500">completion.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-neutral-400 sm:text-lg">
              KaneGuard checks AI-generated changes against real product behavior before the work is marked done.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/checkout" className="group inline-flex h-12 items-center justify-center gap-2 bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
                Open demo checkout
                <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span>
              </Link>
              <a href="#how-it-works" className="inline-flex h-12 items-center justify-center border border-white/25 px-6 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10">
                How it works
              </a>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-md items-center justify-center py-8 animate-[fade-up_700ms_180ms_ease-out_both]">
            <div className="relative flex aspect-square w-full max-w-[360px] items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-[12%] rounded-full border border-dashed border-white/25 animate-[slow-spin_28s_linear_infinite]" />
              <div className="absolute inset-[26%] rounded-full border border-white/20" />
              <div className="relative flex size-24 items-center justify-center rounded-full border border-white bg-black">
                <div className="flex size-14 items-center justify-center rounded-full bg-white text-black"><CheckIcon /></div>
              </div>
              <div className="absolute left-[4%] top-1/2 w-[92%] overflow-hidden border-t border-white/15">
                <span className="block h-px w-1/4 bg-white animate-[scan_4s_ease-in-out_infinite]" />
              </div>
              <span className="absolute left-[4%] top-[22%] font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">change detected</span>
              <span className="absolute bottom-[18%] right-[1%] font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">check passed</span>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-white/15 bg-[#070707]">
          <div className="mx-auto grid max-w-6xl divide-y divide-white/15 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              ["01", "Detect", "A code change signals that new behavior is ready to be checked."],
              ["02", "Verify", "The expected behavior is tested against the running application."],
              ["03", "Continue", "Work moves forward only after the expected result is confirmed."],
            ].map(([number, title, copy]) => (
              <article key={number} className="py-9 md:px-8 md:first:pl-0 md:last:pr-0">
                <p className="font-mono text-xs text-neutral-600">{number}</p>
                <h2 className="mt-5 text-xl font-semibold">{title}</h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 px-5 py-16 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-neutral-500">See the test surface in action.</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Try the demo checkout.</h2>
          </div>
          <Link href="/checkout" className="group inline-flex h-12 items-center justify-center gap-2 border border-white px-6 text-sm font-semibold transition-colors hover:bg-white hover:text-black">
            Go to checkout
            <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span>
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-xs text-neutral-600 sm:px-8">
          <span>KaneGuard</span>
          <span>Verify before done.</span>
        </div>
      </footer>
    </div>
  );
}
