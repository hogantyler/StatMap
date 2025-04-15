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
    const [showLabel, setShowLabel] = useState(true);
    const [showPerformance, setShowPerformance] = useState(false);
    const NoOffSet = true;

    const globeRef = useRef();
    const cloudsRef = useRef();
    const controlsRef = useRef();
    const linesRef = useRef();
    const isDraggingRef = useRef(false); // For checking if the globe is being rotated
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
    const handleDragStart = useCallback(() => {
        setTimeout(() => {
            isDraggingRef.current = !isDraggingRef.current;
            //console.log("dragStart " + isDraggingRef.current);
        }, 150);
        document.body.style.cursor = 'grabbing';
    }, []);

    const handleDragEnd = useCallback(() => {
        setTimeout(() => {
            isDraggingRef.current = !isDraggingRef.current;
            //console.log("dragEnd " + isDraggingRef.current);
        }, 150);
        document.body.style.cursor = 'auto';
    }, []);

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
                        // Event handlers to track if globe is being rotated
                        //onStart={handleDragStart}
                        //onEnd={handleDragEnd}
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
                    {/* <ConicGlobe globeRef={globeRef} isDraggingRef={isDraggingRef} />
                    <CountryBorders globeRef={globeRef} linesRef={linesRef} />
                    <CountryLabels globeRef={globeRef} showLabel={showLabel} /> */}
                    
                    <RotateGlobe globeRef={globeRef} cloudsRef={cloudsRef} linesRef={linesRef} />

                    {/* Performance monitor (toggle with 'p' key) */}
                    {showPerformance && <Perf position="bottom-right" />}
                </Canvas>
            </div>
        </div>
    );
});

function RotateGlobe({ globeRef, cloudsRef, linesRef, conicGlobeRef }) {
    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();
        globeRef.current.rotation.y = elapsedTime / 70;
        //linesRef.current.rotation.y = elapsedTime / 70
        //conicGlobeRef.current.rotation.y = elapsedTime / 60;
        cloudsRef.current.rotation.y = elapsedTime / 40;
    });
    return null;
}



function CountryBorders({ globeRef, linesRef }) {
    const [geoData, setGeoData] = useState(null);
    //const linesRef = useRef();

    console.log("border render");
    useEffect(() => {
        //gets geosjason data
        //https://raw.githubusercontent.com/vasturiano/three-conic-polygon-geometry/refs/heads/master/example/geojson/ne_110m_admin_0_countries.geojson
        fetch('https://raw.githubusercontent.com/vasturiano/three-conic-polygon-geometry/refs/heads/master/example/geojson/ne_110m_admin_0_countries.geojson')
            .then(response => response.json())
            .then(data => {
                setGeoData(data);
            })
            .catch(error => console.error('Error fetching GeoJSON:', error));
    }, []);

    {/*useFrame(() => {
        //make the lines follow the globe's rotation
        if (linesRef.current && globeRef.current) {
            linesRef.current.rotation.copy(globeRef.current.rotation);
        }
    });*/}

    //lines and materials
    useEffect(() => {

        if (!geoData || !linesRef.current) return;

        //check for existing line and clear
        while (linesRef.current.children.length > 0) {
            linesRef.current.remove(linesRef.current.children[0]);
        }

        const radius = 1.005; //set radius so it's on top of globle

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
                        const lon = THREE.MathUtils.degToRad(coord[0]);
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
                        color: 0x008080,
                        opacity: 0.6,
                        transparent: true,
                        linewidth: 0.5
                    });

                    const line = new THREE.Line(geometry, material);
                    linesRef.current.add(line);
                });
            });
        });
    }, [geoData]);

    return <group ref={linesRef} />;
}

