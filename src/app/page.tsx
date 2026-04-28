import dynamic from 'next/dynamic'

// Cykra3D ist 'use client' + Canvas. Hier dynamisch laden ohne SSR.
const Cykra3D = dynamic(() => import('@/components/Cykra3D'), { ssr: false })

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cykra-ink">
      {/* Layer 1 — Aurora-Glow (hinten) */}
      <div className="absolute inset-0 bg-cykra-aurora opacity-40" aria-hidden />

      {/* Layer 2 — Cykra-3D-Hero (drüber) */}
      <div className="absolute inset-0">
        <Cykra3D className="h-full w-full" />
      </div>

      {/* Layer 3 — Text (oben drauf) */}
      <section className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p className="font-body text-xs uppercase tracking-[0.4em] text-cykra-gold/80">
          Vault City · World of Dreams
        </p>
        <h1 className="mt-6 font-display text-5xl leading-tight text-cykra-body sm:text-7xl">
          Cykrus
        </h1>
        <p className="mt-4 max-w-xl font-body text-base text-cykra-body/80 sm:text-lg">
          Hier entsteht eine Stadt aus Ideen — zwischen Pflege, Code und KI.
          Die Türme stehen, die Lichter werden gerade angezündet.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 font-body text-sm text-cykra-body/60">
          <span className="rounded-full border border-cykra-gold/40 px-4 py-1 text-cykra-gold backdrop-blur-sm">
            Tag 1.5 · Cykra erwacht
          </span>
          <span className="backdrop-blur-sm">cykrus.at · DNS-Migration folgt</span>
        </div>
      </section>
    </main>
  )
}
