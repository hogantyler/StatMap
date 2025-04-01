import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Stats } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import EarthMap from "../textures/8k_earth.png"
import EarthNormalMap from "../textures/8k_earth_normal_map.jpg"
import EarthSpecMap from "../textures/8k_earth_specular_map.jpg"
import EarthCloudMap from "../textures/cloud_texture.jpg"
import { TextureLoader } from "three";

/**
 * Renders a 3D interactive globe with texture mapping, lighting, and user controls.
 * 
 * @returns {JSX.Element} A 3D globe component
 */
function Globe(props) {
    //texture loading
    const globeRef = useRef();
    const cloudsRef = useRef();

    {/* const texture = new THREE.TextureLoader().load(EarthMap, (texture) => {
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);
    }, undefined, (err) => {
        console.error("Error loading texture:", err);
    });*/}


    const [colorMap, normalMap, specularMap, cloudMap] = useLoader(
        TextureLoader,
        [EarthMap, EarthNormalMap, EarthSpecMap, EarthCloudMap]
    );

    return (
        <div className="relative w-full h-full">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <Canvas
                            camera={{ position: [0, 1.5, 1.5], near: 0.01, far: 1000 }}
                            style={{ background: "black", width: "100vw", height: "100vh" }}
                        >
                            <Suspense fallback={null}>
                                <ambientLight intensity={5} />
                                <directionalLight position={[0, 0, 2]} intensity={7} />
        
                                <OrbitControls
                                    enableZoom={true}
                                    enableRotate={true}
                                    enablePan={false}
                                    minDistance={1.05}
                                    maxDistance={4}
                                    zoomSpeed={0.4}
                                />
                                <Stars
                                    radius={300}
                                    depth={60}
                                    count={20000}
                                    factor={7}
                                    saturation={0}
                                    fade={true}
                                />
        
                                <mesh ref={cloudsRef}>
                                    <sphereGeometry args={[1.005, 36, 36]} />
                                    <meshPhongMaterial
                                        map={cloudMap}
                                        opacity={0.4}
                                        depthWrite={true}
                                        transparent={true}
                                        side={THREE.DoubleSide}
                                    />
                                </mesh>
        
                                <mesh ref={globeRef}>
                                    <sphereGeometry args={[1, 36, 36]} />
                                    <meshPhongMaterial specularMap={specularMap} />
                                    <meshStandardMaterial map={colorMap} normalMap={normalMap} metalness={0.4} roughness={0.7} />
        
                                </mesh>
        
                                
                                <RotateGlobe globeRef={globeRef} cloudsRef={cloudsRef}/>
                            </Suspense>
        
                        
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
function RotateGlobe({ globeRef, cloudsRef }) {
    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();

        globeRef.current.rotation.y = elapsedTime / 60;
        cloudsRef.current.rotation.y = elapsedTime / 40;
    });
    return null;
}

export default Globe;
