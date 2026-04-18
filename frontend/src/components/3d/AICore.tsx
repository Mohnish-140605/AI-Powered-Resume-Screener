import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function AICore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.15;
    meshRef.current.rotation.z = t * 0.08;
    // Gentle breathing pulse
    const scale = 1 + Math.sin(t * 1.8) * 0.04;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <meshPhysicalMaterial
        color="#6366f1"
        emissive="#818cf8"
        emissiveIntensity={1.5}
        roughness={0.05}
        metalness={0.6}
        clearcoat={1}
        clearcoatRoughness={0.05}
        transmission={0.85}
        thickness={0.6}
      />
    </Sphere>
  );
}
