import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Stats, Text, Billboard } from "@react-three/drei";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import * as THREE from "three";
import EarthMap from "../../textures/8k_earth.png";
import EarthNormalMap from "../../textures/earth_normalmap_5400x2700.jpg";
import EarthSpecMap from "../../textures/8k_earth_specular_map.jpg";
import EarthCloudMap from "../../textures/cloud_texture.jpg";
import EarthDisplacementMap from "../../textures/gebco_bathy_2700x1350.jpg";
import EarthNightMap from "../../textures/8k_earthNightMap.jpg";
import { TextureLoader } from "three";
import { Perf } from 'r3f-perf';
import ConicGlobe from "./ConicGlobe";
import AtmosphereMesh from "../GlobeComponents/AtmosphereMesh";

// --- MODIFIED SHADER FUNCTION with normalScale ---
function createEarthMaterial(maps, sunDirection = new THREE.Vector3(-2, 0.5, 1.5).normalize()) {
    const { colorMap, normalMap, specularMap, nightMap } = maps;

    const uniforms = {
        dayTexture: { value: colorMap },
        nightTexture: { value: nightMap },
        normalMap: { value: normalMap },
        specularMap: { value: specularMap },
        sunDirection: { value: sunDirection },
        shininess: { value: 70.0 },
        // --- ADD NORMAL SCALE UNIFORM ---
        normalScale: { value: 0.7 } // <-- ADJUST THIS VALUE (0.0 to 1.0) to control intensity
    };

    // --- VERTEX SHADER (Unchanged from previous working version) ---
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormalWorld;
        varying vec3 vPosition;
        varying vec3 vTangentWorld;
        varying vec3 vBitangentWorld;

        attribute vec4 tangent;

        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * viewMatrix * worldPosition;

            vNormalWorld = normalize(mat3(modelMatrix) * normal);
            vTangentWorld = normalize(mat3(modelMatrix) * tangent.xyz);
            vBitangentWorld = normalize(cross(vNormalWorld, vTangentWorld) * tangent.w);

            vUv = uv;
            vPosition = worldPosition.xyz;
        }
    `;

    // --- FRAGMENT SHADER (MODIFIED for normalScale) ---
    const fragmentShader = `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D normalMap;
        uniform sampler2D specularMap;
        uniform vec3 sunDirection;
        uniform float shininess;
        uniform float normalScale; // <-- Receive the uniform

        varying vec2 vUv;
        varying vec3 vNormalWorld;
        varying vec3 vPosition;
        varying vec3 vTangentWorld;
        varying vec3 vBitangentWorld;

        void main() {
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            vec2 rotatedUv = vec2(vUv.x + 0.25, vUv.y);
            if (rotatedUv.x < 0.0) rotatedUv.x += 1.0;

            // --- Normal Mapping ---
            // Sample and unpack the tangent-space normal from the map
            vec3 tangentNormalFromMap = texture2D(normalMap, rotatedUv).xyz * 2.0 - 1.0;

            // --- SCALE THE NORMAL MAP EFFECT ---
            // Blend towards the flat normal (0,0,1) based on normalScale
            // Use normalize() to ensure the resulting normal is still unit length
            vec3 scaledTangentNormal = normalize(mix(vec3(0.0, 0.0, 1.0), tangentNormalFromMap, normalScale));
            // --- END SCALE ---

            // Create the TBN matrix
            mat3 TBN = mat3(vTangentWorld, vBitangentWorld, vNormalWorld);

            // Transform the *scaled* tangent-space normal to world space
            vec3 finalNormal = normalize(TBN * scaledTangentNormal); // <-- Use scaledTangentNormal
            // --- End Normal Mapping ---


            // --- Lighting Calculation using finalNormal ---
            float sunOrientation = dot(sunDirection, finalNormal);

            // Day / night color mix (Using a potentially wider smoothstep range)
            float dayMix = smoothstep(-0.3, 0.3, sunOrientation); // <-- ADJUST RANGE if needed
            vec3 dayColor = texture2D(dayTexture, rotatedUv).rgb;
            vec3 nightColor = texture2D(nightTexture, rotatedUv).rgb;
            vec3 baseColor = mix(nightColor, dayColor, dayMix);

            // --- Specular Highlights using finalNormal ---
            vec3 specularColor = vec3(0.0);
            if (dayMix > 0.0) {
                vec3 reflection = reflect(-sunDirection, finalNormal);
                float specularStrength = texture2D(specularMap, rotatedUv).r;
                float specAngle = max(dot(reflection, viewDirection), 0.0);
                float specularFactor = pow(specAngle, shininess);
                specularColor = vec3(1.0) * specularStrength * specularFactor * dayMix;
            }
            // --- End Specular Highlights ---

            vec3 finalColor = baseColor + specularColor;
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
}


