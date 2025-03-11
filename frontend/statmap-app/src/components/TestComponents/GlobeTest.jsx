import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Stats } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import EarthMap from "../../textures/8k_earth.png"
import EarthNormalMap from "../../textures/8k_earth_normal_map.jpg"
import EarthSpecMap from "../../textures/8k_earth_specular_map.jpg"
import EarthCloudMap from "../../textures/cloud_texture.jpg"
import { TextureLoader } from "three";

function GlobeTest(props) {
    // texture loading
    const globeRef = useRef();
    const cloudsRef = useRef();
    const [colorMap, normalMap, specularMap, cloudMap] = useLoader(
        TextureLoader,
        [EarthMap, EarthNormalMap, EarthSpecMap, EarthCloudMap]
    );
    {/*}
    const texture = new THREE.TextureLoader().load(EarthMap, (texture) => {
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);
    }, undefined, (err) => {
        console.error("Error loading texture:", err);
    });
    */}

    const [showLabel, setShowLabel] = useState(true);


    console.log("globe render");


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

                        <CountryBorders globeRef={globeRef} />

                        <CountryLabels globeRef={globeRef} showLabel={showLabel} />
                        <RotateGlobe globeRef={globeRef} cloudsRef={cloudsRef}/>
                    </Suspense>

                    <Stats showPanel={0} />
                </Canvas>
            </div>
        </div>
    );
}


function RotateGlobe({ globeRef, cloudsRef }) {
    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();

        globeRef.current.rotation.y = elapsedTime / 60;
        cloudsRef.current.rotation.y = elapsedTime / 40;
    });
    return null;
}


function CountryBorders({ globeRef }) {
    const [geoData, setGeoData] = useState(null);
    const linesRef = useRef();

    console.log("border render");
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

        const radius = 1.0055; //set radius so it's on top of globle

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



    //console.log("label render");
    //country label offsets for manual adjustments
    const countryOffsets = {
        "United States of America": [0, 0, 0],
        "Norway": [0.05, -0.02, 0.02]
    };

    useEffect(() => {
        fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
            .then(response => response.json())
            .then(data => {
                setGeoData(data);
            })
            .catch(error => console.error('Error fetching GeoJSON:', error));
    }, []);

    //tracking camera distance for fixed-size label scaling optimization
    const [cameraDistance, setCameraDistance] = useState(0);
    useFrame(() => {
        if (labelsRef.current && globeRef.current) {
            labelsRef.current.rotation.copy(globeRef.current.rotation);
        }

        //updating camera distance for label size calculation
        if (camera) {
            const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
            setCameraDistance(distance);
        }
    });

    //center calculation for polygons (useMemo or similar later to optimize)
    const calculatePolygonCentroid = (polygon) => {
        //check if polygon is valid
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

        //check if area is close to zero to avoid division by zero
        if (Math.abs(area) < 1e-10) {
            //fallback to simple average if the area is too small
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
    const radius = 1.0005; //slightly larger than the border radius to avoid z-fighting

    //which countries to display with priority
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

    //determine if a country should be visible based on zoom level
    const shouldShowLabel = (countryName, countryArea) => {
        //show chosen countries from visibleCountriesBySize
        if (visibleCountriesBySize.has(countryName)) {
            return true;
        }

        //show medium countries when zoomed in a bit
        if (countryArea > 10 && cameraDistance < 2.5) {
            return true;
        }

        //show rest of countries when zoomed in more finally
        if (cameraDistance < 1.5) {
            return true;
        }

        return false;
    };

    geoData.features.forEach((feature, index) => {
        const countryName = feature.properties.ADMIN || feature.properties.name;
        let centroid;
        let countryArea = 0;

        //calculate approximate country area for filtering
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

        //only show labels that pass visibility filter
        if (centroid && shouldShowLabel(countryName, countryArea)) {
            // Convert centroid to 3D position
            const lon = THREE.MathUtils.degToRad(centroid[0]) + Math.PI / 2;
            const lat = THREE.MathUtils.degToRad(centroid[1]);

            let x = radius * Math.cos(lat) * Math.sin(lon);
            let y = radius * Math.sin(lat);
            let z = radius * Math.cos(lat) * Math.cos(lon);

            //apply country-specific offset if available
            if (countryOffsets[countryName]) {
                const [offsetX, offsetY, offsetZ] = countryOffsets[countryName];
                x += offsetX;
                y += offsetY;
                z += offsetZ;
            }

            //calculate label size based on country importance and fixed size
            const fontSize = visibleCountriesBySize.has(countryName) ?
                "text-lg" : "text-xs"; // You could vary this if desired

            //use drei Html to add label
            labels.push(
                <Html
                    key={`label-${index}`}
                    position={[x, y, z]}
                    occlude={[globeRef]}
                    sprite
                    center
                    transform
                    distanceFactor={0.8}
                    style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                        //handle sizing manually
                        //scale based on zoom level if needed (you can adjust the formula)
                        transform: `scale(${(Math.max(0, cameraDistance)) / 6})`, //inverse resizing based on camera distance
                    }}
                >
                    <div className={`text-white ${fontSize} bg-black bg-opacity-50 px-1 py-0.5 rounded`}>
                        {countryName}
                    </div>
                </Html>
            );
        }
    });

    return <group ref={labelsRef}>{labels}</group>;
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



export default GlobeTest;