import React,{ useRef, useState, useEffect, useMemo, useCallback, memo } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { Perf } from 'r3f-perf'
//import ConicGlobe from "./TestComponents/ConicGlobe";
import AtmosphereMesh from "./AtmosphereMesh";
import EarthTest from "../TestComponents/EarthTest";

/**
 * For showing 3D globe background on landing page
 * 
 * @returns A Canvas component that encapsulates 3D components including the earth, lights, stars, etc.
 */
const LandingGlobe = React.memo(function LandingGlobe(props) {
    
    const [showPerformance, setShowPerformance] = useState(false);
    const NoOffSet = true;

    const globeRef = useRef();
    const cloudsRef = useRef();
    const controlsRef = useRef();
    
    console.log("globe render");

    // Toggle performance monitor with key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'p') {
                setShowPerformance(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handlers for OrbitControls drag state

    return (
        <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full">
                <Canvas
                    camera={{ position: [1, 1, 0], near: 0.01, far: 1000 }}
                    style={{ background: "black", width: "100vw", height: "100vh" }}
                >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[1, 1, 3]} intensity={2} />

                    <OrbitControls
                        ref={controlsRef}
                        enableZoom={true}
                        enableRotate={true}
                        enablePan={false}
                        minDistance={1.02}
                        maxDistance={4}
                        zoomSpeed={0.4}
                        rotateSpeed={0.4}
                    />
                    <Stars
                        radius={200}
                        depth={60}
                        count={5000}
                        factor={7}
                        saturation={0}
                        fade={true}
                    />

                    <EarthTest ref={globeRef} cloudsRef={cloudsRef} NoOffSet={NoOffSet} />
                    <AtmosphereMesh radius={1.02} />
                    <RotateGlobe globeRef={globeRef} cloudsRef={cloudsRef} />

                    {/* Performance monitor (toggle with 'p' key) */}
                    {showPerformance && <Perf position="bottom-right" />}
                </Canvas>
            </div>
        </div>
    );
});

function RotateGlobe({ globeRef, cloudsRef }) {
    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();
        globeRef.current.rotation.y = elapsedTime / 70;
        cloudsRef.current.rotation.y = elapsedTime / 40;
    });
    return null;
}

export default LandingGlobe;