function NightLightsEarth(props) {
    const [showPerformance, setShowPerformance] = useState(true);
    const globeRef = useRef();
    const cloudsRef = useRef();
    const isDraggingRef = useRef(false);
    const controlsRef = useRef();

    // Original useEffect for performance toggle
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'p') setShowPerformance(prev => !prev);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Original Handlers for OrbitControls drag state
    const handleDragStart = useCallback(() => {
        isDraggingRef.current = true;
        document.body.style.cursor = 'grabbing';
    }, []);

    const handleDragEnd = useCallback(() => {
        setTimeout(() => { isDraggingRef.current = false; }, 200); // Keeping 200ms timeout
        document.body.style.cursor = 'auto';
    }, []);

    // Original texture loading
    const [colorMap, normalMap, specularMap, cloudMap, displacementMap, nightMap] = useLoader(
        TextureLoader,
        [EarthMap, EarthNormalMap, EarthSpecMap, EarthCloudMap, EarthDisplacementMap, EarthNightMap]
    );

    // Original Sun direction state
    const [sunDirection] = useState(() => new THREE.Vector3(-2, 0.5, 1.5).normalize()); // Using the later sunDirection

    // Original useEffect for texture configuration
    useEffect(() => {
        const configureMaps = (maps) => {
            maps.forEach(map => {
                if (map) {
                    map.wrapS = map.wrapT = THREE.RepeatWrapping;
                    map.repeat.set(1, 1);
                    map.offset.x = 0;
                    // Ensure good filtering
                    map.minFilter = THREE.LinearMipmapLinearFilter; // Good for minification
                    map.magFilter = THREE.LinearFilter; // Good for magnification
                    map.needsUpdate = true; // Important if changing filter after load
                }
            });
        };
        configureMaps([colorMap, normalMap, specularMap, cloudMap, displacementMap, nightMap]);
    }, [colorMap, normalMap, specularMap, cloudMap, displacementMap, nightMap]);

    // --- MODIFIED SPHERE GEOMETRY ---
    // Create sphere geometry WITH TANGENTS using the built-in method
    const sphereGeometry = useMemo(() => {
        // Increased segments slightly for better tangent results
        const geom = new THREE.SphereGeometry(1, 64, 64);
        try {
            geom.computeTangents(); // Use built-in method
            console.log("Tangents computed successfully using geom.computeTangents().");
        } catch (error) {
            console.error("Error computing tangents:", error);
            return new THREE.SphereGeometry(1, 40, 40); // Fallback to original segments
        }
        return geom;
    }, []); // Runs once
    // --- END MODIFIED SPHERE GEOMETRY ---

    // --- MODIFIED EARTH MATERIAL CREATION ---
    // Create earth material with the MODIFIED shader function
    const earthMaterial = useMemo(() => {
        // Ensure all required maps for the *new* shader are loaded
        if (colorMap && normalMap && specularMap && nightMap) {
            return createEarthMaterial({
                colorMap,
                normalMap,
                specularMap,
                // cloudMap, // cloudMap not needed by the new shader function
                nightMap
            }, sunDirection);
        }
        return null; // Return null if textures aren't ready
        // Update dependencies to match the new shader's needs
    }, [colorMap, normalMap, specularMap, nightMap, sunDirection]);
    // --- END MODIFIED EARTH MATERIAL CREATION ---

    const [showLabel, setShowLabel] = useState(true); // Original state

    // --- ORIGINAL JSX STRUCTURE ---
    return (
        <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full">
                <Canvas
                    // Original camera settings
                    camera={{ position: [0, 1, 2], near: 0.01, far: 1000 }}
                    style={{ background: "black", width: "100vw", height: "100vh" }}
                // No gl={{ antialias: true }} added
                >
                    {/* Original lighting */}
                    <directionalLight position={[sunDirection.x, sunDirection.y, sunDirection.z]} intensity={0.5} />
                    {/* No ambient light added */}

                    {/* Original OrbitControls */}
                    <OrbitControls
                        ref={controlsRef}
                        enableZoom={true}
                        enableRotate={true}
                        enablePan={false}
                        minDistance={1.05}
                        maxDistance={4} // Original maxDistance
                        zoomSpeed={0.4}
                        rotateSpeed={0.4}
                        onStart={handleDragStart}
                        onEnd={handleDragEnd}
                    // No damping enabled
                    />

                    {/* Original Stars */}
                    <Stars
                        radius={200}
                        depth={60}
                        count={5000} // Original count
                        factor={7}
                        saturation={0}
                        fade={true}
                    />

                    {/* Original Clouds Mesh */}
                    <mesh ref={cloudsRef}>
                        {/* Original segments */}
                        <sphereGeometry args={[1.01, 40, 40]} />
                        <meshPhongMaterial
                            map={cloudMap}
                            opacity={0.3} // Original opacity
                            depthWrite={false}
                            transparent={true}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* --- MODIFIED EARTH MESH APPLICATION --- */}
                    {/* Use geometry and material props, conditional render */}
                    {earthMaterial && sphereGeometry && (
                        <mesh
                            ref={globeRef}
                            geometry={sphereGeometry} // Use the geometry with tangents
                            material={earthMaterial} // Use the custom shader material
                            onPointerOver={(e) => e.stopPropagation()}
                            onPointerOut={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                    {/* --- END MODIFIED EARTH MESH APPLICATION --- */}


                    {/* Original AtmosphereMesh */}
                    <AtmosphereMesh radius={1.02} />

                    {/* Original Helper Components */}
                    {/* Pass refs directly, no conditional rendering here */}
                    <RotateGlobe globeRef={globeRef} cloudsRef={cloudsRef} />
                    <CountryBorders globeRef={globeRef} />
                    <CountryLabels globeRef={globeRef} showLabel={showLabel} />
                    <ConicGlobe globeRef={globeRef} isDraggingRef={isDraggingRef} />

                    {/* Original Performance monitor */}
                    {showPerformance && <Perf position="bottom-right" />}
                </Canvas>
            </div>
        </div>
    );
}

// --- ORIGINAL HELPER COMPONENTS ---

// Original RotateGlobe (except maybe conicGlobeRef param was unused)
function RotateGlobe({ globeRef, cloudsRef }) { // Removed conicGlobeRef if unused
    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();
        // Need null checks here as conditional rendering was removed above
        if (globeRef.current) {
            globeRef.current.rotation.y = elapsedTime / 60; // Original speed
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y = elapsedTime / 40; // Original speed
        }
    });
    return null;
}

