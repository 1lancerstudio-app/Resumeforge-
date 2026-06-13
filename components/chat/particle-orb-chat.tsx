"use client";

import { useRef, useMemo, useState, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type * as THREE from "three";

// ─── CSS fallback orb (shown if WebGL fails) ─────────────────────────────────

function CSSOrb() {
  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      {/* Outer rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-white/10"
          style={{
            width:  `${(i + 1) * 48}px`,
            height: `${(i + 1) * 48}px`,
            animation: `spin ${8 + i * 4}s linear infinite ${i % 2 ? "reverse" : ""}`,
          }}
        />
      ))}
      {/* Colored dots orbiting */}
      {["#eca8d6", "#a5f3fc", "#fbbf24", "#86efac", "#c4b5fd", "#fb923c"].map((color, i) => (
        <div
          key={color}
          className="absolute w-[6px] h-[6px] rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 8px ${color}`,
            top: "50%",
            left: "50%",
            transformOrigin: `${32 + i * 8}px 0`,
            transform: `translateY(-50%)`,
            animation: `orbit-dot ${5 + i * 1.2}s linear infinite`,
            animationDelay: `${-i * 0.9}s`,
          }}
        />
      ))}
      {/* Core */}
      <div
        className="w-3 h-3 rounded-full bg-white z-10"
        style={{ boxShadow: "0 0 16px #fff, 0 0 32px rgba(236,168,214,0.6)" }}
      />
    </div>
  );
}

// ─── Three.js dotted sphere ───────────────────────────────────────────────────

const AGENT_COLORS = ["#eca8d6", "#a5f3fc", "#fbbf24", "#86efac", "#c4b5fd", "#fb923c"];

function DottedSphere() {
  const groupRef = useRef<THREE.Group>(null);

  const dots = useMemo(() => {
    const positions: { pos: [number, number, number]; color: string }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    const dotCount = 600;
    const radius = 1.1;
    for (let i = 0; i < dotCount; i++) {
      const y = 1 - (i / (dotCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      positions.push({
        pos: [Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius],
        color: AGENT_COLORS[i % AGENT_COLORS.length],
      });
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.09;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.04) * 0.12;
  });

  return (
    <group ref={groupRef}>
      {dots.map((d, i) => (
        <mesh key={i} position={d.pos}>
          <sphereGeometry args={[0.028, 6, 6]} />
          <meshStandardMaterial
            color={d.color}
            emissive={d.color}
            emissiveIntensity={0.9}
            metalness={0.8}
            roughness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

function GlowCore() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const sc = 1 + Math.sin(s.clock.elapsedTime * 1.6) * 0.025;
    ref.current.scale.set(sc, sc, sc);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.12, 32, 32]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} metalness={0.4} roughness={0.1} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={1.8} color="#eca8d6" />
      <pointLight position={[-4, -4, -4]} intensity={1.2} color="#a5f3fc" />
      <pointLight position={[0, 0, 4]} intensity={1.4} color="#fbbf24" />
      <GlowCore />
      <DottedSphere />
    </>
  );
}

// ─── React error boundary ─────────────────────────────────────────────────────

class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ─── Public export ────────────────────────────────────────────────────────────

export function ParticleOrbChat() {
  const [webglReady, setWebglReady] = useState(true);

  return (
    <div className="relative w-44 h-44">
      {/* Ambient glow behind the orb */}
      <div
        className="absolute inset-[-25%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(236,168,214,0.18) 0%, rgba(165,243,252,0.08) 40%, transparent 70%)",
          filter: "blur(20px)",
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
      />

      {webglReady ? (
        <CanvasErrorBoundary fallback={<CSSOrb />}>
          <Canvas
            camera={{ position: [0, 0, 3.8], fov: 46 }}
            style={{ background: "transparent", width: "100%", height: "100%" }}
            gl={{ alpha: true, antialias: true, failIfMajorPerformanceCaveat: false }}
            onCreated={({ gl }) => {
              if (!gl) setWebglReady(false);
            }}
          >
            <Scene />
          </Canvas>
        </CanvasErrorBoundary>
      ) : (
        <CSSOrb />
      )}
    </div>
  );
}
