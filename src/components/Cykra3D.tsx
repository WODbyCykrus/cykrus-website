'use client'

/**
 * Cykra3D — Hero-Komponente.
 *
 * Tag 1.5: Vollständig in R3F gebaut, kein Spline-GLB nötig.
 * Geometry-Spec: VaultCity/05 Werkstatt-Gasse/001-cykrus-relaunch/Konzept/spline-modeling-spec.md
 * Mood-Board B "Spline Playful Royal" — final freigegeben 2026-04-27.
 *
 * Aufbau:
 *  - Body: Eiform (Sphere skaliert), cremeweiß PBR + Subsurface-ähnlich via Sheen
 *  - Dome: Halbkugel, Glass-Material (transmission)
 *  - Aurora: Inner-Sphere mit Emissive-Gradient (vertex-color)
 *  - Kintsugi-Adern: 3 TubeGeometries entlang Catmull-Rom-Kurven
 *  - Diadem: TorusGeometry + 4 Cone-Spitzen (asymmetrisch)
 *
 * Animation:
 *  - Idle-Float: 6s sin-wave Y + minimaler Y-rotation
 *  - Welcome: GSAP Scale-In + Bow-Tilt
 *  - Cursor-Track: Dome rotiert sanft zum Mauszeiger (nur Desktop)
 *  - Aurora-Pulse: Emissive-Intensity sin-wave 4s
 */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { gsap } from 'gsap'
import * as THREE from 'three'

// ── Farb-Palette (Mood-Board B) ─────────────────────────
const PALETTE = {
  body: '#F5F1E8',       // cremeweiß
  bodySSS: '#FFF6E0',    // warmer Subsurface-Ton
  gold: '#E8C76C',       // Kintsugi + Diadem
  domeTint: '#FFFFFF',   // Glas neutral
  auroraBlue: '#2A3A6E', // Königsblau
  auroraLavender: '#A088C9',
  auroraGold: '#E8C76C',
  rubin: '#2A3A6E',      // Diadem-Stein-Akzent
} as const

// ── Aurora-Inner-Sphere (Vertex-Color-Gradient + Emissive) ──
function AuroraInner({ pulseRef }: { pulseRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  // Geometrie mit Vertex-Colors für Gradient (unten Blau → Mitte Lavendel → oben Gold)
  const geom = useMemo(() => {
    const g = new THREE.SphereGeometry(0.45, 48, 48)
    const colors: number[] = []
    const c0 = new THREE.Color(PALETTE.auroraBlue)
    const c1 = new THREE.Color(PALETTE.auroraLavender)
    const c2 = new THREE.Color(PALETTE.auroraGold)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) // -0.45..0.45
      const t = (y + 0.45) / 0.9 // 0..1
      const c = new THREE.Color()
      if (t < 0.5) c.lerpColors(c0, c1, t * 2)
      else c.lerpColors(c1, c2, (t - 0.5) * 2)
      colors.push(c.r, c.g, c.b)
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return g
  }, [])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    // 4s-Pulse, mid 1.2, range ±0.4
    const t = clock.getElapsedTime()
    const pulse = 1.2 + Math.sin(t * (Math.PI * 2) / 4) * 0.4
    matRef.current.emissiveIntensity = pulse * pulseRef.current
  })

  return (
    <mesh ref={meshRef} geometry={geom} position={[0, 1.55, 0]}>
      <meshStandardMaterial
        ref={matRef}
        vertexColors
        emissive={'#ffffff'}
        emissiveIntensity={1.2}
        roughness={1}
        metalness={0}
        toneMapped={false}
      />
    </mesh>
  )
}

