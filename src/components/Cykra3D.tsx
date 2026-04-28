// Cykra3D.tsx — Hero-Component für cykrus.at
// Lukas Berger, 2026-04-27 (Tag 0 Spätnacht)
//
// Lazy-loaded R3F-Component. Wird erst nach AVIF-LCP + requestIdleCallback
// gemounted. Auf Mobile mit GPU-Tier <2 fällt sie auf Lottie zurück.
//
// Place at: src/components/Cykra3D.tsx
'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment, ContactShadows } from '@react-three/drei'
import { gsap } from 'gsap'
import type { Group, Object3DEventMap } from 'three'

const MODEL_URL = '/cykra.glb'
const ENV_URL = '/aurora-env.ktx2'

// ── Cykra Mesh ──────────────────────────────────────────
function CykraMesh({ onReady }: { onReady?: () => void }) {
  const group = useRef<Group<Object3DEventMap>>(null)
  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions, mixer } = useAnimations(animations, group)
  const cursor = useRef({ x: 0, y: 0 })
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    // Welcome-Sequenz beim Mount
    if (!actions['Welcome']) return

    const welcome = actions['Welcome']
    welcome.setLoop(2200, 1) // LoopOnce
    welcome.clampWhenFinished = true
    welcome.play()

    const idle = actions['IdleFloat']
    if (idle) {
      idle.fadeIn(0.6).play()
    }

    // GSAP Mood-Light Sweep
    if (group.current) {
      gsap.fromTo(
        group.current.scale,
        { x: 0.92, y: 0.92, z: 0.92 },
        { x: 1, y: 1, z: 1, duration: 1.4, ease: 'power3.out' }
      )
    }

    onReady?.()

    return () => {
      mixer.stopAllAction()
    }
  }, [actions, mixer, onReady])

  // Cursor-Tracking nur Desktop
  useEffect(() => {
    if (isMobile) return
    const onMove = (e: MouseEvent) => {
      cursor.current.x = (e.clientX / window.innerWidth) * 2 - 1
      cursor.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [isMobile])

  // Frame-Loop: Cursor-Tracking auf Dome-Bone
  useFrame((_, delta) => {
    if (!group.current || isMobile) return
    const dome = group.current.getObjectByName('Dome')
    if (dome) {
      const targetY = cursor.current.x * 0.15
      const targetX = cursor.current.y * 0.08
      dome.rotation.y += (targetY - dome.rotation.y) * delta * 2.5
      dome.rotation.x += (targetX - dome.rotation.x) * delta * 2.5
    }
  })

  return <primitive ref={group} object={scene} dispose={null} position={[0, -0.2, 0]} />
}

useGLTF.preload(MODEL_URL)

// ── GPU-Tier Detection ──────────────────────────────────
function useGpuTier() {
  const [tier, setTier] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setTier(0)
      return
    }

    // Lazy-import um Bundle nicht zu belasten
    import('detect-gpu')
      .then(({ getGPUTier }) => getGPUTier())
      .then((result) => setTier(result.tier))
      .catch(() => setTier(2)) // konservativer Default
  }, [])

  return tier
}

// ── Lottie-Fallback (Tier 0/1) ──────────────────────────
function CykraLottie() {
  const [Lottie, setLottie] = useState<React.ComponentType<{ animationData: unknown; loop?: boolean }> | null>(null)
  const [animationData, setAnimationData] = useState<unknown>(null)

  useEffect(() => {
    Promise.all([
      import('lottie-react').then((m) => m.default),
      fetch('/cykra-lottie.json').then((r) => r.json()),
    ]).then(([Lib, data]) => {
      setLottie(() => Lib)
      setAnimationData(data)
    })
  }, [])

  if (!Lottie || !animationData) return null
  return (
    <div className="w-full h-full grid place-items-center">
      <Lottie animationData={animationData} loop className="w-[60vmin] max-w-[480px]" />
    </div>
  )
}

// ── Public Component ────────────────────────────────────
interface Cykra3DProps {
  onReady?: () => void
  className?: string
}

export default function Cykra3D({ onReady, className }: Cykra3DProps) {
  const tier = useGpuTier()
  const [shouldRender3D, setShouldRender3D] = useState(false)

  // Warte auf idle, dann mounten (LCP nicht blockieren)
  useEffect(() => {
    if (tier === null) return
    if (tier < 2) {
      // Tier 0/1 → kein 3D
      return
    }
    const onIdle = () => setShouldRender3D(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(onIdle, { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    } else {
      const t = setTimeout(onIdle, 800)
      return () => clearTimeout(t)
    }
  }, [tier])

  if (tier === null) {
    // Detection läuft — leeres Placeholder, AVIF-LCP ist sichtbar
    return null
  }

  if (tier < 2) {
    return (
      <div className={className}>
        <CykraLottie />
      </div>
    )
  }

  if (!shouldRender3D) return null

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} color="#FFF6E0" />
        <directionalLight position={[-2, 2, -3]} intensity={0.6} color="#E8C76C" />

        <Suspense fallback={null}>
          <Environment files={ENV_URL} />
          <CykraMesh onReady={onReady} />
          <ContactShadows
            position={[0, -1.4, 0]}
            opacity={0.35}
            scale={6}
            blur={2.5}
            far={2}
            color="#2A3A6E"
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
