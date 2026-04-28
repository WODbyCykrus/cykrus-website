'use client'

/**
 * SplineHero — iframe-Embed des "Reactive Orb"-Modells.
 *
 * Lazy-mounted nach idle damit die Spline-Runtime nicht das LCP blockiert.
 *
 * Maus-Events bleiben aktiv (Orb soll auf Maus + Text reagieren).
 *
 * Embed: https://my.spline.design/reactiveorb-TbGJ7vuYaMh8lAbXAffABW2I/
 *
 * TODO: Farben in Spline auf Cykrus-Palette anpassen
 *   - Königsblau #2A3A6E
 *   - Lavendel  #A088C9
 *   - Gold      #E8C76C
 */

import { useEffect, useState } from 'react'

const SPLINE_URL = 'https://my.spline.design/reactiveorb-TbGJ7vuYaMh8lAbXAffABW2I/'

interface SplineHeroProps {
  className?: string
}

export default function SplineHero({ className }: SplineHeroProps) {
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const mount = () => setShouldMount(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(mount, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    } else {
      const t = setTimeout(mount, 1000)
      return () => clearTimeout(t)
    }
  }, [])

  if (!shouldMount) return null

  return (
    <iframe
      src={SPLINE_URL}
      title="R4X Bot — Cykrus Hero"
      loading="lazy"
      allow="autoplay; fullscreen; xr-spatial-tracking"
      sandbox="allow-scripts allow-same-origin"
      className={className}
      style={{
        border: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        // pointer-events bleibt aktiv: Orb soll auf Maus reagieren
      }}
    />
  )
}