// Original CountryBorders
function CountryBorders({ globeRef }) {
    const [geoData, setGeoData] = useState(null);
    const linesRef = useRef();

    // Original console log
    // console.log("border render");

    // Original fetch (no error handling added back)
    useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/three-conic-polygon-geometry/refs/heads/master/example/geojson/ne_110m_admin_0_countries.geojson')
            .then(response => response.json())
            .then(data => {
                setGeoData(data);
            })
            .catch(error => console.error('Error fetching GeoJSON:', error));
    }, []);

    // Original useFrame
    useFrame(() => {
        if (linesRef.current && globeRef.current) {
            linesRef.current.rotation.copy(globeRef.current.rotation);
        }
    });

    // Original useEffect for line creation
    useEffect(() => {
        if (!geoData || !linesRef.current) return;

        // Original cleanup
        while (linesRef.current.children.length > 0) {
            // No dispose calls added back
            linesRef.current.remove(linesRef.current.children[0]);
        }

        const radius = 1.005;

        geoData.features.forEach((feature, featureIndex) => {
            let coordinates = [];
            if (feature.geometry.type === "Polygon") coordinates = [feature.geometry.coordinates];
            else if (feature.geometry.type === "MultiPolygon") coordinates = feature.geometry.coordinates;

            coordinates.forEach((shape, shapeIndex) => {
                shape.forEach((ring, ringIndex) => {
                    const points = [];
                    ring.forEach(coord => {
                        // No coordinate validation added back
                        const lon = THREE.MathUtils.degToRad(coord[0]);
                        const lat = THREE.MathUtils.degToRad(coord[1]);
                        const x = radius * Math.cos(lat) * Math.sin(lon);
                        const y = radius * Math.sin(lat);
                        const z = radius * Math.cos(lat) * Math.cos(lon);
                        points.push(new THREE.Vector3(x, y, z));
                    });

                    // No try...catch added back
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);

                    // Original material
                    const material = new THREE.LineBasicMaterial({
                        color: 0x008080, // Original color
                        opacity: 0.6,    // Original opacity
                        transparent: true,
                        linewidth: 0.5 // Original linewidth
                    });

                    const line = new THREE.Line(geometry, material);
                    linesRef.current.add(line);
                });
            });
        });
    }, [geoData]);

    return <group ref={linesRef} />;
}

