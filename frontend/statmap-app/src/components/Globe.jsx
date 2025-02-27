import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import HoverDropMenu from "./HoverDropMenu";
import { FaArrowLeft } from "react-icons/fa";

function Globe() {
    const [isModalOpen, setIsModalOpen] = useState(false); //modal for side bar menu
    const [score, setScore] = useState(0);
    const navigate = useNavigate();

    const handleOpenModal = () => {
        console.log("Opening modal");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        console.log("Modal close handler called");
        setIsModalOpen(false);
    };

    const handleBack = () => navigate("/play");
    const globeRef = useRef();
    //gets the texture loading and make it wraps once without repetittion
    const texture = new THREE.TextureLoader().load("/earth_texture.jpg", (texture) => {
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);
    }, undefined, (err) => {
        console.error('An error occurred loading the texture:', err);
    });

    return (
        <div className="relative w-full h-full">
            {/* Back Button in top right */}
            <div className="absolute top-5 right-5 z-50">
                <button
                    onClick={handleBack}
                    className="bg-black text-white border border-white rounded-full p-2 hover:bg-white hover:text-black transition-colors"
                >
                    <FaArrowLeft size={40} />
                </button>
            </div>
            <div className="absolute top-0 left-0 z-50">
                <HoverDropMenu onSignInClick={handleOpenModal} />
            </div>

            <div className="flex justify-center">
                {/* Overlay container */}
                <div className="z-50 self-center bg-white bg-opacity-0 p-12 rounded-xl w-11/12 max-w-3xl shadow-lg">
                    {/* Score Display Above the Fact */}
                    <div className="mb-4 text-center font-bold text-white text-xl">
                        Score: {score}
                    </div>
                    {/* Instruction text */}
                    <div className="mb-4 text-center text-md text-white">
                        Guess the country based on the fact!
                    </div>
                    <div className="mb-6 p-4 border border-white rounded">
                        <p className="text-center font-semibold text-md text-white">fact goes here</p>
                    </div>
                </div>
            </div>


            <div className="absolute top-0 left-0 w-full h-full">
                <Canvas
                    camera={{ position: [0, 2.0, 2.0], near: 0.1, far: 1000 }}
                    style={{ background: "black", width: "100vw", height: "100vh" }}
                >
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[2, 2, 2]} intensity={1.5} />
                    <directionalLight position={[-2, -2, -2]} intensity={1.5} />
                    <directionalLight position={[-1, 2, 0]} intensity={1.0} />
                    <OrbitControls
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={1.0}
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
            globeRef.current.rotation.y += 0.00007;
        }
    });
    return null;
}

export default Globe;