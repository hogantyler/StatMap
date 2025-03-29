// Import dependencies
import React, { useRef, useEffect, useState, forwardRef, memo, useMemo, useCallback } from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import ConicPolygonGeometry from 'three-conic-polygon-geometry';
import { polygonCentroid } from "d3-polygon";

//drawing countries on a globe using conical projections of polygons from here: https://github.com/vasturiano/three-conic-polygon-geometry

function CountryPolygons({ geoData, globeRef }) {
    const [meshes, setMeshes] = useState([]);
    const [names, setNames] = useState([]);
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const polygonsRef = useRef();

    const handleCountrySelect = (countryId) => {
        setSelectedCountry(prevSelected =>
            prevSelected === countryId ? null : countryId
        );
    };

    useEffect(() => {
        if (!geoData) return;

        const newCountries = [];

        geoData.features.forEach(({ properties, geometry }) => {
            //const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
            const polygons = [geometry.coordinates];
            const countryName = properties.ADMIN;
            const iso_a3 = properties.ISO_A3;
            const alt = 1.003; // Height/altitude 1.003
            //console.log(countryName, iso_a3);

            polygons.forEach((coords, index) => {
                //console.log(newNames)
                //const geometry = new ConicPolygonGeometry(coords, 0, alt, true, true, true, 1);
                //const mesh = new THREE.Mesh(geometry, materials);
                //newMeshes.push(mesh);

                newCountries.push({ name: countryName, coords: coords, altitude: alt, id: `${countryName}-${index}`, iso: iso_a3, type: geometry.type });
            });
        });
        console.log('loading polygons');
        //setNames(newNames);
        //setMeshes(newMeshes);
        setCountries(newCountries);
    }, []);
    console.log('country polygons');

    useFrame(() => {
        if (polygonsRef.current && globeRef.current) {
            polygonsRef.current.rotation.copy(globeRef.current.rotation);
        }
    });

    return (
        <>
            <group ref={polygonsRef}>
                {countries.map((country) => (
                    <Country
                        key={country.id}
                        name={country.name}
                        coords={country.coords}
                        altitude={country.altitude}
                        type={country.type}
                        iso={country.iso}
                        isSelected={selectedCountry === country.id}
                        onSelect={() => handleCountrySelect(country.id)}
                    />
                ))}
            </group>

        </>
    );
}

const Country = memo(function Country({ name, coords, altitude, type, iso, isSelected, onSelect }) {
    console.log("country");
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [visible, setVisible] = useState(false);
    const countryRef = useRef();
    

    const { color, show, raise } = useMemo(() => ({
        color: isSelected ? 'green' : (hovered ? 'white' : 'purple'),
        show: isSelected || hovered,
        raise: isSelected ? 0.03 : (hovered ? 0 : 0)
    }), [isSelected, hovered]);

    //const geometry = new ConicPolygonGeometry(coords, (0.99), (altitude + raise), true, true, true, 5);
    const geometry = useMemo(() => {
        //console.log("memo render");
        if (type === 'Polygon') {
            return [new ConicPolygonGeometry(coords, (0.99), (altitude + raise), false, true, true, 5)];
        } else {
            return coords.map(coord =>
                new ConicPolygonGeometry(coord, (0.99), (altitude + raise), false, true, true, 5)
            );
        }
    }, [coords, altitude, raise, type]);

    const materials = useMemo(() => [ //side material
        new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: color,
            opacity: 0.3,
            transparent: true,
            wireframe: false,
            visible: show
        }),
        new THREE.MeshBasicMaterial({ //top material
            side: THREE.DoubleSide,
            color: color,
            opacity: 0.3,
            transparent: true,
            wireframe: false,
            visible: show
        }),
        new THREE.MeshBasicMaterial({ //bottom material
            side: THREE.DoubleSide,
            color: color,
            opacity: 0.3,
            transparent: true,
            wireframe: false,
            visible: show
        })
    ], [color, show]);

    const handleClick = useCallback((event) => {
        event.stopPropagation();
        //setClicked(prev => !prev);
        onSelect();
        console.log(`selected on ${name}`);
    }, [name]);

    const handlePointerOver = useCallback((event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
    }, []);

    const handlePointerOut = useCallback((event) => {
        event.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
    }, []);

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

}, (prevProps, nextProps) => {
    //comparison function - only re-render if these conditions change
    return (
        prevProps.isSelected === nextProps.isSelected
    );
});

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
