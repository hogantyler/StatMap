import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import EarthMap from "../textures/8k_earth.png"
import * as THREE from "three";

/**
 * Renders a 3D interactive globe with texture mapping, lighting, and user controls.
 * 
 * @returns {JSX.Element} A 3D globe component
 */
function Globe() {
    //texture loading
    const globeRef = useRef();
    const texture = new THREE.TextureLoader().load(EarthMap, (texture) => {
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);
    }, undefined, (err) => {
        console.error("Error loading texture:", err);
    });

    return (
        <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full">
                <Canvas
                    camera={{ position: [0, 2.5, 2.5], near: 0.01, far: 1000 }}
                    style={{ background: "black", width: "100vw", height: "100vh" }}
                >
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[2, 2, 2]} intensity={1.5} />
                    <directionalLight position={[-2, -2, -2]} intensity={1.5} />
                    <directionalLight position={[-1, 2, 0]} intensity={1.0} />
                    <OrbitControls
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={1.05}
                        maxDistance={4}
                        zoomSpeed={0.5}
                    />
                    <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade />
                    <mesh ref={globeRef}>
                        <sphereGeometry args={[1, 50, 50]} />
                        <meshStandardMaterial map={texture} roughness={2} />
                    </mesh>
                    <RotateGlobe globeRef={globeRef} />
                </Canvas>
            </div>
        </div>
    );
}

/**
 * Rotates the 3D globe by updating its rotation on each frame.
 * 
 * @param {*} param0 Object containing a reference to the globe mesh
 * @returns {null} No visual output, only applies rotation effect
 */
function RotateGlobe({ globeRef }) {
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });
  return null;
}

export default Globe;