// ── Dome (Glass) ────────────────────────────────────────
function Dome() {
  // Halbkugel: Sphere mit thetaLength = π/2 (oberer Halbraum)
  const geom = useMemo(
    () => new THREE.SphereGeometry(0.6, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    []
  )
  return (
    <mesh geometry={geom} position={[0, 1.4, 0]} castShadow>
      <meshPhysicalMaterial
        color={PALETTE.domeTint}
        transmission={0.92}
        thickness={0.05}
        roughness={0.05}
        ior={1.45}
        clearcoat={1}
        clearcoatRoughness={0.08}
        attenuationColor={PALETTE.auroraLavender}
        attenuationDistance={2}
        transparent
        opacity={1}
      />
    </mesh>
  )
}

// ── Diadem (Ring + 4 asymmetrische Spitzen) ─────────────
function Diadem() {
  // Ring schwebt 0.05 über dem Dome (Dome top = y=1.4 + r=0.6 = 2.0)
  const ringY = 2.05
  // 4 Spitzen — asymmetrisch verteilt, höchste vorne mittig
  const spikes = useMemo(
    () => [
      { angle: 0, height: 0.12, isFront: true },          // vorne mittig — Y-Glyph
      { angle: Math.PI * 0.55, height: 0.08, isFront: false },
      { angle: Math.PI * 1.05, height: 0.06, isFront: false },
      { angle: Math.PI * 1.5, height: 0.07, isFront: false },
    ],
    []
  )

  return (
    <group position={[0, 0, 0]}>
      {/* Ring */}
      <mesh position={[0, ringY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.435, 0.012, 16, 64]} />
        <meshStandardMaterial
          color={PALETTE.gold}
          metalness={1}
          roughness={0.08}
          emissive={PALETTE.gold}
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Spitzen */}
      {spikes.map((s, i) => {
        const x = Math.cos(s.angle) * 0.435
        const z = Math.sin(s.angle) * 0.435
        return (
          <group key={i} position={[x, ringY, z]}>
            <mesh position={[0, s.height / 2, 0]}>
              <coneGeometry args={[0.018, s.height, 12]} />
              <meshStandardMaterial
                color={PALETTE.gold}
                metalness={1}
                roughness={0.1}
                emissive={PALETTE.gold}
                emissiveIntensity={0.08}
              />
            </mesh>
            {/* Front-Spitze: Rubin-Punkt für Y-Glyph-Akzent */}
            {s.isFront && (
              <mesh position={[0, s.height + 0.012, 0]}>
                <sphereGeometry args={[0.018, 16, 16]} />
                <meshStandardMaterial
                  color={PALETTE.rubin}
                  metalness={0.4}
                  roughness={0.15}
                  emissive={PALETTE.rubin}
                  emissiveIntensity={0.5}
                />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

// ── Kintsugi-Adern (3 Tubes auf Catmull-Rom-Kurven) ─────
function KintsugiVeins() {
  const tubes = useMemo(() => {
    // Adern liegen leicht über dem Body (radial offset ~1.01)
    const veinPaths: THREE.Vector3[][] = [
      // Ader 1: Schulter rechts → diagonal nach Bauch links
      [
        new THREE.Vector3(0.45, 1.05, 0.15),
        new THREE.Vector3(0.30, 0.80, 0.30),
        new THREE.Vector3(0.05, 0.55, 0.40),
        new THREE.Vector3(-0.20, 0.30, 0.35),
        new THREE.Vector3(-0.35, 0.10, 0.20),
      ],
      // Ader 2: Hüfte links → schräg nach Schulter links (kürzer)
      [
        new THREE.Vector3(-0.45, 0.20, 0.10),
        new THREE.Vector3(-0.50, 0.50, 0.20),
        new THREE.Vector3(-0.40, 0.85, 0.25),
        new THREE.Vector3(-0.30, 1.05, 0.18),
      ],
      // Ader 3: Brust V-Akzent (vorne, kurz, dekorativ)
      [
        new THREE.Vector3(-0.10, 0.95, 0.50),
        new THREE.Vector3(0.0, 0.78, 0.55),
        new THREE.Vector3(0.10, 0.95, 0.50),
      ],
    ]
    return veinPaths.map((points) => {
      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
      return new THREE.TubeGeometry(curve, 64, 0.014, 8, false)
    })
  }, [])

  return (
    <group>
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial
            color={PALETTE.gold}
            metalness={0.85}
            roughness={0.18}
            emissive={PALETTE.gold}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Body (Eiform via skalierte Sphere) ──────────────────
function Body() {
  // Sphere skaliert: Höhe 1.8, Breite 1.2, Tiefe 1.0 — Pivot Bauchnabel
  return (
    <mesh position={[0, 0.6, 0]} scale={[0.6, 0.9, 0.5]} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        color={PALETTE.body}
        roughness={0.35}
        metalness={0.05}
        sheen={0.6}
        sheenColor={PALETTE.bodySSS}
        sheenRoughness={0.4}
        clearcoat={0.2}
        clearcoatRoughness={0.5}
      />
    </mesh>
  )
}

// ── Cykra-Mesh-Wrapper (Animation + Cursor-Track) ───────
interface CykraMeshProps {
  isMobile: boolean
  onReady?: () => void
}

function CykraMesh({ isMobile, onReady }: CykraMeshProps) {
  const root = useRef<THREE.Group>(null)
  const dome = useRef<THREE.Group>(null)
  const cursor = useRef({ x: 0, y: 0 })
  const auroraPulse = useRef(1)

  // Welcome-Geste via GSAP
  useEffect(() => {
    if (!root.current) return
    const tl = gsap.timeline({ onComplete: () => onReady?.() })
    tl.fromTo(
      root.current.scale,
      { x: 0.92, y: 0.92, z: 0.92 },
      { x: 1, y: 1, z: 1, duration: 1.2, ease: 'power3.out' }
    )
    // Bow-Tilt: leichte Verbeugung 3°, dann zurück
    tl.to(
      root.current.rotation,
      { x: THREE.MathUtils.degToRad(3), duration: 0.4, ease: 'sine.inOut' },
      0.2
    ).to(
      root.current.rotation,
      { x: 0, duration: 0.5, ease: 'sine.inOut' },
      0.7
    )
    // Aurora-Welcome-Boost
    auroraPulse.current = 1.4
    gsap.to(auroraPulse, { current: 1, duration: 1.2, delay: 0.3, ease: 'sine.out' })

    return () => {
      tl.kill()
    }
  }, [onReady])

  // Cursor-Track (Desktop only)
  useEffect(() => {
    if (isMobile) return
    const onMove = (e: MouseEvent) => {
      cursor.current.x = (e.clientX / window.innerWidth) * 2 - 1
      cursor.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [isMobile])

  // Idle-Float + Cursor-Track
  useFrame(({ clock }, delta) => {
    if (!root.current) return
    const t = clock.getElapsedTime()
    // Idle-Float: 6s Y-Bob ±0.04, Y-Rot ±1°
    root.current.position.y = Math.sin((t * Math.PI * 2) / 6) * 0.04
    root.current.rotation.y = Math.sin((t * Math.PI * 2) / 6) * THREE.MathUtils.degToRad(1)

    // Cursor-Tracking auf Dome
    if (dome.current && !isMobile) {
      const targetY = cursor.current.x * 0.18
      const targetX = cursor.current.y * 0.10
      dome.current.rotation.y += (targetY - dome.current.rotation.y) * delta * 2.5
      dome.current.rotation.x += (targetX - dome.current.rotation.x) * delta * 2.5
    }
  })

  return (
    <group ref={root} position={[0, -0.4, 0]}>
      <Body />
      <KintsugiVeins />
      <group ref={dome}>
        <Dome />
        <AuroraInner pulseRef={auroraPulse} />
        <Diadem />
      </group>
    </group>
  )
}

// ── Reduced-Motion Detection ────────────────────────────
function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// ── Public Component ────────────────────────────────────
interface Cykra3DProps {
  onReady?: () => void
  className?: string
}

export default function Cykra3D({ onReady, className }: Cykra3DProps) {
  const reduced = useReducedMotion()
  const [shouldRender, setShouldRender] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Mobile-Detection + Mount (kein idle-callback mehr — Static-Export hat Cache-Probleme)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsMobile(window.innerWidth < 768)
    setShouldRender(true)
  }, [])

  if (!shouldRender) return null

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        performance={{ min: 0.5 }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {/* kein color attach=background — wir wollen den Aurora-Layer durchscheinen lassen */}

        {/* Key: warm white von vorne-rechts */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 2]} intensity={1.5} color="#FFF6E0" castShadow />
        {/* Fill: kühles Blau von vorne-links */}
        <directionalLight position={[-2, 2, -3]} intensity={0.7} color="#5C7BB5" />
        {/* Rim: warmes Gold von hinten — Diadem-Glow */}
        <directionalLight position={[0, 3, -4]} intensity={1.0} color={PALETTE.gold} />
        {/* Bottom-Bounce: leichter Lavendel-Fill von unten für Body-Subsurface */}
        <pointLight position={[0, -2, 1]} intensity={0.3} color={PALETTE.auroraLavender} />

        <Suspense fallback={null}>
          <CykraMesh isMobile={isMobile} onReady={reduced ? undefined : onReady} />
          <ContactShadows
            position={[0, -1.0, 0]}
            opacity={0.35}
            scale={6}
            blur={2.5}
            far={2}
            color="#1A1A2E"
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
