import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

function GlobeTest() {
    //texture loading
    const globeRef = useRef();
    const texture = new THREE.TextureLoader().load("/earth_texture.jpg", (texture) => {
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

function RotateGlobe({ globeRef }) {
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });
  return null;
}

export default GlobeTest;
