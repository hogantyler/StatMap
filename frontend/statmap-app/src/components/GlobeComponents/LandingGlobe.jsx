import React, { useRef, useState, useEffect, useMemo, useCallback, memo } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { Perf } from 'r3f-perf'
//import ConicGlobe from "./TestComponents/ConicGlobe";
import AtmosphereMesh from "./AtmosphereMesh";
import EarthTest from "../TestComponents/EarthTest";
import { useGraphicsSettings } from "../GraphicsContext";


/**
 * For showing 3D globe background on landing page
 * 
 * @returns A Canvas component that encapsulates 3D components including the earth, lights, stars, etc.
 */
const LandingGlobe = React.memo(function LandingGlobe(props) {
    const { graphicsSettings } = useGraphicsSettings();
    const [showPerformance, setShowPerformance] = useState(false);
    const NoOffSet = true;

    const globeRef = useRef();
    const cloudsRef = useRef();
    const controlsRef = useRef();

    //console.log("landing globe render");

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

    //console.log("Graphics settings:", graphicsSettings.antiAliasing);

    return (
        <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full">
                <Canvas
                    gl={{ antialias: graphicsSettings.antiAliasing }}
                    camera={{ position: [0, 0.75, 1.5], near: 0.01, far: 1000 }}
                    style={{ background: "black", width: "100vw", height: "100vh" }}
                >
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[-30, 0, 5]} intensity={1} />

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

                    <EarthTest globeRef={globeRef} cloudsRef={cloudsRef} NoOffSet={NoOffSet} />
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
        globeRef.current.rotation.y = elapsedTime / 50;
        //console.log(cloudsRef);
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y = elapsedTime / 30;
        }
    });
    return null;
}

export default LandingGlobe;