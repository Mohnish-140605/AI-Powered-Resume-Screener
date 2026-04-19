import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
export function AICore() {
    const meshRef = useRef(null);
    useFrame((state) => {
        if (!meshRef.current)
            return;
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.y = t * 0.15;
        meshRef.current.rotation.z = t * 0.08;
        // Gentle breathing pulse
        const scale = 1 + Math.sin(t * 1.8) * 0.04;
        meshRef.current.scale.set(scale, scale, scale);
    });
    return (_jsx(Sphere, { ref: meshRef, args: [1, 64, 64], children: _jsx("meshPhysicalMaterial", { color: "#6366f1", emissive: "#818cf8", emissiveIntensity: 1.5, roughness: 0.05, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.05, transmission: 0.85, thickness: 0.6 }) }));
}
