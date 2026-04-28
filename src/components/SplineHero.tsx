'use client'

/**
 * SplineHero — iframe-Embed des R4X-Bot-Modells (CC0).
 *
 * Lazy-mounted nach idle damit die Spline-Runtime nicht das LCP blockiert.
 *
 * Mouse-Tracking-Hack: pointer-events:none auf dem iframe blockiert alle
 * Maus-Events Richtung Spline → das Default-Mouse-Tracking-Verhalten
 * (Kopf kippt horizontal beim Hover) wird damit deaktiviert. Bot bleibt
 * in Idle-Pose. Eigene Animation/Cursor-Tracking ginge nur wenn das
 * File in einem Spline-Account dupliziert + via @splinetool/react-spline
 * geladen würde.
 *
 * Quelle: https://community.spline.design/file/a38eafa0-2fa5-4630-983f-6940475adf5e
 * Embed:  https://my.spline.design/r4xbot-NUpL74jFCXzMcWQjeDqOFnj3/
 */

import { useEffect, useState } from 'react'

const SPLINE_URL = 'https://my.spline.design/r4xbot-NUpL74jFCXzMcWQjeDqOFnj3/'

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
        pointerEvents: 'none', // ← stoppt Mouse-Tracking-Animation
      }}
    />
  )
}