const CountryLabels = memo(function CountryLabels({ globeRef, showLabel }) {
    const [geoData, setGeoData] = useState(null);
    const labelsRef = useRef();
    const { camera } = useThree();
    const [cameraDistance, setCameraDistance] = useState(0);

    console.log("label render");

    //country label offsets for manual adjustments
    const countryOffsets = useMemo(() => ({
        "United States of America": [0, 0, 0],
        "Norway": [0, 0, 0]
    }), []);

    useEffect(() => {
        console.log('labels fetching');
        //this is simpler more performant geojson: https://raw.githubusercontent.com/vasturiano/three-conic-polygon-geometry/refs/heads/master/example/geojson/ne_110m_admin_0_countries.geojson
        //this is more complex geojson: https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson
        fetch('https://raw.githubusercontent.com/vasturiano/three-conic-polygon-geometry/refs/heads/master/example/geojson/ne_110m_admin_0_countries.geojson')
            .then(response => response.json())
            .then(data => {
                setGeoData(data);
            })
            .catch(error => console.error('Error fetching GeoJSON:', error));
    }, []);

    useFrame(() => {
        if (labelsRef.current && globeRef.current) {
            labelsRef.current.rotation.copy(globeRef.current.rotation);
        }

        //update camera
        if (camera) {
            const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
            if (Math.abs(distance - cameraDistance) > 0.03) { // Only update if significant change
                setCameraDistance(distance);
            }
        }
    });

    // center calculation for polygons
    const calculatePolygonCentroid = useCallback((polygon) => {
        if (!polygon || polygon.length < 3) {
            return [0, 0];
        }

        let area = 0;
        let cx = 0;
        let cy = 0;

        for (let i = 0; i < polygon.length; i++) {
            const current = polygon[i];
            const next = polygon[(i + 1) % polygon.length];

            const crossProduct = current[0] * next[1] - next[0] * current[1];
            area += crossProduct;

            cx += (current[0] + next[0]) * crossProduct;
            cy += (current[1] + next[1]) * crossProduct;
        }

        area /= 2;

        // Check if area is close to zero to avoid division by zero
        if (Math.abs(area) < 1e-10) {
            // Fallback to simple average if the area is too small
            let sumLon = 0, sumLat = 0;
            polygon.forEach(coord => {
                sumLon += coord[0];
                sumLat += coord[1];
            });
            return [sumLon / polygon.length, sumLat / polygon.length];
        }

        cx = cx / (6 * area);
        cy = cy / (6 * area);

        return [cx, cy];
    }, []);

    if (!geoData) return null;

    const labels = [];
    const radius = 1.02; //height of the labels

    const visibleCountriesBySize = new Set([
        "Russia", "Canada", "United States of America", "China", "Brazil",
        "Australia", "India", "Argentina", "Mexico", "Indonesia",
        "Saudi Arabia", "Iran", "Kazakhstan", "Algeria", "Sudan",
        "Congo", "Libya", "Mongolia", "Peru", "Chad", "Niger",
        "Angola", "Mali", "South Africa", "Colombia", "Ethiopia",
        "Bolivia", "Egypt", "Tanzania", "Nigeria", "Venezuela",
        "Pakistan", "Ukraine", "France", "Spain", "Sweden",
        "Germany", "Italy", "United Kingdom", "Japan", "Turkey", "South Korea",
        "Greenland"
    ]);

    const shouldShowLabel = (countryName, countryArea) => {

        if (visibleCountriesBySize.has(countryName)) {
            return true;
        }


        if (countryArea > 10 && cameraDistance < 2.5) {
            return true;
        }


        if (cameraDistance < 1.5) {
            return true;
        }

        return false;
    };

    geoData.features.forEach((feature, index) => {
        const countryName = feature.properties.ADMIN || feature.properties.name;
        let centroid;
        let countryArea = 0;

        // calculate approximate country area for filtering
        if (feature.geometry.type === "Polygon") {
            countryArea = calculateApproximateArea(feature.geometry.coordinates[0]);
            centroid = calculatePolygonCentroid(feature.geometry.coordinates[0]);
        } else if (feature.geometry.type === "MultiPolygon") {
            let maxArea = 0;
            let bestCentroid = [0, 0];

            feature.geometry.coordinates.forEach(multiPolygon => {
                multiPolygon.forEach(polygon => {
                    const area = calculateApproximateArea(polygon);
                    countryArea += area;

                    if (area > maxArea) {
                        maxArea = area;
                        bestCentroid = calculatePolygonCentroid(polygon);
                    }
                });
            });

            centroid = bestCentroid;
        }


        if (centroid && shouldShowLabel(countryName, countryArea)) {
            // Convert centroid to 3D position
            const lon = THREE.MathUtils.degToRad(centroid[0]);
            const lat = THREE.MathUtils.degToRad(centroid[1]);

            let x = radius * Math.cos(lat) * Math.sin(lon);
            let y = radius * Math.sin(lat);
            let z = radius * Math.cos(lat) * Math.cos(lon);


            if (countryOffsets[countryName]) {
                const [offsetX, offsetY, offsetZ] = countryOffsets[countryName];
                x += offsetX;
                y += offsetY;
                z += offsetZ;
            }


            const fontSize = visibleCountriesBySize.has(countryName) ? 0.03 : 0.02;

            const scaleFactor = Math.max(0.4, cameraDistance * 0.2);

            labels.push(
                <group
                    key={`label-${index}`}
                    position={[x, y, z]}
                >
                    <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                        <Text
                            fontSize={fontSize * scaleFactor}
                            color="yellow"
                            anchorX="center"
                            anchorY="middle"
                            // Add a background for better visibility
                            backgroundColor="rgba(0, 0, 0, 0.5)"
                            backgroundOpacity={0.5}
                            backgroundPadding={[0.01, 0.01]}
                            // Optimize visibility
                            renderOrder={2}
                            depthTest={false}
                            // Optional: add outline for better contrast
                            outlineWidth={0.001}
                            outlineColor="black"
                        >
                            {countryName}
                        </Text>
                    </Billboard>
                </group>
            );
        }
    });

    return <group ref={labelsRef}>{labels}</group>; //group of all the texts
});


//function to calculate approximate area of a polygon
function calculateApproximateArea(polygon) {
    if (!polygon || polygon.length < 3) {
        return 0;
    }

    let area = 0;

    for (let i = 0; i < polygon.length - 1; i++) {
        const p1 = polygon[i];
        const p2 = polygon[i + 1];
        area += (p2[0] - p1[0]) * (p2[1] + p1[1]); //shoelace formula
    }

    return Math.abs(area / 2);
}

export default LandingGlobe;