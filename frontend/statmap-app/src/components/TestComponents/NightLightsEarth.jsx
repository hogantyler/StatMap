import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Stats, Text, Billboard } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense, useMemo } from "react";
import * as THREE from "three";
import EarthMap from "../../textures/8k_earth.png";
import EarthNormalMap from "../../textures/earth_normalmap_5400x2700.jpg";
import EarthSpecMap from "../../textures/8k_earth_specular_map.jpg";
import EarthCloudMap from "../../textures/cloud_texture.jpg";
import EarthDisplacementMap from "../../textures/gebco_bathy_2700x1350.jpg";
import EarthNightMap from "../../textures/earth-nightmap-4k.jpg";
import { TextureLoader } from "three";
import { Perf } from 'r3f-perf';
import ConicGlobe from "./ConicGlobe";
import AtmosphereMesh from "./AtmosphereMesh";

// custom shader for day night blending of earth globe derived from here: https://github.com/bobbyroe/earth-with-react-three-fiber/blob/main/src/EarthMaterial.jsx
// custom shader material for day/night cycle
function createEarthMaterial(maps, sunDirection = new THREE.Vector3(-2, 0.5, 0).normalize()) {
    const { colorMap, normalMap, specularMap, cloudMap, nightMap } = maps;
    
    const uniforms = {
        dayTexture: { value: colorMap },
        nightTexture: { value: nightMap },
        normalMap: { value: normalMap },
        specularMap: { value: specularMap },
        sunDirection: { value: sunDirection },
    };
    
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            // Position
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * viewMatrix * modelPosition;
            
            // Model normal
            vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
            
            // Varyings
            vUv = uv;
            vNormal = modelNormal;
            vPosition = modelPosition.xyz;
        }
    `;
    
    const fragmentShader = `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D normalMap;
        uniform sampler2D specularMap;
        uniform vec3 sunDirection;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vec3 viewDirection = normalize(vPosition - cameraPosition);
            vec3 normal = normalize(vNormal);
            vec3 color = vec3(0.0);
            
            // Rotate texture coordinates by 90 degrees to align with country borders
            // This shifts the texture a quarter turn to the left
            vec2 rotatedUv = vec2(vUv.x + 0.25, vUv.y);
            // Handle wrapping for x coordinate
            if (rotatedUv.x < 0.0) rotatedUv.x += 1.0;
            
            // Sun orientation
            float sunOrientation = dot(sunDirection, normal);
            
            // Day / night color
            float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
            vec3 dayColor = texture2D(dayTexture, rotatedUv).rgb;
            vec3 nightColor = texture2D(nightTexture, rotatedUv).rgb;
            color = mix(nightColor, dayColor, dayMix);
            
            // Add some specular highlights on the day side
            if (dayMix > 0.1) {
                vec3 reflection = reflect(-sunDirection, normal);
                float specular = max(0.0, dot(reflection, -viewDirection));
                specular = pow(specular, 20.0) * texture2D(specularMap, rotatedUv).r;
                color += specular * 0.5 * dayMix;
            }
            
            // Final color
            gl_FragColor = vec4(color, 1.0);
        }
    `;
    
    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
}

function NightLightsEarth(props) {
    // texture loading
    const globeRef = useRef();
    const cloudsRef = useRef();
    
    // Add nightMap to the texture loader
    const [colorMap, normalMap, specularMap, cloudMap, displacementMap, nightMap] = useLoader(
        TextureLoader,
        [EarthMap, EarthNormalMap, EarthSpecMap, EarthCloudMap, EarthDisplacementMap, EarthNightMap]
    );
    
    // Sun direction state that can be animated
    const [sunDirection] = useState(() => new THREE.Vector3(-2, 0.5, 1.5).normalize());
    
    useEffect(() => {
        // Configure textures with proper wrapping
        const configureMaps = (maps) => {
            maps.forEach(map => {
                if (map) {
                    map.wrapS = map.wrapT = THREE.RepeatWrapping;
                    map.repeat.set(1, 1);
                    // We'll handle the rotation in the shader instead of using offsets
                    map.offset.x = 0;
                }
            });
        };
        
        configureMaps([colorMap, normalMap, specularMap, cloudMap, displacementMap, nightMap]);
    }, [colorMap, normalMap, specularMap, cloudMap, displacementMap, nightMap]);
    
    // Create earth material with shader
    const earthMaterial = useMemo(() => {
        if (colorMap && normalMap && specularMap && nightMap) {
            return createEarthMaterial({
                colorMap,
                normalMap,
                specularMap,
                cloudMap,
                nightMap
            }, sunDirection);
        }
        return null;
    }, [colorMap, normalMap, specularMap, cloudMap, nightMap, sunDirection]);
    
    const [showLabel, setShowLabel] = useState(true);
    
    const handleClick = (event) => {
        event.stopPropagation();
        console.log('ocean');
    };
    
    return (
        <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full">
                <Canvas
                    camera={{ position: [0, 1, 2], near: 0.01, far: 1000 }}
                    style={{ background: "black", width: "100vw", height: "100vh" }}
                >
                    
                    <directionalLight position={[sunDirection.x, sunDirection.y, sunDirection.z]} intensity={0.5} />
                    
                    <OrbitControls
                        enableZoom={true}
                        enableRotate={true}
                        enablePan={false}
                        minDistance={1.05}
                        maxDistance={4}
                        zoomSpeed={0.5}
                        rotateSpeed={0.5}
                    />
                    
                    <Stars
                        radius={200}
                        depth={60}
                        count={5000}
                        factor={7}
                        saturation={0}
                        fade={true}
                    />
                    
                    <mesh ref={cloudsRef}>
                        <sphereGeometry args={[1.01, 40, 40]} />
                        <meshPhongMaterial
                            map={cloudMap}
                            opacity={0.3}
                            depthWrite={false}
                            transparent={true}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    
                    <mesh ref={globeRef} onClick={handleClick}>
                        <sphereGeometry args={[1, 40, 40]} />
                        {earthMaterial ? (
                            <primitive object={earthMaterial} />
                        ) : (
                            <>
                                <meshPhongMaterial specularMap={specularMap} depthWrite={false}/>
                                <meshStandardMaterial map={colorMap} normalMap={normalMap} metalness={0.7} roughness={0.7} />
                            </>
                        )}
                    </mesh>
                    
                    <AtmosphereMesh radius={1.02} />
                    
                    <RotateGlobe globeRef={globeRef} cloudsRef={cloudsRef} />
                    <CountryBorders globeRef={globeRef} />
                    <CountryLabels globeRef={globeRef} showLabel={showLabel} />
                    <ConicGlobe globeRef={globeRef} />
                    
                    <Perf position="top-right" />
                </Canvas>
            </div>
        </div>
    );
}

function RotateGlobe({ globeRef, cloudsRef, conicGlobeRef }) {
    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();

        globeRef.current.rotation.y = elapsedTime / 60;
        //conicGlobeRef.current.rotation.y = elapsedTime / 60;
        cloudsRef.current.rotation.y = elapsedTime / 40;
    });
    return null;
}

function BetterLabels({ globeRef }) {
    return null;
}

function CountryBorders({ globeRef }) {
    const [geoData, setGeoData] = useState(null);
    const linesRef = useRef();

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

function CountryLabels({ globeRef, showLabel }) {
    const [geoData, setGeoData] = useState(null);
    const labelsRef = useRef();
    const { camera } = useThree();

    //country label offsets for manual adjustments
    const countryOffsets = {
        "United States of America": [0, 0, 0],
        "Norway": [0, 0, 0]
    };

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

    const [cameraDistance, setCameraDistance] = useState(0);

    useFrame(() => {
        if (labelsRef.current && globeRef.current) {
            labelsRef.current.rotation.copy(globeRef.current.rotation);
        }

        //update camera
        if (camera) {
            const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
            setCameraDistance(distance);
        }
    });

    // center calculation for polygons
    const calculatePolygonCentroid = (polygon) => {

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

        // check if area is close to zero to avoid division by zero
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
    };

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
        "Germany", "Italy", "United Kingdom", "Japan", "Turkey", "South Korea"
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
}


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

export default NightLightsEarth;