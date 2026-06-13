"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type * as THREE from "three";

const AGENT_COLORS = ["#eca8d6", "#a5f3fc", "#fbbf24", "#86efac", "#c4b5fd", "#fb923c"];

function DottedSphere({
  radius = 1.1,
  dotCount = 600,
  dotSize = 0.028,
}: {
  radius?: number;
  dotCount?: number;
  dotSize?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const dots = useMemo(() => {
    const positions: { pos: [number, number, number]; color: string }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
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
  }, [radius, dotCount]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.09;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.04) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      {dots.map((d, i) => (
        <mesh key={i} position={d.pos}>
          <sphereGeometry args={[dotSize, 6, 6]} />
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
    if (ref.current) {
      const sc = 1 + Math.sin(s.clock.elapsedTime * 1.6) * 0.025;
      ref.current.scale.set(sc, sc, sc);
    }
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

export function ParticleOrbChat() {
  return (
    <div className="relative w-44 h-44">
      {/* Outer glow */}
      <div
        className="absolute inset-[-25%] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(236,168,214,0.18) 0%, rgba(165,243,252,0.08) 40%, transparent 70%)",
          filter: "blur(20px)",
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 46 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
