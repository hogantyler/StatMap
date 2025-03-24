// Import dependencies
import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { Canvas, useFrame, useLoader, useThree, Html, Texts } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import * as THREE from 'three';
import ConicPolygonGeometry from 'three-conic-polygon-geometry';
import highResEarthTexture from "../../textures/8k_earth.png";
import { polygonCentroid } from "d3-polygon";

//drawing countries on a globe using conical projections of polygons from here: https://github.com/vasturiano/three-conic-polygon-geometry

function CountryPolygons({ geoData, globeRef }) {
    const [meshes, setMeshes] = useState([]);
    const [names, setNames] = useState([]);
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        if (!geoData) return;

        {/*const materials = [
            new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'white', opacity: 0.2, transparent: true }), // side material
            new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'red', opacity: 0.7, transparent: true }), // bottom cap material
            new THREE.MeshBasicMaterial({ color: 'red', opacity: 0.7, transparent: true, wireframe: true }) // top cap material
        ];*/}

        const newCountries = [];
        //const newMeshes = [];
        //const newNames = [];
        geoData.features.forEach(({ properties, geometry }) => {
            //const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
            const polygons = [geometry.coordinates];
            const countryName = properties.ADMIN;
            console.log(`Processing country: ${countryName}. Geometry type: ${geometry.type}. Polygon: ${polygons}`);

            //console.log(newNames);
            const alt = 1.003; // Height/altitude
            //console.log(polygons);

            polygons.forEach((coords, index) => {
                //console.log(properties.ADMIN);
                //newNames.push(properties.ADMIN);
                //console.log(newNames)
                //const geometry = new ConicPolygonGeometry(coords, 0, alt, true, true, true, 1);
                //const mesh = new THREE.Mesh(geometry, materials);
                //mesh.addEventListener('click', () => console.log("clicked"));
                //newMeshes.push(mesh);
                //console.log(coords);
                //console.log(coords.length)

                newCountries.push({ name: countryName, coords: coords, altitude: alt, id: `${countryName}-${index}`, type: geometry.type });
            });
        });
        console.log('useeffect');
        //setNames(newNames);
        //setMeshes(newMeshes);
        setCountries(newCountries);
    }, []);
    console.log('polygons');
    {/*{meshes.map((mesh, index) => (
                <primitive key={index} object={mesh} />
                
            ))} */}

    return (
        <>
            {countries.map((country) => (
                <Country key={country.id} name={country.name} coords={country.coords} altitude={country.altitude} globeRef={globeRef} type={country.type} />
            ))}
        </>
    );
}

function Country({ name, coords, altitude, globeRef, type }) {
    console.log("country");
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [visible, setVisible] = useState(false);
    const countryRef = useRef();

    const color = clicked ? 'green' : (hovered ? 'white' : 'purple');
    const show = clicked ? true : (hovered ? true : false);
    const raise = clicked ? 0.03 : (hovered ? 0 : 0);

    //const geometry = new ConicPolygonGeometry(coords, (0.99), (altitude + raise), true, true, true, 5);
    const geometry = [];
    if (type === 'Polygon') {
        geometry.push(new ConicPolygonGeometry(coords, (0.99), (altitude + raise), true, true, true, 5));
    } else {
        coords.forEach((coord) => {
            geometry.push(new ConicPolygonGeometry(coord, (0.99), (altitude + raise), true, true, true, 5));
        });
    }

    const materials = [
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: color, opacity: 0.5, transparent: true, visible: show }), // side material
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'yellow', opacity: 0.5, transparent: true, visible: show }), // bottom cap material
        new THREE.MeshBasicMaterial({ color: color, opacity: 0.5, transparent: true, wireframe: false, visible: show }) // top cap material
    ];
    const handleClick = (event) => {
        event.stopPropagation();
        setClicked(!clicked);
        //setVisible(!visible);
        console.log(`selected on ${name}`);
        //alert(`selected on ${name}`);
    };
    const handlePointerOver = (event) => {
        event.stopPropagation();
        setHovered(true);
        //setVisible(true);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = (event) => {
        event.stopPropagation();
        setHovered(false);
        //setVisible(false);
        document.body.style.cursor = 'auto';
    };

    useFrame(() => {
        if (countryRef.current && globeRef.current) {
            countryRef.current.rotation.copy(globeRef.current.rotation);
        }
    });

    {/* maybe for performance issues later
    useEffect(() => {
        if (countryRef.current) {
            countryRef.current.material[0].color.set(color);
        }
    }, [hovered, clicked, color, visible]);*/}

    //const edges = new THREE.EdgesGeometry(geometry);
    return (
        <group ref={countryRef}>
            {geometry.map((geo, index) => (
                <mesh
                key={`${name}-${index}`}
                    onClick={handleClick}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                >
                    <primitive object={geo} attach="geometry" />
                    <primitive object={materials[0]} attach="material-0" />
                    <primitive object={materials[1]} attach="material-1" />
                    <primitive object={materials[2]} attach="material-2" />
                </mesh>
            ))}
        </group>

    )

}

function ConicGlobe({ globeRef }) {
    const [geoData, setGeoData] = useState(null);
    //https://raw.githubusercontent.com/vasturiano/three-conic-polygon-geometry/refs/heads/master/example/geojson/ne_110m_admin_0_countries.geojson
    // Load GeoJSON data
    useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/three-conic-polygon-geometry/refs/heads/master/example/geojson/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error('Error loading GeoJSON:', err));
        console.log('fetch');
        //console.log(geoData);
    }, []);
    console.log('conicglobe');
    //console.log(geoData)

    return (
        <>
            {/* Load country polygons */}
            {geoData && <CountryPolygons geoData={geoData} globeRef={globeRef} />}
        </>

    );
}

export default ConicGlobe;