// Original CountryLabels
function CountryLabels({ globeRef, showLabel }) {
    const [geoData, setGeoData] = useState(null);
    const labelsRef = useRef();
    const { camera } = useThree();
    const [cameraDistance, setCameraDistance] = useState(0);

    // Original console log
    // console.log("label render");

    // Original country offsets
    const countryOffsets = useMemo(() => ({
        "United States of America": [0, 0, 0],
        "Norway": [0, 0, 0]
    }), []);

    // Original fetch
    useEffect(() => {
        // console.log('labels fetching');
        fetch('https://raw.githubusercontent.com/vasturiano/three-conic-polygon-geometry/refs/heads/master/example/geojson/ne_110m_admin_0_countries.geojson')
            .then(response => response.json())
            .then(data => {
                setGeoData(data);
            })
            .catch(error => console.error('Error fetching GeoJSON:', error));
    }, []);

    // Original useFrame
    useFrame(() => {
        if (labelsRef.current && globeRef.current) {
            labelsRef.current.rotation.copy(globeRef.current.rotation);
        }
        if (camera) {
            // No check for globeRef.current before distance calc
            const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0)); // Original target
            if (Math.abs(distance - cameraDistance) > 0.03) { // Original threshold
                setCameraDistance(distance);
            }
        }
    });

    // Original center calculation
    const calculatePolygonCentroid = useCallback((polygon) => {
        // (Keep original implementation)
        if (!polygon || polygon.length < 3) return [0, 0];
        let area = 0, cx = 0, cy = 0;
        for (let i = 0; i < polygon.length; i++) {
            const current = polygon[i]; const next = polygon[(i + 1) % polygon.length];
            // No coordinate validation
            const crossProduct = current[0] * next[1] - next[0] * current[1];
            area += crossProduct; cx += (current[0] + next[0]) * crossProduct; cy += (current[1] + next[1]) * crossProduct;
        }
        area /= 2;
        if (Math.abs(area) < 1e-10) {
            let sumLon = 0, sumLat = 0;
            polygon.forEach(coord => { sumLon += coord[0]; sumLat += coord[1]; });
            return [sumLon / polygon.length, sumLat / polygon.length];
        }
        cx = cx / (6 * area); cy = cy / (6 * area);
        return [cx, cy];
    }, []);

    // Original check for geoData
    if (!geoData) return null;

    // Original label creation logic (will rebuild array on every render)
    const labels = [];
    const radius = 1.02;

    // Original visible countries set
    const visibleCountriesBySize = new Set([
        "Russia", "Canada", "United States of America", "China", "Brazil", "Australia", "India", "Argentina", "Mexico", "Indonesia", "Saudi Arabia", "Iran", "Kazakhstan", "Algeria", "Sudan", "Congo", "Libya", "Mongolia", "Peru", "Chad", "Niger", "Angola", "Mali", "South Africa", "Colombia", "Ethiopia", "Bolivia", "Egypt", "Tanzania", "Nigeria", "Venezuela", "Pakistan", "Ukraine", "France", "Spain", "Sweden", "Germany", "Italy", "United Kingdom", "Japan", "Turkey", "South Korea"
    ]);

    // Original shouldShowLabel logic
    const shouldShowLabel = (countryName, countryArea) => {
        if (visibleCountriesBySize.has(countryName)) return true;
        if (countryArea > 10 && cameraDistance < 2.5) return true;
        if (cameraDistance < 1.5) return true;
        return false;
    };

    geoData.features.forEach((feature, index) => {
        const countryName = feature.properties.ADMIN || feature.properties.name;
        let centroid; let countryArea = 0;

        // Original area/centroid calculation logic
        if (feature.geometry.type === "Polygon") {
            // No coordinate validation added back
            countryArea = calculateApproximateArea(feature.geometry.coordinates[0]);
            centroid = calculatePolygonCentroid(feature.geometry.coordinates[0]);
        } else if (feature.geometry.type === "MultiPolygon") {
            let maxArea = 0; let bestCentroid = [0, 0];
            feature.geometry.coordinates.forEach(multiPolygon => {
                multiPolygon.forEach(polygon => {
                    const area = calculateApproximateArea(polygon); countryArea += area;
                    if (area > maxArea) { maxArea = area; bestCentroid = calculatePolygonCentroid(polygon); }
                });
            });
            centroid = bestCentroid;
        }

        if (centroid && shouldShowLabel(countryName, countryArea)) {
            // No centroid validation
            const lon = THREE.MathUtils.degToRad(centroid[0]);
            const lat = THREE.MathUtils.degToRad(centroid[1]);
            let x = radius * Math.cos(lat) * Math.sin(lon);
            let y = radius * Math.sin(lat);
            let z = radius * Math.cos(lat) * Math.cos(lon);
            if (countryOffsets[countryName]) { const [offsetX, offsetY, offsetZ] = countryOffsets[countryName]; x += offsetX; y += offsetY; z += offsetZ; }

            // Original font size calculation
            const fontSize = visibleCountriesBySize.has(countryName) ? 0.03 : 0.02;
            const scaleFactor = Math.max(0.4, cameraDistance * 0.2);

            labels.push(
                <group key={`label-${index}`} position={[x, y, z]}>
                    <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                        {/* Original Text props */}
                        <Text
                            fontSize={fontSize * scaleFactor}
                            color="yellow" // Original color
                            anchorX="center"
                            anchorY="middle"
                            backgroundColor="rgba(0, 0, 0, 0.5)" // Original background
                            backgroundOpacity={0.5} // Original background
                            backgroundPadding={[0.01, 0.01]} // Original background
                            renderOrder={2} // Original renderOrder
                            depthTest={false} // Original depthTest
                            outlineWidth={0.001} // Original outlineWidth
                            outlineColor="black" // Original outlineColor
                        >
                            {countryName}
                        </Text>
                    </Billboard>
                </group>
            );
        }
    });

    // Original return (not memoized)
    return <group ref={labelsRef}>{labels}</group>;
}


// Original calculateApproximateArea function
function calculateApproximateArea(polygon) {
    if (!polygon || polygon.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < polygon.length - 1; i++) {
        const p1 = polygon[i]; const p2 = polygon[i + 1];
        // No coordinate validation
        area += (p2[0] - p1[0]) * (p2[1] + p1[1]);
    }
    return Math.abs(area / 2);
}

export default NightLightsEarth;