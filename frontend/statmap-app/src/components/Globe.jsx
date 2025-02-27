import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

import { FaArrowLeft } from "react-icons/fa";

function Globe() {
    
    const navigate = useNavigate();
    const globeRef = useRef();
    //gets the texture loading and make it wraps once without repetittion
    const texture = new THREE.TextureLoader().load("/earth_texture.jpg", (texture) => {
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);
    }, undefined, (err) => {
        console.error('An error occurred loading the texture:', err);
    });
    const handleBack = () => navigate("/play");
    return (
        <div>
            {/* Back Button in top right */}
            <div className="absolute top-10 right-10 z-50">
                <button
                    onClick={handleBack}
                    className="bg-black text-white border border-white rounded-full p-2 hover:bg-white hover:text-black transition-colors"
                >
                    <FaArrowLeft size={40} />
                </button>
            </div>
            <Canvas camera={{ position: [0, 2.0, 2.0], near: 0.1, far: 1000 }} style={{ background: 'black', width: "100vw", height: "100vh" }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[2, 2, 2]} intensity={1.5} />
                <directionalLight position={[-2, -2, -2]} intensity={1.5} />
                <directionalLight position={[-1, 2, 0]} intensity={1.0} />
                <OrbitControls enableZoom={true} enableRotate={true} minDistance={1.0} maxDistance={4} zoomSpeed={0.5} />
                <Stars radius={70} depth={50} count={2000} factor={4} saturation={0} fade />
                <mesh ref={globeRef}>
                    <sphereGeometry args={[1, 50, 50]} />
                    <meshStandardMaterial map={texture} roughness={2} />
                </mesh>
                <RotateGlobe globeRef={globeRef} />
            </Canvas>
        </div>


    );
}

function RotateGlobe({ globeRef }) {
    useFrame(() => {
        if (globeRef.current) {
            globeRef.current.rotation.y += 0.00007;
        }
    });
    return null;
}

export default Globe;