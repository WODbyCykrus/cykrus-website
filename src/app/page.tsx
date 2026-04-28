import dynamic from 'next/dynamic'

// Spline-Hero (iframe-Embed) lazy laden — keine SSR, mountet nach idle.
const SplineHero = dynamic(() => import('@/components/SplineHero'), { ssr: false })

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cykra-ink">
      {/* Spline-Hero füllt den Hintergrund. Body-bg (cykra-ink) ist der Fallback. */}
      <div className="absolute inset-0">
        <SplineHero className="h-full w-full" />
      </div>

      {/* Text-Overlay (rechts unten) — lässt das Modell zentral wirken */}
      <section className="pointer-events-none relative z-10 flex min-h-screen flex-col justify-end px-6 pb-12 sm:px-12 sm:pb-16">
        <div className="mx-auto w-full max-w-5xl text-center sm:text-left">
          <p className="font-body text-xs uppercase tracking-[0.4em] text-cykra-gold/90 drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]">
            Vault City · World of Dreams
          </p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-cykra-body sm:text-7xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Cykrus
          </h1>
          <p className="mt-3 max-w-xl font-body text-sm text-cykra-body/90 sm:text-base drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Hier entsteht eine Stadt aus Ideen — zwischen Pflege, Code und KI.
          </p>

          <div className="mt-6 flex flex-col items-center gap-2 font-body text-xs text-cykra-body/70 sm:flex-row sm:items-start">
            <span className="rounded-full border border-cykra-gold/40 bg-cykra-ink/40 px-3 py-1 text-cykra-gold backdrop-blur-sm">
              Tag 1.5 · Cykra erwacht
            </span>
            <span className="rounded-full bg-cykra-ink/40 px-3 py-1 backdrop-blur-sm">
              cykrus.at · DNS-Migration folgt
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
