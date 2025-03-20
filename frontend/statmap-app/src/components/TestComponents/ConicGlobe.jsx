// Import dependencies
import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import * as THREE from 'three';
import ConicPolygonGeometry from 'three-conic-polygon-geometry';
import highResEarthTexture from "../../textures/8k_earth.png";

function Globe(props) {
    // texture loading
    const globeRef = useRef();
    const texture = new THREE.TextureLoader().load(highResEarthTexture, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        texture.offset.x = (Math.PI / 2) / (2 * Math.PI);
    }, undefined, (err) => {
        console.error("Error loading texture:", err);
    });

    return (
        <mesh ref={globeRef}>
            <sphereGeometry args={[1, 38, 38]} />
            <meshStandardMaterial map={texture} roughness={1} />
        </mesh>
    );
}

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
            const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
            const countryName = properties.ADMIN;

            //console.log(newNames);
            const alt = 1.005; // Height/altitude
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
                newCountries.push({ name: countryName, coords: coords, altitude: alt, id: `${countryName}-${index}` });
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
                <Country key={country.id} name={country.name} coords={country.coords} altitude={country.altitude} globeRef={globeRef} />
            ))}
        </>
    );
}

function Country({ name, coords, altitude, globeRef }) {
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [visible, setVisible] = useState(false);
    const countryRef = useRef();
    const color = clicked ? 'green' : (hovered ? 'blue' : 'white');
    const show = clicked ? true : (hovered ? true : false);

    const geometry = new ConicPolygonGeometry(coords, 0.9, altitude, true, true, true, 1);
    const materials = [
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: color, opacity: 0.5, transparent: true }), // side material
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'red', opacity: 0.7, transparent: true, visible: false }), // bottom cap material
        new THREE.MeshBasicMaterial({ color: color, opacity: 0.3, transparent: true, wireframe: false, visible: show }) // top cap material
    ];
    const handleClick = (event) => {
        event.stopPropagation();
        setClicked(!clicked);
        setVisible(!visible);
        console.log(`Clicked on ${name}`);
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

    const edges = new THREE.EdgesGeometry(geometry);
    return (

        <mesh
            ref={countryRef}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            <primitive object={geometry} attach="geometry" />
            <primitive object={materials[0]} attach="material-0" />
            <primitive object={materials[1]} attach="material-1" />
            <primitive object={materials[2]} attach="material-2" />

        </mesh>
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
    }, []);
    console.log('conicglobe');
    console.log(geoData)

    return (
        <>
            {/* Load country polygons */}
            {geoData && <CountryPolygons geoData={geoData} globeRef={globeRef}/>}
        </>

    );
}

export default ConicGlobe;
