import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";

function GlobeTest(props) {
    // texture loading
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
                    <Suspense fallback={null}>
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
                        <CountryBorders globeRef={globeRef} />
                        
                        <RotateGlobe globeRef={globeRef} />
                    </Suspense>

                </Canvas>
            </div>
        </div>
    );
}

function RotateGlobe({ globeRef }) {
    useFrame(() => {
        if (globeRef.current) {
            globeRef.current.rotation.y += 0.000;
        }
    });
    return null;
}

function CountryBorders({ globeRef }) {
    const [geoData, setGeoData] = useState(null);
    const linesRef = useRef();

    useEffect(() => {
        //gets geosjason data
        fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
            .then(response => response.json())
            .then(data => {
                setGeoData(data);
            })
            .catch(error => console.error('Error fetching GeoJSON:', error));
    }, []);

    useFrame(() => {
        //make the lines follow the globe's rotation
        if (linesRef.current && globeRef.current) {
            linesRef.current.rotation.copy(globeRef.current.rotation);
        }
    });

    //lines and materials
    useEffect(() => {
        if (!geoData || !linesRef.current) return;

        //check for existing line and clear
        while (linesRef.current.children.length > 0) {
            linesRef.current.remove(linesRef.current.children[0]);
        }

        const radius = 1.0001; //set radius so it's on top of globle

        geoData.features.forEach((feature, featureIndex) => { //gets the coordinates of the countries in te geojson data
            let coordinates = [];

            if (feature.geometry.type === "Polygon") {
                coordinates = [feature.geometry.coordinates];
            } else if (feature.geometry.type === "MultiPolygon") {
                coordinates = feature.geometry.coordinates;
            }

            coordinates.forEach((shape, shapeIndex) => { //converting geojson coordinates to 3D coordinates
                shape.forEach((ring, ringIndex) => {
                    const points = [];

                    ring.forEach(coord => {
                        //convert longitude and latitude to 3D coordinates
                        const lon = THREE.MathUtils.degToRad(coord[0]) + Math.PI / 2;
                        const lat = THREE.MathUtils.degToRad(coord[1]);

                        //convert to Cartesian coordinates
                        const x = radius * Math.cos(lat) * Math.sin(lon);
                        const y = radius * Math.sin(lat);
                        const z = radius * Math.cos(lat) * Math.cos(lon);

                        points.push(new THREE.Vector3(x, y, z));
                    });

                    //create the line geometry
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);

                    //create material and line
                    const material = new THREE.LineBasicMaterial({
                        color: 0xffffff,
                        opacity: 0.8,
                        transparent: true,
                        linewidth: 1
                    });

                    const line = new THREE.Line(geometry, material);
                    linesRef.current.add(line);
                });
            });
        });
    }, [geoData]);

    return <group ref={linesRef} />;
}





export default GlobeTest;