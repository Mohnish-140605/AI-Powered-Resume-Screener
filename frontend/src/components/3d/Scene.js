import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Canvas } from '@react-three/fiber';
import { Environment, Float, Sparkles } from '@react-three/drei';
import { AICore } from './AICore';
export function Scene() {
    return (_jsxs("div", { className: "fixed inset-0 z-0 pointer-events-none", children: [_jsxs(Canvas, { camera: { position: [0, 0, 8], fov: 45 }, children: [_jsx("ambientLight", { intensity: 0.3 }), _jsx("directionalLight", { position: [10, 10, 5], intensity: 1.5, color: "#818cf8" }), _jsx("directionalLight", { position: [-10, -10, -5], intensity: 1.0, color: "#a78bfa" }), _jsx("pointLight", { position: [5, -5, 3], intensity: 2, color: "#06b6d4", distance: 6 }), _jsx(Float, { speed: 1.5, rotationIntensity: 0.3, floatIntensity: 0.6, children: _jsx(AICore, {}) }), _jsx(Sparkles, { count: 80, scale: 12, size: 1.2, speed: 0.25, opacity: 0.25, color: "#818cf8" }), _jsx(Environment, { preset: "city" })] }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void-base/80 pointer-events-none z-10" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-void-base/60 via-transparent to-void-base/60 pointer-events-none z-10" })] }));
}
